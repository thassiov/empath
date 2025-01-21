# The project

## Structure and requirements

### Node
This project runs on node version 20 (LTS)

### Code
Code related to the core functionality, database and aws services are separated into their own directories. The AWS related code is inside `./src/infra/aws/`; the code/configuration related to the Postgres DB is inside `./src/infra/database/postgres/`; everything else is the core functionality, like the `services` and `repositories`.

### SST
This project is running the version `3` of SST.
In the `sst.config.ts` there are a few resources configured. They are:

- vpc (mostly to run the postgres inside of),
- rds postgres instance*,
- devcommand: it runs the db migration to setup the table that we are going to use
- dynamodb table for the random number services
- api gateway to link the functions
- lambda to generate a random number
- lambda to retrieve the logs of random numbers
- lambda to store unstructured data (json)

### Docker compose
The docker compose file has the configuration for a local postgres db with some volumes. They are:
- .pg/data:/var/lib/postgresql/data/ - holds the data
- .pg/socket:/var/run/postgresql - the directory for the unix socket that is used to test if the db is ready to receive connections (this is for the migration script to work - refer to the 'the database migration' section below)

Both volumes will be created in the root of the project as soon as `docker-compose up` is run.

#### The functions
All three of them have the same structure: a logger, a service that runs the business logic and a simple error handling `try/catch` block to deal with possible problems. Everything important is logged (operation success and errors). No much else is inside of them in terms of logic as all of it is inside their related services and repositories.

##### GET /random or create-random-number-record.function
Generates a new random number and stores it in the dynamodb table with a [timestamp as ISO string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString). The number is always between 0 and 1_000_000_000_000.

##### GET /random/logs or get-last-random-numbers.function
Retrieves the latest renerated numbers, without their timestamp, as a list of objects. Returns empty if there's no data to be retrieved.

##### POST /data or store-unstructured-data.function
Stores a JSON received as payload in a RDS Postgres table. Fails if the payload is not a valid json.

#### The storage

##### RDS Instance
It is a Postgres instance that has a single table, `unstructured_data`. with three columns: the auto generated id and created_at, and a jsonb column that receives the json as string.

###### *Docker as the prefered method to run the project right now
During testing, SST had a hard time deploying (and removing!) the RDS instance. When running `sst dev`, it just hang when creating the database. I had to kill the process and try again after manually having th remove the resources it already created at the RDS dashboard (including the database itself?!). Same thing for the `sst remove` command. I don't know what was the cause, but after trying for some time, I figured that the best way to make this project run is to make it use the docker container I have configured at the `docker-compose` file.

###### The database migration
The migration (`wait-on-pg-and-run-migration` script in package.json) is run in two steps:
- using `wait-on` we check if the postgres server is ready to receive connections by a exported unix socket from the container it is running from;
- make knex run the `big-bang` migration script that is stored in the codebase. It sets up the table we will use.

###### About knex, pg and esbuild driving me crazy
Initially I wanted to use knex for my sql needs as it is my go-to tool, but during the build process of the function I got stuck in a dependency problem in which esbuild removed knex (even after setting it as external in the configs), making the build break. I still use knex in the project to run the migration to setup the db, but for the insert query I go with PG. If I had more time available I would troubleshoot this problem, but I wanted to deliver the project.

##### Dynamo Table
The table was created with the following fields
- `p`, a string that serves as the primary index parititon key,
- `timestamp`, a string that serves as the primary index sort key.

The `randomNumber` value is stored as a string directly, without the need to be listed in the `fields` object.

###### About `p` and its purpose (and the challenges)
To be able to `query` the dynamo table the way the challenge requested, I choose to fix the value of `p` (as in 'partititon') with a single hardcoded _null character_ and to make the sort using the timestamp. The null character was choosen as it was the smallest character available in the UTF8 table that I could find. As it does not serve a purpose other than to make the query work, but still having to store it, it made sense to reduce its impact on disk.
This solution was choosen because `scan`ing the whole table is a no-go, and trying to solve it by using a GSI didn't sound as a good idea because it would duplicate the data and somebody would have to pay for it.
This brings the problem of "hot partition", but we have [adaptive capacity available](https://aws.amazon.com/blogs/database/how-amazon-dynamodb-adaptive-capacity-accommodates-uneven-data-access-patterns-or-why-what-you-know-about-dynamodb-might-be-outdated/), so it is not a problem.
Working with this kind of data and with this kind of business requirement was a challenge, and although the solution is not 100% in terms of "best practices", it does 100% of what was required.

## How to run the project

Make sure you have:
- Nodejs version 20 or newer
- docker compose
- is in a POSIX based system (I don't have Windows, so I don't know if the build will work there)
- have your AWS credentials where SST can read them (either env vars or the `$HOME/.aws` directory)

### Install the dependencies
```bash
npm install
```

### (Optional) Run unit tests
```bash
npm test
```

### Start the postgres container
```bash
docker compose up -d
```

### Start SST
```bash
sst dev
```

## How to use it
With the URL of the API Gateway that sst returned in hand, you can make three kinds of requests.

### Renerating a new random number
```bash
curl https://<AWS-ADDR-RETURNED-BY-SST>/random
```

This will generate a new number and return it as follows with HTTP status 201:
```json
{ randomNumber: <number> }
```

### Retrieving the last 5 random numbers
```bash
curl https://<AWS-ADDR-RETURNED-BY-SST>/random/logs
```

This will query the dynamo table and return the latest numbers as follows with HTTP status 200:
```json
[
   { randomNumber: <number> },
   { randomNumber: <number> },
   { randomNumber: <number> },
   { randomNumber: <number> },
   { randomNumber: <number> }
]
```
### Storing unstructured data in the database
```bash
curl --header "Content-Type: application/json" --request POST --data '{}' https://<AWS-ADDR-RETURNED-BY-SST>/data
```

Sending an invalid value as data (non JSON structure) or an empty payload will result in an error being returned.

This will return the id (uuidv4) of the stored data:
```json
{ id: <string> }
```

*IMPORTANT: This project is not deployed at AWS at the moment.*

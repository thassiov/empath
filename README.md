# Take-Home Test: Setting Up a Node.js SST Application

## Objective
Build a **Node.js-based** Serverless Stack (SST) application that utilizes AWS to create a REST API with multiple endpoints, including functionality to log data in DynamoDB. Deployment to AWS is optional but strongly encouraged for candidates with access to AWS accounts.

---

## Requirements

1. **Framework:** Use **Serverless Stack (SST)** for the project.
2. **Programming Language:** The application must be written in **Node.js**.
3. **AWS Integration:** Deploy the application to AWS using SST (optional if the candidate doesn’t have AWS access). If deployed, include details for accessing the deployed API.
4. **Functionality:**
   - Create a REST API with the following routes:
     - `GET /random`: Generates and returns a random number in JSON format (e.g., `{"randomNumber": 42}`).
     - `GET /random/logs`: Retrieves the last 5 generated random numbers stored in DynamoDB.
5. **Database Integration:**
   - Use **AWS DynamoDB** to log each random number with a timestamp when `/random` is called.
6. **Code Quality:**
   - Write clean, modular Node.js code with proper error handling and logging.
7. **Documentation:**
   - Include a `README.md` file that explains:
     - How to set up the project locally.
     - How to deploy the application using SST.
     - Details about the `/random` and `/random/logs` endpoints and their functionality.
     - If deployed to AWS, include the URL for accessing the API.
8. **Testing:**
   - Provide at least one unit test for the Lambda function using a Node.js testing framework (e.g., Jest).
9. **Version Control:**
   - Push the project to a GitHub repository (private or public). Share the link with instructions for accessing it.

---

## Bonus Points

- **RDS Integration:** Set up an **AWS RDS (Relational Database Service)** instance and add an additional endpoint:
  - `POST /data`: Accepts JSON input and stores it in the RDS database (e.g., MySQL or PostgreSQL).

---

## Deliverables

- A fully functional **Node.js-based** SST application, including DynamoDB integration.
- A GitHub repository link containing:
  - Source code.
  - Unit tests.
  - Documentation in the `README.md` file.
- For the bonus, include additional instructions for testing and deploying the `/data` route with RDS.
- If deployed to AWS, provide deployment details, including API URLs.

---

## Submission Guidelines

- Email the repository link to [Insert Contact Email Here].
- Ensure the repository has clear and detailed instructions for running, testing, and deploying the application locally.
- Include any notes or challenges faced during development.

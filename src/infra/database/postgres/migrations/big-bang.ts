import { Knex } from 'knex';
import { configs } from '../../../../lib/configs';

async function up(knex: Knex) {
  return knex.schema.createTable(
    configs.repository.data.tableName,
    function (table) {
      table.uuid('id').defaultTo(knex.fn.uuid()).primary();
      table.jsonb('data').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    }
  );
}

async function down(knex: Knex) {
  return knex.schema.dropTable(configs.repository.data.tableName);
}

const config = { transaction: false };

export { config, down, up };

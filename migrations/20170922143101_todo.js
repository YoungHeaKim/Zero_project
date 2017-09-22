
exports.up = function(knex, Promise) {
  return knex.schema.createTable('todo', t => {
    t.increments() // id
    t.string('title').notNullable()
    t.boolean('complete').defaultTo(false)
    t.integer('user_id').notNullable().unsigned()
    t.foreign('user_id').references('user_id')
    t.timestamp('create_at')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('todo')
};

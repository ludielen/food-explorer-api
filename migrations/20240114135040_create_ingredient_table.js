exports.up = knex => knex.schema.createTable("ingredient", table => {
    table.increments("id")
    table.text("name").notNullable()
    table.integer("plate_id").references("id").inTable("plate").onDelete("CASCADE")
});
  
exports.down = knex => knex.schema.dropTable("ingredient"); 
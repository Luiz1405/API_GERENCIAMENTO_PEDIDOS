const pool = require('./config');

async function inicializarBanco() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Order" (
        "orderId" VARCHAR(255) PRIMARY KEY,
        value DECIMAL(10, 2) NOT NULL,
        "creationDate" TIMESTAMP NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Items" (
        "orderId" VARCHAR(255) NOT NULL,
        "productId" VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tabelas criadas com sucesso');
  } catch (erro) {
    console.error('Erro ao criar tabelas:', erro);
    throw erro;
  }
}

module.exports = inicializarBanco;

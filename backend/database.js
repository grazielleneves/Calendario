const { Pool } = require('pg'); //Pool evita abrir várias conexões

const pool = new Pool({
  user: 'postgres',     // seu usuário do PostgreSQL
  host: 'localhost',
  database: 'mydatabase', // o nome do seu banco de dados
  password: 'GRAzi12@',   // a senha do seu usuário PostgreSQL
  port: 5432,              // a porta em que seu PostgreSQL está rodando (padrão é 5432)
});

module.exports = pool;

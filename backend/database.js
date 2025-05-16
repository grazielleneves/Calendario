const { Pool } = require('pg'); 

const pool = new Pool({
  user: 'postgres',     
  host: 'localhost',
  database: 'calendario', 
  password: 'GRAzi12@',
  port: 5432,          
});

module.exports = pool;

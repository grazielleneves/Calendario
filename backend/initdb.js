const fs = require('fs');
const path = require('path');
const pool = require('./database'); 

const initDb = async () => {
  const sql = fs.readFileSync(path.join(__dirname, 'database/schema.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('Banco de dados inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw error;
  }
};
module.exports = initDb; 

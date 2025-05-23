const express = require('express');
const initDb = require('./initdb');
const pool = require('./database');
const bodyParser = require('body-parser');
const app = express();
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const cors = require('cors');
require('dotenv').config();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, 
}));

initDb().then(() => {
  app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000');
    process.on('SIGINT', () => {
      pool.end(() => {
          console.log('Pool de conexões encerrado');
          process.exit(0);
      });
    });
  });
}).catch(err => {
  console.error('Falha ao iniciar o servidor devido ao erro no banco de dados:', err);
});

app.use(bodyParser.json());

app.use('/', userRoutes);
app.use('/', eventRoutes);

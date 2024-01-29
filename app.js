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
  credentials: true, // Permitir envio de cookies e credenciais de autenticação
}));

initDb().then(() => {
  app.listen(5000, () => {
    console.log('Servidor rodando na porta 5000');
    // Registrar ouvinte para fechar o pool de conexões quando o servidor terminar
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

// Middleware para processar dados JSON
app.use(bodyParser.json());

// Rotas de usuários e eventos
app.use('/', userRoutes);
app.use('/', eventRoutes);

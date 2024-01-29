const express = require('express');
const router = express.Router();
const pool = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Rota para cadastrar usuário
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Gera um salt aleatório e o hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Insere o usuário no banco de dados com a senha hash
    const result = await pool.query('INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *', [nome, email, senhaHash]);

    // Gera um token JWT
    const token = jwt.sign(
        { id: result.rows[0].id, nome: result.rows[0].nome, email: result.rows[0].email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // ou qualquer outro tempo que você considerar adequado
    );

    // Envia o token como resposta
    res.json({ user: result.rows[0], token });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro no servidor');
  }
});

// Rota para login
router.post('/login', async (req, res) => {
    try {
      const { email, senha } = req.body;
  
      // Buscar usuário no banco de dados
      const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  
      if (result.rows.length > 0) {
        const user = result.rows[0];
  
        // Comparar senha usando bcrypt
        const passwordMatch = await bcrypt.compare(senha, user.senha);
  
        if (passwordMatch) {
          // Gerar token JWT
          const token = jwt.sign({ usuario_id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
          res.json({ token });
        } else {
          res.status(401).send('Credenciais inválidas');
        }
      } else {
        res.status(401).send('Credenciais inválidas');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro no servidor');
    }
});

module.exports = router;

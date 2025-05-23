const express = require('express');
const router = express.Router();
const pool = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    console.log(`[REGISTER] Tentativa de cadastro para email: ${email}`);

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const result = await pool.query('INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *', [nome, email, senhaHash]);

    const token = jwt.sign(
        { id: result.rows[0].id, nome: result.rows[0].nome, email: result.rows[0].email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    console.log(`[REGISTER] Usuário ${email} cadastrado com sucesso.`);
    res.json({ user: result.rows[0], token });

  } catch (error) {
    console.error(`[REGISTER] Erro no servidor durante o cadastro para ${req.body.email}:`, error);
    res.status(500).send('Erro no servidor durante o cadastro');
  }
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    console.log(`[LOGIN] Tentativa de login para email: ${email}`);

    if (!email || !senha) {
        console.warn(`[LOGIN] Credenciais ausentes para tentativa de login. Email: ${email}, Senha fornecida: ${!!senha}`);
        return res.status(400).send('Email e senha são obrigatórios.');
    }

    try {
        console.log(`[LOGIN] Buscando usuário ${email} no banco de dados.`);
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) { 
            console.info(`[LOGIN] Falha no login para ${email}: Usuário não encontrado.`);
            return res.status(401).send('Usuário não encontrado.'); 
        }

        const user = result.rows[0];
        console.log(`[LOGIN] Usuário ${email} encontrado. Comparando senhas...`);

        const passwordMatch = await bcrypt.compare(senha, user.senha);

        if (!passwordMatch) { 
            console.info(`[LOGIN] Falha no login para ${email}: Senha incorreta.`);
            return res.status(401).send('Senha incorreta.'); 
        }

        console.log(`[LOGIN] Senha correta para ${email}. Gerando token JWT...`);

        if (!process.env.JWT_SECRET) {
            console.error('[LOGIN] JWT_SECRET não definido! Verifique suas variáveis de ambiente.');
            return res.status(500).send('Erro de configuração do servidor.');
        }

        const token = jwt.sign({ usuario_id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log(`[LOGIN] Login SUCESSO para ${email}. Token gerado.`);
        res.json({ token });

    } catch (error) {
        console.error(`[LOGIN] Erro INESPERADO durante o processo de login para ${email}:`, error);

        if (error.code === '28P01' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return res.status(500).send('Erro de conexão com o banco de dados. Tente novamente mais tarde.');
        }

        res.status(500).send('Erro interno do servidor. Por favor, tente novamente mais tarde.');
    }
});

module.exports = router;
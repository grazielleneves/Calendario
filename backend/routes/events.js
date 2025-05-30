const express = require('express');
const router = express.Router();
const pool = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
    return res.status(403).send('Um token é necessário para autenticação');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded;
  } catch (err) {
    return res.status(401).send('Token inválido');
  }
  return next();
};

router.post('/events', verificarToken, async (req, res) => {
  const { descricao, hora_inicio, hora_termino } = req.body;
  const usuario_id = req.user.usuario_id;

  try {
    const overlapCheck = await pool.query(
      'SELECT * FROM eventos WHERE usuario_id = $1 AND hora_inicio < $3 AND hora_termino > $2',
      [usuario_id, hora_inicio, hora_termino]
    );

    if (overlapCheck.rowCount > 0) { 
      
      return res.status(400).send('Evento conflitante já existe.');
    }

    const novoEvento = await pool.query(
      'INSERT INTO eventos (usuario_id, descricao, hora_inicio, hora_termino) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuario_id, descricao, hora_inicio, hora_termino]
    );

    res.json(novoEvento.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro no servidor ao adicionar evento');
  }
});

router.put('/events/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { descricao, hora_inicio, hora_termino } = req.body;
  const usuario_id = req.user.usuario_id;

  try {
    const overlapCheck = await pool.query(
        'SELECT * FROM eventos WHERE id != $1 AND usuario_id = $2 AND ((hora_inicio < $4 AND hora_termino > $3) OR (hora_inicio >= $3 AND hora_termino <= $4))',
        [id, usuario_id, hora_inicio, hora_termino]
     );
  
    if (overlapCheck.rowCount > 0) {
        return res.status(400).send('Evento conflitante já existe.');
    }
  
    const atualizarEvento = await pool.query(
      'UPDATE eventos SET descricao = $2, hora_inicio = $3, hora_termino = $4 WHERE id = $1 AND usuario_id = $5 RETURNING *',
      [id, descricao, hora_inicio, hora_termino, usuario_id]
    );

    if (atualizarEvento.rowCount == 0) {
      return res.status(404).send('Evento não encontrado ou usuário não corresponde.');
    }

    res.json(atualizarEvento.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro no servidor ao editar evento');
  }
});

router.delete('/events/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const usuario_id = req.user.usuario_id;

  try {
    const deletarEvento = await pool.query('DELETE FROM eventos WHERE id = $1 AND usuario_id = $2', [id, usuario_id]);

    if (deletarEvento.rowCount == 0) {
      return res.status(404).send('Evento não encontrado ou usuário não corresponde.');
    }

    res.send('Evento removido com sucesso.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro no servidor ao remover evento');
  }
});

router.get('/events', verificarToken, async (req, res) => {
  const usuario_id = req.user.usuario_id;

  try {
    const eventos = await pool.query('SELECT * FROM eventos WHERE usuario_id = $1', [usuario_id]);
    res.json(eventos.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro no servidor ao listar eventos');
  }
});

module.exports = router;

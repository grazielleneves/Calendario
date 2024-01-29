-- Criação de tabelas
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    senha VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    descricao TEXT,
    hora_inicio TIMESTAMP,
    hora_termino TIMESTAMP,
    usuario_id INTEGER REFERENCES usuarios(id)
);

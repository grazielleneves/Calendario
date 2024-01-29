# Documentação do Projeto de Calendário

## Visão Geral

Este projeto é uma aplicação de calendário onde os usuários podem registrar, editar e excluir eventos. Ele consiste em uma aplicação React no frontend e um servidor Node.js/Express no backend, com autenticação via JWT e armazenamento de dados em PostgreSQL.

## Backend

### Dependências Principais

- `express`: Framework para criar o servidor HTTP.
- `pg`: Cliente PostgreSQL para Node.js.
- `jsonwebtoken`: Implementação de JSON Web Tokens para autenticação.
- `bcrypt`: Biblioteca para ajudar a hashear senhas.

### Autenticação

O middleware `verificarToken` é utilizado para proteger as rotas que necessitam de autenticação, assegurando que somente usuários com tokens válidos possam acessá-las.

### Rotas

- `POST /events`: Adiciona um novo evento ao calendário do usuário autenticado.
- `PUT /events/:id`: Edita um evento existente pelo ID.
- `DELETE /events/:id`: Remove um evento pelo ID.
- `GET /events`: Lista todos os eventos do usuário autenticado.
- `POST /register`: Registra um novo usuário e gera um token JWT.
- `POST /login`: Autentica um usuário e gera um token JWT.

### Inicialização do Banco de Dados

O script `initdb.js` é responsável por inicializar o banco de dados, executando os comandos SQL definidos em `schema.sql`.

## Frontend

### Dependências Principais

- `react`: Biblioteca para construir a interface do usuário.
- `react-router-dom`: Coleção de componentes de navegação para aplicativos React.
- `react-big-calendar`: Componente de calendário para React.
- `axios`: Cliente HTTP baseado em promessas para o navegador e Node.js.

### Componentes Principais

- `App`: Componente raiz que configura o roteamento e renderiza os cabeçalhos e demais componentes da página.
- `MyCalendar`: Componente que renderiza o calendário e gerencia a lógica de adição, edição e remoção de eventos.
- `Register`: Formulário de registro de usuário.
- `Login`: Formulário de autenticação de usuário.

### Autenticação e Roteamento

A aplicação gerencia o estado de autenticação do usuário e apresenta rotas condicionais para "Login" e "Logout" no cabeçalho, utilizando o `react-router-dom` para a navegação entre diferentes partes da aplicação.

### Estilos

Os arquivos CSS correspondentes (`App.css`, `Login.css`, `Register.css`, `MyCalendar.css`) definem os estilos da aplicação.

## Execução do Projeto

### Backend

Para iniciar o servidor backend:

```bash
cd backend
npm install
node app.js
```

### Frontend

Para iniciar o servidor frontend:

```bash
cd frontend
cd meu-app-react
npm install
npm start


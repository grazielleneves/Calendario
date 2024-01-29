import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        senha
      });
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
        if (error.response) {
            // O servidor respondeu com um status fora do intervalo 2xx
            setErrorMessage("Seu e-mail ou senha estão incorretos");
        } else {
            // Outros erros relacionados à rede ou configuração
            setErrorMessage("Ocorreu um problema ao tentar fazer login");
        }
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite o e-mail"
          required
        />
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Digite a senha"
          required
        />
        {errorMessage && <div className="login-error">{errorMessage}</div>}
        <button type="submit">Entrar</button>
        <p>
          Não tem uma conta? <a href="/register">Faça o cadastro aqui</a>
        </p>
      </form>
    </div>
  );
};

export default Login;

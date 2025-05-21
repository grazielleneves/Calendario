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

    setErrorMessage(''); 
    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        senha
      });

      localStorage.setItem('token', response.data.token);
      navigate('/calendar'); 
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        const backendMessage = (data.message || data.error || '').toLowerCase();

        if (status === 401) { 
          if (backendMessage.includes('usuário não encontrado') || backendMessage.includes('user not found')) {
            setErrorMessage('Usuário não encontrado.');
          } else if (backendMessage.includes('senha incorreta') || backendMessage.includes('incorrect password')) {
            setErrorMessage('Senha incorreta.');
          } else {
            setErrorMessage('Usuário ou senha incorretos.');
          }
        } else if (status === 400) { 
          setErrorMessage(backendMessage || 'Dados inválidos. Verifique seu e-mail e senha.');
        } else if (status === 500) { 
          setErrorMessage('Erro interno do servidor. Tente novamente mais tarde.');
        } else {
          setErrorMessage(`Erro no servidor: ${status} - ${backendMessage || 'Erro desconhecido.'}`);
        }
      } else if (error.request) {
        setErrorMessage('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        setErrorMessage('Ocorreu um erro inesperado. Por favor, tente novamente.');
      }
      console.error('Erro no login:', error); // Para depuração no console do navegador
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

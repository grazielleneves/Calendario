import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; 
import './Register.css'; 

const Register = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/register', {
        nome,
        email,
        senha,
      });
      
      localStorage.setItem('token', response.data.token); 
      navigate('/login');
    } catch (error) {
      alert('Usuário já existe.');
      setError(error.response?.data || 'Ocorreu um erro no registro');
    }
  };

  return (
    <div className="register-container">
      <h2>Cadastro</h2>
      <form onSubmit={handleSubmit} className="register-form">
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
        <button type="submit">Cadastrar</button>
      </form>

      <p>
        Já tem uma conta?{' '}
        <Link to="/login">Faça login aqui</Link>
      </p>
    </div>
  );
};

export default Register;



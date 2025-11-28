
import React, { useState } from 'react';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // Sintaxe Compat
      await auth.signInWithEmailAndPassword(email, password);
      navigate('/anamnese');
    } catch (err: any) {
      setError('Falha no login. Verifique suas credenciais.');
      console.error(err);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Digite seu e-mail para recuperar a senha.');
      return;
    }
    try {
      await auth.sendPasswordResetEmail(email);
      setMessage('E-mail de recuperação enviado!');
      setError('');
    } catch (err) {
      setError('Erro ao enviar e-mail de recuperação.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acesse sua conta
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              {message && <div className="text-green-600 text-sm text-center">{message}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                >
                  Esqueceu sua senha?
                </button>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
              >
                Entrar
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/cadastro" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                Não tem uma conta? Crie agora.
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

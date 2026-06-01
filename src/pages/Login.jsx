import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, CheckCircle, Clock, Users } from 'lucide-react';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoadingLocal(true);

    try {
      const loggedUser = await login(email, senha);
      if (loggedUser?.tipo_usuario === 'responsavel') {
        navigate('/responsavel/portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErro(err.message || 'Erro ao fazer login');
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="login-page">
      {/* Branding Side */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="branding-logo">
            <Shield size={40} />
          </div>
          <h1>EduGuard</h1>
          <p>Sistema inteligente de gestão escolar infantil com segurança e transparência para toda a comunidade.</p>

          <div className="branding-features">
            <div className="branding-feature">
              <div className="branding-feature-icon"><CheckCircle size={18} /></div>
              <span>Check-in e check-out seguro com identificação</span>
            </div>
            <div className="branding-feature">
              <div className="branding-feature-icon"><Clock size={18} /></div>
              <span>Acompanhamento de rotina e medicação em tempo real</span>
            </div>
            <div className="branding-feature">
              <div className="branding-feature-icon"><Users size={18} /></div>
              <span>Comunicação direta entre escola e famílias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="login-form-side">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Acessar sistema</h2>
            <p>Entre com suas credenciais para continuar</p>
          </div>

          {erro && <div className="login-error">{erro}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={loadingLocal}>
              {loadingLocal ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

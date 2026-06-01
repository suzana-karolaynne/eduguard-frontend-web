import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, Clock, Pill,
  ClipboardList, Bell, LogOut, Menu, X, HeartHandshake,
  Briefcase, History, FileText, User, Shield, ChevronRight
} from 'lucide-react';
import './Layout.css';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDiretoria = ['diretor', 'coordenador', 'secretário', 'secretario'].includes(
    user?.funcao?.toLowerCase()
  );

  const mainMenuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/alunos', name: 'Alunos', icon: GraduationCap },
    { path: '/responsaveis', name: 'Famílias', icon: HeartHandshake },
    ...(isDiretoria ? [{ path: '/equipe', name: 'Equipe', icon: Briefcase }] : []),
    { path: '/turmas', name: 'Turmas', icon: Users },
  ];

  const operacoesMenuItems = [
    { path: '/ponto', name: 'Registro de Frequência', icon: Clock },
    { path: '/rotina', name: 'Rotina Diária', icon: ClipboardList },
    { path: '/medicacao', name: 'Medicação', icon: Pill },
    { path: '/avisos', name: 'Comunicados', icon: Bell },
  ];

  const consultasMenuItems = [
    { path: '/historico', name: 'Histórico', icon: History },
    ...(isDiretoria ? [{ path: '/logs', name: 'Logs do Sistema', icon: FileText }] : []),
  ];

  const userInitials = (user?.nome || user?.email || 'U')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const userName = user?.nome || user?.email?.split('@')[0] || 'Usuário';

  const API_BASE_URL = 'http://localhost:3000';
  const getFotoUrl = (foto) => {
    if (!foto) return null;
    const normalized = String(foto).replace(/\\/g, '/');
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;
    if (normalized.startsWith('/uploads')) return `${API_BASE_URL}${normalized}`;
    if (normalized.startsWith('uploads')) return `${API_BASE_URL}/${normalized}`;
    return `${API_BASE_URL}/uploads/fotos/${normalized}`;
  };

  const rawFoto = user?.foto_url || user?.foto || user?.Foto || null;
  const fotoUrl = getFotoUrl(rawFoto);

  const renderNavSection = (label, items) => (
    <>
      <div className="sidebar-section-label">{label}</div>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </>
  );

  return (
    <div className="layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Shield size={22} />
          </div>
          <div className="sidebar-brand">
            <h2>EduGuard</h2>
            <span>Gestão Escolar</span>
          </div>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto' }}>
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {renderNavSection('Principal', mainMenuItems)}
          {renderNavSection('Operações', operacoesMenuItems)}
          {renderNavSection('Consultas', consultasMenuItems)}
        </nav>

        {/* Footer with User Info */}
        <div className="sidebar-footer">
          <NavLink
            to="/perfil"
            className="sidebar-user"
            onClick={() => setSidebarOpen(false)}
            style={{ textDecoration: 'none' }}
          >
            {fotoUrl && (
              <img
                src={fotoUrl}
                alt={user?.nome || 'Usuário'}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  display: 'block'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement.querySelector('.fallback-avatar');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            )}
            <div
              className="fallback-avatar"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: fotoUrl ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'white',
                flexShrink: 0
              }}
            >
              {userInitials}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">{user?.funcao || 'Responsável'}</div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--sidebar-text)', opacity: 0.5 }} />
          </NavLink>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <h1 className="page-title">
              Olá, {userName.split(' ')[0]}! 👋
            </h1>
          </div>

          <div className="header-right">
            <span className="user-role">{user?.funcao || 'Responsável'}</span>
            <button className="btn-logout" onClick={handleLogout} title="Sair do sistema">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

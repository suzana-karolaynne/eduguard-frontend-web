import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Users, UserCheck, Bell, Clock, ClipboardList, ArrowRight, TrendingUp, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalTurmas: 0,
    presentesHoje: 0,
    avisosAtivos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [alunos, turmas, ponto, comunicacao] = await Promise.all([
          api.get('/alunos').catch(() => []),
          api.get('/turmas').catch(() => []),
          api.get(`/ponto?data=${new Date().toISOString().split('T')[0]}`).catch(() => []),
          api.get('/comunicacao').catch(() => [])
        ]);
        setStats({
          totalAlunos: Array.isArray(alunos) ? alunos.length : 0,
          totalTurmas: Array.isArray(turmas) ? turmas.length : 0,
          presentesHoje: Array.isArray(ponto) ? ponto.filter(p => (p.status || '').toUpperCase().includes('ENTRADA')).length : 0,
          avisosAtivos: Array.isArray(comunicacao) ? comunicacao.length : 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const userName = user?.nome?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário';
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  const statCards = [
    {
      title: 'Alunos Matriculados',
      value: stats.totalAlunos,
      subtitle: 'Total na instituição',
      icon: GraduationCap,
      color: '#0d9488',
      bg: 'rgba(13, 148, 136, 0.08)',
    },
    {
      title: 'Turmas Ativas',
      value: stats.totalTurmas,
      subtitle: 'Salas cadastradas',
      icon: Users,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.08)',
    },
    {
      title: 'Presentes Hoje',
      value: stats.presentesHoje,
      subtitle: 'Entradas registradas',
      icon: UserCheck,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.08)',
    },
    {
      title: 'Comunicados',
      value: stats.avisosAtivos,
      subtitle: 'Avisos publicados',
      icon: Bell,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.08)',
    },
  ];

  const quickLinks = [
    { to: '/ponto', title: 'Registrar Ponto', desc: 'Entrada e saída de alunos', icon: Clock, color: '#0d9488' },
    { to: '/rotina', title: 'Diário de Rotina', desc: 'Alimentação, higiene e sono', icon: ClipboardList, color: '#3b82f6' },
    { to: '/medicacao', title: 'Medicação', desc: 'Agendar e administrar', icon: Pill, color: '#8b5cf6' },
    { to: '/avisos', title: 'Comunicados', desc: 'Enviar avisos aos pais', icon: Bell, color: '#f59e0b' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
          {saudacao}, {userName}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Bem-vindo(a) ao painel de controle do EduGuard. Aqui está um resumo do dia.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {statCards.map((card) => (
          <div
            key={card.title}
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{card.title}</p>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                  {loading ? <div className="skeleton" style={{ width: '48px', height: '32px' }} /> : card.value}
                </div>
              </div>
              <div style={{
                width: '44px', height: '44px', borderRadius: 'var(--radius-lg)',
                background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <card.icon size={22} style={{ color: card.color }} />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Quick Access Grid */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
          <TrendingUp size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary)' }} />
          Acesso Rápido
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
                textDecoration: 'none', color: 'inherit',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = link.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: 'var(--radius-lg)',
                background: `${link.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <link.icon size={20} style={{ color: link.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{link.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{link.desc}</div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>
          ))}
        </div>
      </div>

      {/* Today Info */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clock size={20} style={{ color: 'var(--primary)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Data atual do sistema</div>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
          {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

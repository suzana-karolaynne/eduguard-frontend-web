import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { Shield, Save, CheckCircle } from 'lucide-react';

export const Perfil = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updatedProfile = await api.put('/auth/perfil', formData);
      updateUser(updatedProfile);
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

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

  const initials = (user?.nome || 'U')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Meu Perfil</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Visualize e atualize seus dados pessoais</p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {/* Avatar Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          {fotoUrl && (
            <img
              src={fotoUrl}
              alt={user?.nome || 'Usuário'}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'block'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement.querySelector('.fallback-avatar');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          )}
          <div className="fallback-avatar" style={{
            width: '64px', height: '64px', borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: fotoUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', fontWeight: 700, color: 'white',
          }}>
            {initials}
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {user?.nome || 'Usuário'}
            </h2>
            <span className="badge badge-primary" style={{ marginTop: '0.35rem' }}>
              <Shield size={12} /> {user?.funcao || user?.tipo || 'Usuário'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={{
            marginBottom: '1rem', padding: '0.75rem',
            backgroundColor: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem'
          }}>{error}</div>}

          {success && <div style={{
            marginBottom: '1rem', padding: '0.75rem',
            backgroundColor: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}><CheckCircle size={16} />{success}</div>}

          <FormInput label="Nome Completo" name="nome" value={formData.nome} onChange={handleInputChange} required />
          <FormInput label="E-mail" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
          <FormInput label="Telefone" name="telefone" value={formData.telefone} onChange={handleInputChange} placeholder="(00) 00000-0000" />

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" loading={saving}>
              <Save size={16} /> Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

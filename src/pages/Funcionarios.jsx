import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { Modal } from '../components/Modal';
import { Briefcase, UserPlus, Search, Edit2, ShieldOff } from 'lucide-react';
import { PAGE_STYLES } from '../constants/theme';

export const Funcionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', cpf: '', email: '', matricula: '', id_funcao: '', senha: '', data_nascimento: '', data_admissao: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchFuncionarios = async () => { try { setLoading(true); const data = await api.get('/usuarios'); setFuncionarios(data); } catch (err) { console.error('Erro ao buscar funcionários:', err); } finally { setLoading(false); } };
  useEffect(() => { fetchFuncionarios(); }, []);

  const handleInputChange = (e) => { const { name, value, files } = e.target; if (files) { setFormData(prev => ({ ...prev, [name]: files[0] })); } else { setFormData(prev => ({ ...prev, [name]: value })); } };
  const openCreateModal = () => { setEditingId(null); setFormData({ nome: '', cpf: '', email: '', matricula: '', id_funcao: '', senha: '', data_nascimento: '', data_admissao: '', foto: null }); setError(''); setIsModalOpen(true); };
  const openEditModal = (e, func) => { e.stopPropagation(); setEditingId(func.id); setFormData({ nome: func.nome, cpf: func.cpf, email: func.email, matricula: func.matricula, id_funcao: func.id_funcao, data_nascimento: func.data_nascimento ? func.data_nascimento.split('T')[0] : '', data_admissao: func.data_admissao ? func.data_admissao.split('T')[0] : '', senha: '', foto: null }); setError(''); setIsModalOpen(true); };
  const handleInativar = async (e, id) => { e.stopPropagation(); if(window.confirm('Tem certeza que deseja alterar o acesso deste funcionário?')) { try { await api.patch(`/usuarios/${id}/inativar`); fetchFuncionarios(); } catch(err) { alert(err.message); } } };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = new FormData();
      payload.append('nome', formData.nome); payload.append('cpf', formData.cpf);
      payload.append('email', formData.email); payload.append('matricula', formData.matricula);
      payload.append('id_funcao', formData.id_funcao);
      if (formData.senha) payload.append('senha', formData.senha);
      if (formData.data_nascimento) payload.append('data_nascimento', formData.data_nascimento);
      if (formData.data_admissao) payload.append('data_admissao', formData.data_admissao);
      if (formData.foto) payload.append('foto', formData.foto);
      if (editingId) { await api.put(`/usuarios/${editingId}`, payload); } else { await api.post('/usuarios', payload); }
      setIsModalOpen(false); fetchFuncionarios();
    } catch (err) { setError(err.message || 'Erro ao salvar funcionário'); } finally { setSaving(false); }
  };

  const filtered = funcionarios.filter(f =>
    (f.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.matricula || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Funcionário', render: (row) => {
      const getFotoUrl = (foto) => {
        if (!foto) return null;
        const normalized = String(foto).replace(/\\/g, '/');
        if (normalized.startsWith('http')) return normalized;
        if (normalized.startsWith('/uploads')) return `http://localhost:3000${normalized}`;
        if (normalized.startsWith('uploads')) return `http://localhost:3000/${normalized}`;
        return `http://localhost:3000/uploads/fotos/${normalized}`;
      };
      const fotoUrl = getFotoUrl(row.foto_url || row.foto || row.Foto);
      
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {fotoUrl && (
            <img
              src={fotoUrl}
              alt={row.nome}
              style={{
                width: '40px',
                height: '40px',
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
          <div
            className="fallback-avatar"
            style={{
              ...PAGE_STYLES.avatar(40),
              display: fotoUrl ? 'none' : 'flex'
            }}
          >
            {row.nome?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.nome}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
          </div>
        </div>
      );
    }},
    { header: 'Matrícula', render: (row) => row.matricula || row.matricula_funcionario || row.matriculafuncionario || row.MatriculaFuncionario || '-' },
    { header: 'Cargo', render: (row) => row.funcao_nome || row.funcao || '-' },
    { header: 'Status', render: (row) => (
      <span className={`badge ${row.ativo ? 'badge-success' : 'badge-danger'}`}>{row.ativo ? 'Ativo' : 'Inativo'}</span>
    )},
    { header: 'Ações', render: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button size="sm" variant="outline" onClick={(e) => openEditModal(e, row)}><Edit2 size={14} /></Button>
        <Button size="sm" variant="outline" onClick={(e) => handleInativar(e, row.id)} title={row.ativo ? "Desativar Acesso" : "Ativar Acesso"}>
          {row.ativo ? <ShieldOff size={14} /> : <UserPlus size={14} />}
        </Button>
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={PAGE_STYLES.pageTitle}>Equipe Escolar</h1>
          <p style={PAGE_STYLES.pageSubtitle}>Gerencie os professores, direção e funcionários</p>
        </div>
        <Button onClick={openCreateModal}><UserPlus size={16} /> Novo Funcionário</Button>
      </div>

      <div style={PAGE_STYLES.searchBar}>
        <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
        <input type="text" placeholder="Buscar por nome, email ou matrícula..." style={PAGE_STYLES.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="Nenhum funcionário encontrado." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? `Editar Funcionário (Matrícula: ${formData.matricula || '-'})` : "Cadastrar Funcionário"} size="lg">
        <form onSubmit={handleSubmit}>
          {error && <div style={PAGE_STYLES.errorBox}>{error}</div>}
          <FormInput label="Nome Completo" name="nome" value={formData.nome} onChange={handleInputChange} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput label="CPF" name="cpf" value={formData.cpf} onChange={handleInputChange} required />
            <FormInput label="Matrícula" name="matricula" value={formData.matricula} onChange={handleInputChange} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput label="Email de Acesso" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            <FormInput label="Senha de Acesso" name="senha" type="password" value={formData.senha} onChange={handleInputChange} required={!editingId} placeholder={editingId ? "Deixe em branco para manter" : ""} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput label="Cargo / Função" name="id_funcao" type="select" value={formData.id_funcao} onChange={handleInputChange} required
              options={[{value:'1',label:'Diretor'},{value:'2',label:'Coordenador'},{value:'3',label:'Professor'},{value:'4',label:'Porteiro'},{value:'5',label:'Secretário'}]} />
            <FormInput label="Foto de Perfil (Opcional)" name="foto" type="file" onChange={handleInputChange} accept="image/*" />
          </div>
          <div style={PAGE_STYLES.modalActions}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

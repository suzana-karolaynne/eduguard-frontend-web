import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { Modal } from '../components/Modal';
import { Pill, CalendarPlus, CheckSquare } from 'lucide-react';
import { PAGE_STYLES } from '../constants/theme';

export const Medicacao = () => {
  const [alunos, setAlunos] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState('');
  const [medicacoes, setMedicacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAgendarModalOpen, setIsAgendarModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ nome_medicamento: '', dosagem: '', frequencia: '', data_inicio: '', data_fim: '', observacao: '', receita: null });

  useEffect(() => { api.get('/alunos').then(res => setAlunos(res)).catch(() => {}); }, []);
  const fetchMedicacoes = async (idAluno) => { if (!idAluno) return; setLoading(true); try { const res = await api.get(`/medicacao/aluno/${idAluno}`); setMedicacoes(res); } catch (err) { console.error(err); } finally { setLoading(false); } };
  const handleAlunoChange = (e) => { const id = e.target.value; setSelectedAluno(id); fetchMedicacoes(id); };
  const handleInputChange = (e) => { const { name, value, files } = e.target; if (files) { setFormData(prev => ({ ...prev, [name]: files[0] })); } else { setFormData(prev => ({ ...prev, [name]: value })); } };

  const handleAgendarSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = new FormData();
      payload.append('id_aluno', selectedAluno);
      payload.append('nome_medicamento', formData.nome_medicamento);
      payload.append('dosagem', formData.dosagem);
      payload.append('frequencia', formData.frequencia);
      payload.append('data_inicio', formData.data_inicio);
      payload.append('data_fim', formData.data_fim);
      if (formData.observacao) payload.append('observacao', formData.observacao);
      if (formData.receita) payload.append('receita', formData.receita);
      await api.post('/medicacao/agendar', payload);
      setIsAgendarModalOpen(false);
      setFormData({ nome_medicamento: '', dosagem: '', frequencia: '', data_inicio: '', data_fim: '', observacao: '', receita: null });
      fetchMedicacoes(selectedAluno);
    } catch (err) { setError(err.message || 'Erro ao agendar medicação'); } finally { setSaving(false); }
  };

  const handleAdministerSubmit = async (e) => {
    e.preventDefault(); if (!selectedMed) return; setSaving(true);
    try { await api.post(`/medicacao/${selectedMed.id}/administrar`, { data_hora: new Date().toISOString() }); setIsAdminModalOpen(false); alert('Medicação registrada com sucesso!'); fetchMedicacoes(selectedAluno); } catch (err) { alert(err.message || 'Erro ao registrar administração'); } finally { setSaving(false); }
  };

  const openAdminModal = (med) => { setSelectedMed(med); setIsAdminModalOpen(true); };

  const columns = [
    { header: 'Medicamento', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={PAGE_STYLES.iconBox('#ec4899')}><Pill size={16} style={{ color: '#ec4899' }} /></div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.nome_medicamento}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.dosagem} • {row.frequencia}</div>
        </div>
      </div>
    )},
    { header: 'Período', render: (row) => (
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        {new Date(row.data_inicio).toLocaleDateString('pt-BR')} até {new Date(row.data_fim).toLocaleDateString('pt-BR')}
      </span>
    )},
    { header: 'Ações', render: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button size="sm" variant="outline" onClick={() => openAdminModal(row)}>
          <CheckSquare size={14} /> Registrar Dose
        </Button>
        {row.receita_url && (
          <Button size="sm" variant="outline" onClick={() => window.open(`http://localhost:3000${row.receita_url}`, '_blank')}>
            Ver Receita
          </Button>
        )}
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={PAGE_STYLES.iconBox('#ec4899')}><Pill style={{ color: '#ec4899' }} size={22} /></div>
          <div>
            <h1 style={PAGE_STYLES.pageTitle}>Controle de Medicação</h1>
            <p style={PAGE_STYLES.pageSubtitle}>Gerencie e administre remédios dos alunos</p>
          </div>
        </div>
        {selectedAluno && (
          <Button onClick={() => setIsAgendarModalOpen(true)}><CalendarPlus size={16} /> Cadastrar Remédio</Button>
        )}
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
          <FormInput label="Selecione um Aluno para ver suas medicações" name="aluno" type="select" value={selectedAluno} onChange={handleAlunoChange} options={alunos.filter(a => a.ativo).map(a => ({ value: a.id, label: a.nome }))} />
        </div>

        {selectedAluno ? (
          <DataTable columns={columns} data={medicacoes} loading={loading} emptyMessage="Nenhuma medicação cadastrada para este aluno." />
        ) : (
          <div className="empty-state">
            <Pill size={40} />
            <p>Escolha um aluno na lista acima para visualizar ou cadastrar medicamentos.</p>
          </div>
        )}
      </div>

      {/* Agendar Modal */}
      <Modal isOpen={isAgendarModalOpen} onClose={() => setIsAgendarModalOpen(false)} title="Cadastrar Novo Medicamento">
        <form onSubmit={handleAgendarSubmit}>
          {error && <div style={PAGE_STYLES.errorBox}>{error}</div>}
          <FormInput label="Nome do Medicamento" name="nome_medicamento" value={formData.nome_medicamento} onChange={handleInputChange} required placeholder="Ex: Dipirona Gotas" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput label="Dosagem" name="dosagem" value={formData.dosagem} onChange={handleInputChange} required placeholder="Ex: 5 gotas" />
            <FormInput label="Frequência" name="frequencia" value={formData.frequencia} onChange={handleInputChange} required placeholder="Ex: De 8 em 8 horas" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput label="Data de Início" name="data_inicio" type="date" value={formData.data_inicio} onChange={handleInputChange} required />
            <FormInput label="Data de Fim" name="data_fim" type="date" value={formData.data_fim} onChange={handleInputChange} required />
          </div>
          <FormInput label="Receita Médica (Obrigatório)" name="receita" type="file" onChange={handleInputChange} accept="image/*,application/pdf" required />
          <div style={PAGE_STYLES.modalActions}>
            <Button variant="outline" onClick={() => setIsAgendarModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Salvar Medicação</Button>
          </div>
        </form>
      </Modal>

      {/* Administrar Modal */}
      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title="Registrar Administração">
        <form onSubmit={handleAdministerSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Você está confirmando a administração de:</p>
            <div style={{ ...PAGE_STYLES.detailHeader, flexDirection: 'column', alignItems: 'flex-start', marginTop: '0.75rem', marginBottom: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{selectedMed?.nome_medicamento}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Dosagem: {selectedMed?.dosagem}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Data/Hora: {new Date().toLocaleString('pt-BR')}</div>
            </div>
          </div>
          <div style={PAGE_STYLES.modalActions}>
            <Button variant="outline" onClick={() => setIsAdminModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Confirmar Administração</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

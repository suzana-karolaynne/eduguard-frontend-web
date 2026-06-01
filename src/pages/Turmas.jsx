import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { Modal } from '../components/Modal';
import { RoleGuard } from '../components/RoleGuard';
import { Users, Plus, Edit2, Link as LinkIcon, Trash2 } from 'lucide-react';
import { PAGE_STYLES } from '../constants/theme';

export const Turmas = () => {
  const [turmas, setTurmas] = useState([]);
  const [allAlunos, setAllAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [alunosVinculados, setAlunosVinculados] = useState([]);
  const [idAlunoVincular, setIdAlunoVincular] = useState('');
  const [formData, setFormData] = useState({ codigo_turma: '', capacidade_maxima: '', hora_ini: '', hora_fim: '', data_ini: '', id_funcionario_responsavel: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [professores, setProfessores] = useState([]);

  const fetchTurmas = async () => { try { setLoading(true); const data = await api.get('/turmas'); setTurmas(data); } catch (err) { console.error('Erro ao buscar turmas:', err); } finally { setLoading(false); } };
  const fetchAllAlunos = async () => { try { const data = await api.get('/alunos'); setAllAlunos(data); } catch(err) { console.error(err); } };
  const fetchProfessores = async () => { try { const data = await api.get('/usuarios'); setProfessores(data.filter(u => (u.funcao || u.funcao_nome || u.tipo || '').toLowerCase().includes('professor'))); } catch(err) { console.error(err); } };
  useEffect(() => { fetchTurmas(); fetchAllAlunos(); fetchProfessores(); }, []);

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const openCreateModal = () => { setEditingId(null); setFormData({ codigo_turma: '', capacidade_maxima: '', hora_ini: '', hora_fim: '', data_ini: '', id_funcionario_responsavel: '' }); setError(''); setIsModalOpen(true); };
  const openEditModal = (e, turma) => { e.stopPropagation(); setEditingId(turma.id); setFormData({ codigo_turma: turma.codigo_turma || turma.nome, capacidade_maxima: turma.capacidade_maxima, hora_ini: turma.hora_ini, hora_fim: turma.hora_fim, data_ini: turma.data_ini ? turma.data_ini.split('T')[0] : '', id_funcionario_responsavel: turma.id_funcionario_responsavel || turma.id_funcionario || '' }); setError(''); setIsModalOpen(true); };
  const openViewModal = async (turma) => { setSelectedTurma(turma); setIsViewModalOpen(true); try { const res = await api.get(`/turmas/${turma.id}`); setAlunosVinculados(res.alunos || []); } catch(err) { console.error(err); } };
  const handleSubmit = async (e) => { e.preventDefault(); setError(''); setSaving(true); try { if (editingId) { await api.put(`/turmas/${editingId}`, formData); } else { await api.post('/turmas', formData); } setIsModalOpen(false); fetchTurmas(); } catch (err) { setError(err.message || 'Erro ao salvar turma'); } finally { setSaving(false); } };
  const handleVincularAluno = async () => { if(!idAlunoVincular) return; try { await api.post(`/turmas/${selectedTurma.id}/alunos`, { id_aluno: idAlunoVincular }); const res = await api.get(`/turmas/${selectedTurma.id}`); setAlunosVinculados(res.alunos || []); setIdAlunoVincular(''); } catch(err) { alert(err.message); } };
  const handleDesvincularAluno = async (idAluno) => { try { await api.del(`/turmas/${selectedTurma.id}/alunos/${idAluno}`); const res = await api.get(`/turmas/${selectedTurma.id}`); setAlunosVinculados(res.alunos || []); } catch(err) { alert(err.message); } };

  const columns = [
    { header: 'Turma', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={PAGE_STYLES.iconBox('#10b981')}><Users size={18} style={{ color: '#10b981' }} /></div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.codigo_turma || row.nome}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.hora_ini} - {row.hora_fim}</div>
        </div>
      </div>
    )},
    { header: 'Professor', render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.professor_responsavel || row.professor_nome || '-'}</span> },
    { header: 'Capacidade', accessor: 'capacidade_maxima' },
    { header: 'Ações', render: (row) => (
      <RoleGuard allowedRoles={['diretor', 'coordenador', 'secretário']}>
        <Button size="sm" variant="outline" onClick={(e) => openEditModal(e, row)}><Edit2 size={16} /></Button>
      </RoleGuard>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={PAGE_STYLES.pageTitle}>Turmas</h1>
          <p style={PAGE_STYLES.pageSubtitle}>Gerencie as salas e grupos de alunos</p>
        </div>
        <RoleGuard allowedRoles={['diretor', 'coordenador', 'secretário']}>
          <Button onClick={openCreateModal}><Plus size={18} /> Nova Turma</Button>
        </RoleGuard>
      </div>

      <DataTable columns={columns} data={turmas} loading={loading} emptyMessage="Nenhuma turma cadastrada." onRowClick={openViewModal} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Turma" : "Criar Nova Turma"}>
        <form onSubmit={handleSubmit}>
          {error && <div style={PAGE_STYLES.errorBox}>{error}</div>}
          <FormInput label="Código da Turma" name="codigo_turma" value={formData.codigo_turma} onChange={handleInputChange} required placeholder="Ex: MAT-A" />
          <FormInput label="Professor Responsável" name="id_funcionario_responsavel" type="select" value={formData.id_funcionario_responsavel} onChange={handleInputChange} options={[{ value: '', label: 'Selecione um professor' }, ...professores.map(p => ({ value: p.id, label: p.nome }))]} />
          <FormInput label="Capacidade Máxima" name="capacidade_maxima" type="number" value={formData.capacidade_maxima} onChange={handleInputChange} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput label="Hora Início" name="hora_ini" type="time" value={formData.hora_ini} onChange={handleInputChange} required />
            <FormInput label="Hora Fim" name="hora_fim" type="time" value={formData.hora_fim} onChange={handleInputChange} required />
          </div>
          <FormInput label="Data de Início" name="data_ini" type="date" value={formData.data_ini} onChange={handleInputChange} />
          <div style={PAGE_STYLES.modalActions}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Salvar Turma</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalhes da Turma">
        {selectedTurma && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={PAGE_STYLES.detailHeader}>
              <div style={PAGE_STYLES.iconBox('#10b981')}><Users size={28} style={{ color: '#10b981' }} /></div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedTurma.codigo_turma || selectedTurma.nome}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Capacidade: {alunosVinculados.length} / {selectedTurma.capacidade_maxima}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Horário: {selectedTurma.hora_ini} - {selectedTurma.hora_fim}</p>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Alunos Matriculados</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                {alunosVinculados.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhum aluno vinculado a esta turma.</p>
                ) : alunosVinculados.map(aluno => (
                  <div key={aluno.id_aluno} style={PAGE_STYLES.listItem}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{aluno.nome_aluno}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matrícula: {aluno.matricula}</div>
                    </div>
                    <RoleGuard allowedRoles={['diretor', 'coordenador', 'secretário']}>
                      <button onClick={() => handleDesvincularAluno(aluno.id_aluno)} title="Remover da Turma" style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                    </RoleGuard>
                  </div>
                ))}
              </div>
              <RoleGuard allowedRoles={['diretor', 'coordenador', 'secretário']}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <FormInput label="Enturmar Aluno" name="novoAluno" type="select" value={idAlunoVincular} onChange={(e) => setIdAlunoVincular(e.target.value)} options={allAlunos.map(a => ({ value: a.id, label: `${a.nome} (${a.matricula})` }))} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <Button onClick={handleVincularAluno} disabled={!idAlunoVincular || alunosVinculados.length >= selectedTurma.capacidade_maxima}><LinkIcon size={16} /> Adicionar</Button>
                  </div>
                </div>
              </RoleGuard>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

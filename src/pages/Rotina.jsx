import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { ClipboardList, CheckCircle2, XCircle, Edit2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { PAGE_STYLES } from '../constants/theme';

export const Rotina = () => {
  const [alunos, setAlunos] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState('');
  const [rotinasDoDia, setRotinasDoDia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ tipo: 'Rotina de Alimentação', realizado: true, observacao: '' });
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({ id: null, realizado: true, observacao: '' });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => { api.get('/alunos').then(res => setAlunos(res)).catch(() => {}); }, []);

  const fetchRotinasDoAluno = async (idAluno) => { if (!idAluno) return; setLoading(true); try { const dataStr = new Date().toISOString().split('T')[0]; const res = await api.get(`/rotina/aluno/${idAluno}?data=${dataStr}`); setRotinasDoDia(res); } catch (err) { console.error(err); } finally { setLoading(false); } };
  const handleAlunoChange = (e) => { const id = e.target.value; setSelectedAluno(id); fetchRotinasDoAluno(id); };
  const handleSubmit = async (e) => { e.preventDefault(); if (!selectedAluno) return; setSaving(true); try { await api.post('/rotina', { id_aluno: selectedAluno, data: new Date().toISOString().split('T')[0], hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), ...formData }); setFormData({ ...formData, observacao: '' }); fetchRotinasDoAluno(selectedAluno); } catch (err) { alert(err.message); } finally { setSaving(false); } };
  const handleCorrigir = (rotina) => { setEditData({ id: rotina.id, realizado: rotina.realizado ?? rotina.rotinafeita ?? true, observacao: rotina.observacao || rotina.obsdenao || '' }); setEditModal(true); };
  const submitCorrecao = async (e) => { e.preventDefault(); setEditSaving(true); try { await api.put(`/rotina/${editData.id}`, { realizado: editData.realizado, observacao: editData.observacao }); setEditModal(false); fetchRotinasDoAluno(selectedAluno); } catch (err) { alert(err.message || 'Erro ao corrigir registro (RN-004: correção apenas no mesmo dia)'); } finally { setEditSaving(false); } };

  const rotinaTipos = [
    { value: 'Rotina de Alimentação', label: 'Alimentação' },
    { value: 'Rotina de Higiene', label: 'Higiene' },
    { value: 'Rotina de Sono', label: 'Sono/Soneca' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={PAGE_STYLES.iconBox('#0d9488')}><ClipboardList style={{ color: '#0d9488' }} size={22} /></div>
        <div>
          <h1 style={PAGE_STYLES.pageTitle}>Diário de Rotina</h1>
          <p style={PAGE_STYLES.pageSubtitle}>Registre alimentação, sono e higiene diária dos alunos</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Lado esquerdo: Formulário */}
        <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Novo Registro</h3>
          <FormInput label="Selecionar Aluno" name="aluno" type="select" value={selectedAluno} onChange={handleAlunoChange} options={alunos.filter(a => a.ativo).map(a => ({ value: a.id, label: a.nome }))} />

          {selectedAluno && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <FormInput label="Tipo de Atividade" name="tipo" type="select" value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})} options={rotinaTipos} />
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Status</label>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    <input type="radio" checked={formData.realizado === true} onChange={() => setFormData({...formData, realizado: true})} />
                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Realizado
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    <input type="radio" checked={formData.realizado === false} onChange={() => setFormData({...formData, realizado: false})} />
                    <XCircle size={16} style={{ color: 'var(--danger)' }} /> Não Realizado
                  </label>
                </div>
              </div>
              <FormInput label="Observação (Opcional)" name="observacao" type="textarea" value={formData.observacao} onChange={(e) => setFormData({...formData, observacao: e.target.value})} placeholder="Ex: Comeu tudo, recusou a sopa, dormiu 2h..." />
              <Button type="submit" loading={saving} fullWidth>Salvar Registro</Button>
            </form>
          )}
        </div>

        {/* Lado direito: Registros */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
            Registros de Hoje {selectedAluno ? 'do Aluno' : ''}
          </h3>

          {!selectedAluno ? (
            <div className="empty-state"><ClipboardList size={40} /><p>Selecione um aluno ao lado para ver ou adicionar rotinas.</p></div>
          ) : loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '60px' }} />)}
            </div>
          ) : rotinasDoDia.length === 0 ? (
            <div className="empty-state"><ClipboardList size={40} /><p>Nenhum registro para este aluno hoje.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {rotinasDoDia.map((rotina) => (
                <div key={rotina.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    {rotina.realizado ? <CheckCircle2 style={{ color: 'var(--success)' }} size={20} /> : <XCircle style={{ color: 'var(--danger)' }} size={20} />}
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{rotina.tipo}</div>
                      {rotina.observacao && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{rotina.observacao}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {rotina.data_hora ? new Date(rotina.data_hora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}) : (rotina.datahorasys ? new Date(rotina.datahorasys).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) : '')}
                    </span>
                    <button onClick={() => handleCorrigir(rotina)} title="Corrigir registro (RN-004)" style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Edit2 size={12} /> Corrigir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Corrigir Registro (RN-004)">
        <form onSubmit={submitCorrecao}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>⚠️ A correção só é permitida na mesma data de criação do registro.</p>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Status</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <input type="radio" checked={editData.realizado === true} onChange={() => setEditData({...editData, realizado: true})} />
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Realizado
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <input type="radio" checked={editData.realizado === false} onChange={() => setEditData({...editData, realizado: false})} />
                <XCircle size={16} style={{ color: 'var(--danger)' }} /> Não Realizado
              </label>
            </div>
          </div>
          <FormInput label="Observação" name="observacao" type="textarea" value={editData.observacao} onChange={(e) => setEditData({...editData, observacao: e.target.value})} placeholder="Motivo da correção..." />
          <div style={PAGE_STYLES.modalActions}>
            <Button variant="outline" onClick={() => setEditModal(false)}>Cancelar</Button>
            <Button type="submit" loading={editSaving}>Salvar Correção</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

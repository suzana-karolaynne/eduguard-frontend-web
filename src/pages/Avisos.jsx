import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { Modal } from '../components/Modal';
import { Bell, Plus, Megaphone, Edit2 } from 'lucide-react';
import { RoleGuard } from '../components/RoleGuard';
import { PAGE_STYLES } from '../constants/theme';

export const Avisos = () => {
  const [avisos, setAvisos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', conteudo: '', id_turma: '', tipo_destino: 'TODAS_TURMAS', id_aluno: '', responsaveis: [] });
  const [alunos, setAlunos] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);

  const avisosSeguros = Array.isArray(avisos) ? avisos : [];
  const turmasSeguras = Array.isArray(turmas) ? turmas : [];
  const alunosSeguros = Array.isArray(alunos) ? alunos : [];
  const responsaveisSeguros = Array.isArray(responsaveis) ? responsaveis : [];

  const fetchAvisos = async () => { setLoading(true); try { const res = await api.get('/comunicacao'); setAvisos(Array.isArray(res) ? res : res.comunicados || []); } catch (err) { console.error(err); } finally { setLoading(false); } };
  
  useEffect(() => { 
    fetchAvisos(); 
    api.get('/turmas').then(data => setTurmas(Array.isArray(data) ? data : [])).catch(() => {}); 
    api.get('/alunos').then(data => setAlunos(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const handleAlunoChange = async (e) => {
    const id = e.target.value;
    setFormData({...formData, id_aluno: id, responsaveis: []});
    if (id) {
      try {
        const res = await api.get(`/alunos/${id}`);
        setResponsaveis(res.responsaveis || []);
      } catch (err) {
        console.error(err);
      }
    } else {
      setResponsaveis([]);
    }
  };

  const handleResponsavelToggle = (respId) => {
    setFormData(prev => {
      const resp = prev.responsaveis || [];
      if (resp.includes(respId)) {
        return { ...prev, responsaveis: resp.filter(id => id !== respId) };
      } else {
        return { ...prev, responsaveis: [...resp, respId] };
      }
    });
  };

  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    setSaving(true); 
    try { 
      const payload = { ...formData };
      if (payload.tipo_destino === 'TODAS_TURMAS') {
        delete payload.id_turma;
        delete payload.id_aluno;
        delete payload.responsaveis;
      } else if (payload.tipo_destino === 'TURMA_ESPECIFICA') {
        delete payload.id_aluno;
        delete payload.responsaveis;
      } else if (payload.tipo_destino === 'RESPONSAVEIS_ESPECIFICOS') {
        delete payload.id_turma;
      }
      
      if (editingId) {
        await api.put(`/comunicacao/${editingId}`, payload);
      } else {
        await api.post('/comunicacao', payload); 
      }
      setIsModalOpen(false); 
      setFormData({ titulo: '', conteudo: '', id_turma: '', tipo_destino: 'TODAS_TURMAS', id_aluno: '', responsaveis: [] }); 
      setEditingId(null);
      fetchAvisos(); 
    } catch (err) { 
      alert(err.message || 'Erro ao publicar aviso'); 
    } finally { 
      setSaving(false); 
    } 
  };

  const handleEdit = (aviso) => {
    setEditingId(aviso.id);
    setFormData({
      titulo: aviso.titulo,
      conteudo: aviso.conteudo,
      id_turma: aviso.id_turma || '',
      tipo_destino: aviso.aluno_nome ? 'RESPONSAVEIS_ESPECIFICOS' : aviso.turma_nome ? 'TURMA_ESPECIFICA' : 'TODAS_TURMAS',
      id_aluno: aviso.id_aluno || '',
      responsaveis: aviso.responsaveis_ids || []
    });
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={PAGE_STYLES.iconBox('#8b5cf6')}><Megaphone style={{ color: '#8b5cf6' }} size={22} /></div>
          <div>
            <h1 style={PAGE_STYLES.pageTitle}>Avisos e Comunicados</h1>
            <p style={PAGE_STYLES.pageSubtitle}>Publique comunicados para os responsáveis</p>
          </div>
        </div>
        <RoleGuard allowedRoles={['diretor', 'coordenador', 'secretário', 'secretario', 'professor']}>
          <Button onClick={() => {
            setFormData({ titulo: '', conteudo: '', id_turma: '', tipo_destino: 'TODAS_TURMAS', id_aluno: '', responsaveis: [] });
            setResponsaveis([]);
            setEditingId(null);
            setIsModalOpen(true);
          }}><Plus size={16} /> Novo Comunicado</Button>
        </RoleGuard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: '200px' }} />)
        ) : avisosSeguros.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }} className="empty-state">
            <Bell size={48} />
            <p>Nenhum comunicado publicado no momento.</p>
          </div>
        ) : (
          avisosSeguros.map(aviso => {
            const titulo = aviso?.titulo || 'Aviso sem título';
            const mensagem = aviso?.conteudo || aviso?.descricao || '';
            const turmaNome = aviso?.turma || aviso?.turma_nome || aviso?.nome_turma || null;
            const alunoNome = aviso?.aluno_nome || aviso?.nome_aluno || null;
            const responsaveisStr = aviso?.responsaveis || '';

            return (
              <div key={aviso?.id || Math.random()} className="card" style={{
                padding: '1.5rem', display: 'flex', flexDirection: 'column',
                position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'var(--primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1rem' }}>{titulo}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <RoleGuard allowedRoles={['diretor', 'coordenador', 'secretário', 'secretario', 'professor']}>
                      <button onClick={() => handleEdit(aviso)} title="Editar Comunicado" style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <Edit2 size={16} />
                      </button>
                    </RoleGuard>
                    <Bell size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1, marginBottom: '1rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  {mensagem}
                </p>
                
                {alunoNome && responsaveisStr && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.75rem', padding: '0.5rem', backgroundColor: 'var(--bg-hover)', borderRadius: '6px' }}>
                    <strong>Criança:</strong> {alunoNome}<br/>
                    <strong>Responsáveis:</strong> {responsaveisStr}
                  </div>
                )}

                <div style={{ marginTop: '0.5rem', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Respostas dos responsáveis</h4>
                  {(() => {
                    const respostasSeguras = Array.isArray(aviso.respostas) ? aviso.respostas.filter(r => r !== null) : [];
                    if (respostasSeguras.length === 0) {
                      return <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nenhuma resposta registrada.</span>;
                    }
                    return respostasSeguras.map((resp, idx) => (
                      <div key={resp.id || idx} style={{ fontSize: '0.85rem', marginBottom: idx === respostasSeguras.length - 1 ? 0 : '0.5rem', paddingBottom: idx === respostasSeguras.length - 1 ? 0 : '0.5rem', borderBottom: idx === respostasSeguras.length - 1 ? 'none' : '1px solid var(--border)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{resp.nome_responsavel}</strong>
                        <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>"{resp.mensagem}"</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(resp.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    ));
                  })()}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <span className={`badge ${alunoNome ? 'badge-warning' : turmaNome ? 'badge-primary' : 'badge-info'}`}>
                    {alunoNome ? 'Responsáveis Específicos' : turmaNome ? turmaNome : 'Todas as turmas'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {aviso?.data_publicacao ? new Date(aviso.data_publicacao).toLocaleDateString('pt-BR') : '-'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publicar Novo Aviso">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <FormInput 
            label="Destino" 
            name="tipo_destino" 
            type="select" 
            value={formData.tipo_destino} 
            onChange={(e) => setFormData({...formData, tipo_destino: e.target.value})}
            options={[
              { value: 'TODAS_TURMAS', label: 'Todas as turmas' },
              { value: 'TURMA_ESPECIFICA', label: 'Turma específica' },
              { value: 'RESPONSAVEIS_ESPECIFICOS', label: 'Responsáveis específicos' }
            ]}
          />

          {formData.tipo_destino === 'TURMA_ESPECIFICA' && (
            <FormInput 
              label="Turma" 
              name="id_turma" 
              type="select" 
              value={formData.id_turma} 
              onChange={(e) => setFormData({...formData, id_turma: e.target.value})} 
              options={turmasSeguras.map(t => ({ value: String(t.id), label: t.codigo_turma || t.nome || `Turma ${t.id}` }))} 
              required
            />
          )}

          {formData.tipo_destino === 'RESPONSAVEIS_ESPECIFICOS' && (
            <>
              <FormInput 
                label="Criança" 
                name="id_aluno" 
                type="select" 
                value={formData.id_aluno} 
                onChange={handleAlunoChange} 
                options={alunosSeguros.map(a => ({ value: String(a.id), label: a.nome }))} 
                required
              />
              
              {formData.id_aluno && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Responsáveis</label>
                  {responsaveisSeguros.length > 0 ? responsaveisSeguros.map(resp => (
                    <label key={resp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <input 
                        type="checkbox" 
                        checked={(formData.responsaveis || []).includes(resp.id)}
                        onChange={() => handleResponsavelToggle(resp.id)}
                      />
                      {resp.nome} ({resp.parentesco || 'Responsável'})
                    </label>
                  )) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhuma pessoa responsável vinculada.</span>
                  )}
                </div>
              )}

            </>
          )}

          <FormInput label="Título do Aviso" name="titulo" value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} required placeholder="Ex: Reunião de Pais e Mestres" />
          <FormInput label="Conteúdo" name="conteudo" type="textarea" value={formData.conteudo} onChange={(e) => setFormData({...formData, conteudo: e.target.value})} required placeholder="Escreva os detalhes do aviso..." />
          
          <div style={PAGE_STYLES.modalActions}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Publicar Aviso</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

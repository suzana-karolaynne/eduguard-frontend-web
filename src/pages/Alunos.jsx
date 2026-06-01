import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { Modal } from '../components/Modal';
import { RoleGuard } from '../components/RoleGuard';
import { UserPlus, Search, Edit2, Eye, Link as LinkIcon, Trash2, Shield } from 'lucide-react';
import { PAGE_STYLES } from '../constants/theme';

export const Alunos = () => {
  const [alunos, setAlunos] = useState([]);
  const [allResponsaveis, setAllResponsaveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [responsaveisVinculados, setResponsaveisVinculados] = useState([]);
  const [idRespVincular, setIdRespVincular] = useState('');
  const [formData, setFormData] = useState({ nome: '', matricula: '', data_nascimento: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAlunos = async () => { try { setLoading(true); const data = await api.get('/alunos'); setAlunos(data); } catch (err) { console.error('Erro ao buscar alunos:', err); } finally { setLoading(false); } };
  const fetchResponsaveis = async () => { try { const data = await api.get('/responsaveis'); setAllResponsaveis(data); } catch(err) { console.error(err); } };
  useEffect(() => { fetchAlunos(); fetchResponsaveis(); }, []);

  const handleInputChange = (e) => { const { name, value, files } = e.target; if (files) { setFormData(prev => ({ ...prev, [name]: files[0] })); } else { setFormData(prev => ({ ...prev, [name]: value })); } };
  const openCreateModal = () => { setEditingId(null); setFormData({ nome: '', matricula: '', data_nascimento: '', foto: null }); setError(''); setIsModalOpen(true); };
  const openEditModal = (e, aluno) => { e.stopPropagation(); setEditingId(aluno.id); setFormData({ nome: aluno.nome, matricula: aluno.matricula, data_nascimento: aluno.data_nascimento ? aluno.data_nascimento.split('T')[0] : '', foto: null }); setError(''); setIsModalOpen(true); };
  const openViewModal = async (aluno) => { 
    setSelectedAluno(aluno); 
    setIsViewModalOpen(true); 
    try { 
      const res = await api.get(`/alunos/${aluno.id}`); 
      setSelectedAluno({ ...aluno, ...res });
      setResponsaveisVinculados(Array.isArray(res.responsaveis) ? res.responsaveis : []); 
    } catch(err) { 
      console.error(err); 
    } 
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = new FormData();
      payload.append('nome', formData.nome); payload.append('matricula', formData.matricula); payload.append('data_nascimento', formData.data_nascimento);
      if (formData.foto) payload.append('foto', formData.foto);
      if (editingId) { await api.put(`/alunos/${editingId}`, payload); } else { await api.post('/alunos', payload); }
      setIsModalOpen(false); fetchAlunos();
    } catch (err) { setError(err.message || 'Erro ao salvar aluno'); } finally { setSaving(false); }
  };

  const handleVincularResp = async () => { if(!idRespVincular) return; try { await api.post(`/alunos/${selectedAluno.id}/responsaveis`, { id_responsavel: idRespVincular }); const res = await api.get(`/alunos/${selectedAluno.id}`); setResponsaveisVinculados(res.responsaveis || []); setIdRespVincular(''); } catch(err) { alert(err.message); } };
  const handleDesvincularResp = async (idResp) => { try { await api.del(`/alunos/${selectedAluno.id}/responsaveis/${idResp}`); const res = await api.get(`/alunos/${selectedAluno.id}`); setResponsaveisVinculados(res.responsaveis || []); } catch(err) { alert(err.message); } };

  const filteredAlunos = alunos.filter(a =>
    (a.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.matricula || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const API_BASE_URL = 'http://localhost:3000';
  const getFotoUrl = (foto) => {
    if (!foto) return null;
    const normalized = String(foto).replace(/\\/g, '/').trim();
    if (!normalized) return null;
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;
    if (normalized.startsWith('/uploads')) return `${API_BASE_URL}${normalized}`;
    if (normalized.startsWith('uploads')) return `${API_BASE_URL}/${normalized}`;
    return `${API_BASE_URL}/uploads/fotos/${normalized}`;
  };

  const columns = [
    { header: 'Matrícula', accessor: 'matricula' },
    { header: 'Nome do Aluno', render: (row) => {
      const rawFoto = row.foto_url || row.foto || row.Foto || null;
      const fotoUrl = getFotoUrl(rawFoto);
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {fotoUrl ? (
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
                const fallback = e.currentTarget.nextSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            style={{
              ...PAGE_STYLES.avatar(40),
              display: fotoUrl ? 'none' : 'flex'
            }}
          >
            {row.nome?.substring(0, 2).toUpperCase()}
          </div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.nome}</div>
        </div>
      );
    }},
    { header: 'Data Nasc.', render: (row) => row.data_nascimento ? new Date(row.data_nascimento).toLocaleDateString('pt-BR') : '-' },
    { header: 'Status', render: (row) => (
      <span className={`badge ${row.ativo ? 'badge-success' : 'badge-danger'}`}>{row.ativo ? 'Ativo' : 'Inativo'}</span>
    )},
    { header: 'Ações', render: (row) => (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="outline" onClick={(e) => { e.stopPropagation(); openViewModal(row); }} style={{ padding: '0.25rem 0.5rem' }}>
          <Eye size={14} />
        </Button>
        <RoleGuard allowedRoles={['diretor', 'coordenador', 'secretário']}>
          <Button variant="outline" onClick={(e) => openEditModal(e, row)} style={{ padding: '0.25rem 0.5rem' }}>
            <Edit2 size={14} />
          </Button>
        </RoleGuard>
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={PAGE_STYLES.pageTitle}>Alunos</h1>
          <p style={PAGE_STYLES.pageSubtitle}>Gerencie os alunos cadastrados na instituição</p>
        </div>
        <RoleGuard allowedRoles={['diretor', 'coordenador', 'secretário']}>
          <Button onClick={openCreateModal}><UserPlus size={16} /> Novo Aluno</Button>
        </RoleGuard>
      </div>

      <div style={PAGE_STYLES.searchBar}>
        <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
        <input type="text" placeholder="Buscar por nome ou matrícula..." style={PAGE_STYLES.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <DataTable columns={columns} data={filteredAlunos} loading={loading} emptyMessage="Nenhum aluno encontrado." onRowClick={openViewModal} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Aluno" : "Cadastrar Novo Aluno"}>
        <form onSubmit={handleSubmit}>
          {error && <div style={PAGE_STYLES.errorBox}>{error}</div>}
          <FormInput label="Nome Completo" name="nome" value={formData.nome} onChange={handleInputChange} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput label="Matrícula" name="matricula" value={formData.matricula} onChange={handleInputChange} required />
            <FormInput label="Data de Nascimento" name="data_nascimento" type="date" value={formData.data_nascimento} onChange={handleInputChange} required />
          </div>
          <FormInput label="Foto do Aluno (Opcional)" name="foto" type="file" onChange={handleInputChange} accept="image/*" />
          <div style={PAGE_STYLES.modalActions}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Salvar Aluno</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Perfil do Aluno">
        {selectedAluno && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={PAGE_STYLES.detailHeader}>
              {(() => {
                const rawFotoAluno = selectedAluno?.foto_url || selectedAluno?.foto || selectedAluno?.Foto || null;
                const fotoAlunoUrl = getFotoUrl(rawFotoAluno);
                return (
                  <>
                    {fotoAlunoUrl ? (
                      <img
                        src={fotoAlunoUrl}
                        alt={selectedAluno?.nome || 'Aluno'}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          display: 'block',
                          flexShrink: 0
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        ...PAGE_STYLES.avatar(56),
                        display: fotoAlunoUrl ? 'none' : 'flex'
                      }}
                    >
                      {(selectedAluno?.nome || 'Aluno')
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join('')
                        .toUpperCase() || 'A'}
                    </div>
                  </>
                );
              })()}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedAluno.nome || 'Sem Nome'}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Matrícula: {selectedAluno.matricula}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Nasc: {selectedAluno.data_nascimento ? new Date(selectedAluno.data_nascimento).toLocaleDateString('pt-BR') : '-'}</p>
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Turma:</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedAluno.turma_nome || selectedAluno.turma?.nome || 'Não enturmado'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Professor(a):</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedAluno.professor_nome || selectedAluno.turma?.professor?.nome || '-'}
                </span>
              </div>
            </div>

            <div>
              <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Família (Responsáveis Vinculados)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {(!Array.isArray(responsaveisVinculados) || responsaveisVinculados.length === 0) ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhum responsável vinculado a este aluno.</p>
                ) : responsaveisVinculados.map(resp => {
                  const nomeResp = resp?.nome || resp?.Nome || 'Responsável';
                  const tipoResp = resp?.descricao_tipo || resp?.descricaotipo || resp?.tipo || resp?.parentesco || resp?.DescricaoTipo || '-';
                  const rawFoto = resp?.foto_url || resp?.foto || resp?.Foto || null;
                  const fotoUrl = getFotoUrl(rawFoto);
                  
                  const iniciaisResp = nomeResp
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join('')
                    .toUpperCase() || 'R';
                  
                  return (
                    <div key={resp?.id_responsavel || Math.random()} style={{ ...PAGE_STYLES.listItem, gap: '0.75rem' }}>
                      {fotoUrl ? (
                        <img
                          src={fotoUrl}
                          alt={nomeResp}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        style={{
                          ...PAGE_STYLES.avatar(32),
                          display: fotoUrl ? 'none' : 'flex'
                        }}
                      >
                        {iniciaisResp}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {nomeResp}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {tipoResp}
                        </div>
                        {resp?.autorizado_retirada && <div style={{ fontSize: '0.75rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Shield size={12} /> Responsável Principal</div>}
                      </div>
                      <RoleGuard allowedRoles={['diretor', 'coordenador', 'secretário']}>
                        <button onClick={() => handleDesvincularResp(resp?.id_responsavel)} title="Remover Vínculo" style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                      </RoleGuard>
                    </div>
                  );
                })}
              </div>
              <RoleGuard allowedRoles={['diretor', 'coordenador', 'secretário']}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <FormInput label="Vincular novo familiar" name="novoResp" type="select" value={idRespVincular} onChange={(e) => setIdRespVincular(e.target.value)} options={(Array.isArray(allResponsaveis) ? allResponsaveis : []).map(r => ({ value: r?.id || '', label: `${r?.nome || 'Sem Nome'} (${r?.cpf || ''})` }))} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <Button onClick={handleVincularResp} disabled={!idRespVincular}><LinkIcon size={16} /> Vincular</Button>
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

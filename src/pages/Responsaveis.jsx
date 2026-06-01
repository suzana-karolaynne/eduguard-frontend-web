import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { Modal } from '../components/Modal';
import { Users, Plus, Shield, ShieldAlert, Search, Edit2, Trash2 } from 'lucide-react';
import { PAGE_STYLES } from '../constants/theme';

export const Responsaveis = () => {
  const [responsaveis, setResponsaveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ id: null, nome: '', cpf: '', celular: '', descricao_tipo: 'Mãe', email: '', master: false, foto: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [allAlunos, setAllAlunos] = useState([]);
  const [selectedResponsavel, setSelectedResponsavel] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [alunosVinculados, setAlunosVinculados] = useState([]);
  const [idAlunoVincular, setIdAlunoVincular] = useState('');

  const fetchResponsaveis = async () => { try { setLoading(true); const data = await api.get('/responsaveis'); setResponsaveis(data); } catch (err) { console.error('Erro ao buscar responsáveis:', err); } finally { setLoading(false); } };
  useEffect(() => { 
    fetchResponsaveis(); 
    api.get('/alunos').then(data => setAllAlunos(Array.isArray(data) ? data : [])).catch(() => setAllAlunos([]));
  }, []);
  
  const handleInputChange = (e) => { 
    if (e.target.type === 'file') {
      setFormData(prev => ({ ...prev, foto: e.target.files[0] }));
    } else {
      const { name, value, type, checked } = e.target; 
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); 
    }
  };

  const handleEdit = (e, responsavel) => {
    e.stopPropagation();
    setFormData({
      id: responsavel.id,
      nome: responsavel.nome || '',
      cpf: responsavel.cpf || '',
      celular: responsavel.celular || '',
      descricao_tipo: responsavel.descricaotipo || responsavel.descricao_tipo || 'Outro',
      email: responsavel.email || '',
      master: responsavel.master || false,
      foto: null
    });
    setIsModalOpen(true);
  };

  const openViewModal = async (responsavel) => {
    setSelectedResponsavel(responsavel);
    setIsViewModalOpen(true);
    try {
      const res = await api.get(`/responsaveis/${responsavel.id}`);
      setSelectedResponsavel({
        ...responsavel,
        ...res,
      });
      setAlunosVinculados(Array.isArray(res.alunos) ? res.alunos : []);
    } catch(err) {
      console.error(err);
    }
  };

  const handleVincularAluno = async () => {
    if (!idAlunoVincular || !selectedResponsavel?.id) return;
    try {
      await api.post(`/responsaveis/${selectedResponsavel.id}/alunos`, { id_aluno: idAlunoVincular });
      const res = await api.get(`/responsaveis/${selectedResponsavel.id}`);
      setAlunosVinculados(Array.isArray(res.alunos) ? res.alunos : []);
      setIdAlunoVincular('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDesvincularAluno = async (idAluno) => {
    if (!selectedResponsavel?.id || !idAluno) return;
    try {
      await api.del(`/responsaveis/${selectedResponsavel.id}/alunos/${idAluno}`);
      const res = await api.get(`/responsaveis/${selectedResponsavel.id}`);
      setAlunosVinculados(Array.isArray(res.alunos) ? res.alunos : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    setError(''); 
    setSaving(true); 
    try { 
      const payload = new FormData();
      payload.append('nome', formData.nome);
      payload.append('cpf', formData.cpf);
      payload.append('celular', formData.celular);
      payload.append('descricao_tipo', formData.descricao_tipo);
      payload.append('email', formData.email);
      if (formData.senha) {
        payload.append('senha', formData.senha);
      }
      payload.append('master', formData.master);

      if (formData.foto) {
        payload.append('foto', formData.foto);
      }

      if (formData.id) {
        await api.put(`/responsaveis/${formData.id}`, payload);
      } else {
        await api.post('/responsaveis', payload); 
      }
      setIsModalOpen(false); 
      setFormData({ id: null, nome: '', cpf: '', celular: '', descricao_tipo: 'Mãe', email: '', master: false, foto: null }); 
      fetchResponsaveis(); 
    } catch (err) { 
      setError(err.message || 'Erro ao salvar responsável'); 
    } finally { 
      setSaving(false); 
    } 
  };

  const filtered = responsaveis.filter(r =>
    r.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cpf?.includes(searchTerm)
  );

  const API_BASE_URL = 'http://localhost:3000';
  const getFotoUrl = (foto) => {
    if (!foto) return null;
    const normalized = String(foto).replace(/\\/g, '/');
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;
    if (normalized.startsWith('/uploads')) return `${API_BASE_URL}${normalized}`;
    if (normalized.startsWith('uploads')) return `${API_BASE_URL}/${normalized}`;
    return `${API_BASE_URL}/uploads/fotos/${normalized}`;
  };

  const columns = [
    { header: 'Responsável', render: (row) => {
      const rawFoto = row.foto_url || row.foto || row.Foto || null;
      const fotoUrl = getFotoUrl(rawFoto);
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
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {row.nome}
              {row.master && <Shield size={14} style={{ color: 'var(--warning)' }} title="Responsável Principal" />}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
          </div>
        </div>
      );
    }},
    { header: 'Parentesco', accessor: 'descricaotipo' },
    { header: 'CPF', accessor: 'cpf' },
    { header: 'Celular', accessor: 'celular' },
    { header: 'Status', render: (row) => (
      <span className={`badge ${row.ativo ? 'badge-success' : 'badge-danger'}`}>{row.ativo ? 'Ativo' : 'Inativo'}</span>
    )},
    { header: 'Ações', render: (row) => (
      <Button variant="outline" onClick={(e) => handleEdit(e, row)} style={{ padding: '0.25rem 0.5rem' }}>
        <Edit2 size={14} />
      </Button>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={PAGE_STYLES.pageTitle}>Famílias (Responsáveis)</h1>
          <p style={PAGE_STYLES.pageSubtitle}>Gerencie os pais e responsáveis legais dos alunos</p>
        </div>
        <Button onClick={() => {
          setFormData({ id: null, nome: '', cpf: '', celular: '', descricao_tipo: 'Mãe', email: '', master: false, foto: null });
          setIsModalOpen(true);
        }}><Plus size={16} /> Novo Responsável</Button>
      </div>

      <div style={PAGE_STYLES.searchBar}>
        <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
        <input type="text" placeholder="Buscar por nome ou CPF..." style={PAGE_STYLES.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="Nenhum responsável encontrado." onRowClick={openViewModal} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Editar Responsável" : "Cadastrar Responsável"}>
        <form onSubmit={handleSubmit}>
          {error && <div style={PAGE_STYLES.errorBox}>{error}</div>}
          <FormInput label="Nome Completo" name="nome" value={formData.nome} onChange={handleInputChange} required placeholder="Ex: João da Silva" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput label="CPF" name="cpf" value={formData.cpf} onChange={handleInputChange} required placeholder="Somente números" />
            <FormInput label="Celular" name="celular" value={formData.celular} onChange={handleInputChange} required placeholder="(11) 99999-9999" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            <FormInput label="Senha de Acesso" name="senha" type="password" value={formData.senha || ''} onChange={handleInputChange} required={!formData.id} placeholder={formData.id ? "Preencha apenas se quiser alterar a senha." : "Senha para acessar o portal"} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput label="Parentesco" name="descricao_tipo" type="select" value={formData.descricao_tipo} onChange={handleInputChange} required
              options={[{value:'Mãe',label:'Mãe'},{value:'Pai',label:'Pai'},{value:'Avô/Avó',label:'Avô/Avó'},{value:'Tio/Tia',label:'Tio/Tia'},{value:'Responsável Legal',label:'Responsável Legal'},{value:'Outro',label:'Outro'}]} />
            <FormInput label="Foto do Responsável" name="foto" type="file" accept="image/*" onChange={handleInputChange} />
          </div>

          <div style={{
            margin: '0.5rem 0 1rem', padding: '0.875rem 1rem',
            backgroundColor: 'var(--warning-bg)', border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          }}>
            <ShieldAlert style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} size={20} />
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="master" checked={formData.master} onChange={handleInputChange}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Responsável Financeiro/Master?</span>
              </label>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Marque caso este seja o responsável principal (contratante) do aluno.</p>
            </div>
          </div>

          <div style={PAGE_STYLES.modalActions}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{formData.id ? "Salvar Alterações" : "Salvar Responsável"}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Perfil do Responsável">
        {selectedResponsavel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={PAGE_STYLES.detailHeader}>
              {(() => {
                const rawFotoResp = selectedResponsavel?.foto_url || selectedResponsavel?.foto || selectedResponsavel?.Foto || null;
                const fotoRespUrl = getFotoUrl(rawFotoResp);
                return (
                  <>
                    {fotoRespUrl && (
                      <img
                        src={fotoRespUrl}
                        alt={selectedResponsavel?.nome || 'Responsável'}
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
                          const fallback = e.currentTarget.parentElement.querySelector('.fallback-avatar');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    )}
                    <div
                      className="fallback-avatar"
                      style={{
                        ...PAGE_STYLES.avatar(56),
                        display: fotoRespUrl ? 'none' : 'flex'
                      }}
                    >
                      {(selectedResponsavel?.nome || 'R')
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join('')
                        .toUpperCase() || 'R'}
                    </div>
                  </>
                );
              })()}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedResponsavel.nome || 'Sem Nome'}</h3>
                  {selectedResponsavel.master && <Shield size={16} style={{ color: 'var(--warning)' }} title="Responsável Principal" />}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>CPF: {selectedResponsavel.cpf || '-'}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{selectedResponsavel.email || '-'}</p>
                <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.5rem' }}>
                  <span className={`badge ${selectedResponsavel.ativo ? 'badge-success' : 'badge-danger'}`}>
                    {selectedResponsavel.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    {selectedResponsavel.descricaotipo || selectedResponsavel.descricao_tipo || '-'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Alunos Vinculados</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {(!Array.isArray(alunosVinculados) || alunosVinculados.length === 0) ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhum aluno vinculado a este responsável.</p>
                ) : alunosVinculados.map(aluno => {
                  const nomeAluno = aluno?.nome || aluno?.Nome || 'Aluno';
                  const rawFotoAluno = aluno?.foto_url || aluno?.foto || aluno?.Foto || null;
                  const fotoAlunoUrl = getFotoUrl(rawFotoAluno);
                  
                  const iniciaisAluno = nomeAluno
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(p => p[0])
                    .join('')
                    .toUpperCase() || 'A';

                  return (
                    <div key={aluno.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {fotoAlunoUrl && (
                          <img
                            src={fotoAlunoUrl}
                            alt={nomeAluno}
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement.querySelector('.fallback-avatar');
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        )}
                        <div className="fallback-avatar" style={{ ...PAGE_STYLES.avatar(32), fontSize: '0.85rem', display: fotoAlunoUrl ? 'none' : 'flex' }}>
                          {iniciaisAluno}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{nomeAluno}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Matrícula: {aluno.matricula || '-'}</p>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => {
                        if(window.confirm('Desvincular este aluno?')) handleDesvincularAluno(aluno.id);
                      }} style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)' }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Vincular Novo Aluno</h5>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    style={{ ...PAGE_STYLES.searchInput, flex: 1 }}
                    value={idAlunoVincular}
                    onChange={(e) => setIdAlunoVincular(e.target.value)}
                  >
                    <option value="">Selecione um aluno...</option>
                    {allAlunos
                      .filter(a => !alunosVinculados.some(v => v.id === a.id))
                      .map(a => (
                        <option key={a.id} value={a.id}>{a.nome} ({a.matricula})</option>
                      ))
                    }
                  </select>
                  <Button onClick={handleVincularAluno} disabled={!idAlunoVincular}>Vincular</Button>
                </div>
              </div>
            </div>
            <div style={PAGE_STYLES.modalActions}>
              <Button onClick={() => setIsViewModalOpen(false)}>Fechar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

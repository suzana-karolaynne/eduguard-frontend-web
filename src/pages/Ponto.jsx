import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { Modal } from '../components/Modal';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { PAGE_STYLES } from '../constants/theme';

export const Ponto = () => {
  const [historico, setHistorico] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoRegistro, setTipoRegistro] = useState('entrada');
  const [formData, setFormData] = useState({ id_aluno: '', id_responsavel_saida: '', hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) });
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cpfResponsavel, setCpfResponsavel] = useState('');
  const [validatingCpf, setValidatingCpf] = useState(false);
  const [cpfValidado, setCpfValidado] = useState(false);
  const [responsavelValidado, setResponsavelValidado] = useState(null);
  const [validacaoMensagem, setValidacaoMensagem] = useState('');

  const fetchData = async () => { try { setLoading(true); const res = await api.get(`/ponto?data=${dataSelecionada}`); setHistorico(res); const alunosRes = await api.get('/alunos'); setAlunos(alunosRes); } catch (err) { console.error('Erro:', err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [dataSelecionada]);
  useEffect(() => { const interval = setInterval(() => { if (!isModalOpen) { setFormData(prev => ({...prev, hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})); } }, 60000); return () => clearInterval(interval); }, [isModalOpen]);

  const handleInputChange = (e) => { 
    const { name, value } = e.target; 
    setFormData(prev => ({ ...prev, [name]: value })); 
    if (name === 'id_aluno' && tipoRegistro === 'saida') { 
      setCpfResponsavel('');
      setCpfValidado(false);
      setResponsavelValidado(null);
      setValidacaoMensagem('');
      setFormData(prev => ({ ...prev, id_responsavel_saida: '' }));
    } 
  };
  const openModal = (tipo) => { 
    setTipoRegistro(tipo); 
    setError(''); 
    setCpfResponsavel('');
    setCpfValidado(false);
    setResponsavelValidado(null);
    setValidacaoMensagem('');
    setIsModalOpen(true); 
  };
  
  const handleValidarCPF = async () => {
    if (!formData.id_aluno) {
      setValidacaoMensagem('Selecione um aluno antes de validar o CPF.');
      setResponsavelValidado(null);
      setCpfValidado(false);
      return;
    }
    if (!cpfResponsavel) {
      setValidacaoMensagem('Digite o CPF do responsável.');
      return;
    }
    setValidatingCpf(true);
    setValidacaoMensagem('');
    try {
      const res = await api.post('/ponto/validar-responsavel', { id_aluno: formData.id_aluno, cpf: cpfResponsavel });
      setResponsavelValidado(res.responsavel);
      setValidacaoMensagem(res.mensagem || 'Liberação permitida');
      setCpfValidado(true);
      setFormData(prev => ({ ...prev, id_responsavel_saida: res.responsavel.id }));
    } catch (err) {
      setResponsavelValidado(null);
      setValidacaoMensagem(err.message || 'Liberação não permitida. CPF não pertence a um responsável vinculado a este aluno.');
      setCpfValidado(false);
      setFormData(prev => ({ ...prev, id_responsavel_saida: '' }));
    } finally {
      setValidatingCpf(false);
    }
  };

  const handleSubmit = async (e) => { e.preventDefault(); setError(''); setSaving(true); try { const payload = { id_aluno: formData.id_aluno, data: new Date().toISOString().split('T')[0] }; if (tipoRegistro === 'entrada') { payload.hora_entrada = formData.hora; await api.post('/ponto/entrada', payload); } else { payload.hora_saida = formData.hora; payload.id_responsavel_saida = formData.id_responsavel_saida; await api.post('/ponto/saida', payload); } setIsModalOpen(false); setFormData(prev => ({ ...prev, id_aluno: '', id_responsavel_saida: '' })); fetchData(); } catch (err) { setError(err.message || `Erro ao registrar ${tipoRegistro}`); } finally { setSaving(false); } };

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
    { header: 'Aluno', render: (row) => {
      const nomeAluno = row.nome_aluno || 'Aluno';
      const rawFotoAluno = row.foto_url || row.foto || row.Foto || null;
      const fotoAlunoUrl = getFotoUrl(rawFotoAluno);
      
      const iniciaisAluno = nomeAluno
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0])
        .join('')
        .toUpperCase() || 'A';

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {fotoAlunoUrl ? (
            <img
              src={fotoAlunoUrl}
              alt={nomeAluno}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div style={{ ...PAGE_STYLES.avatar(32), fontSize: '0.85rem', display: fotoAlunoUrl ? 'none' : 'flex' }}>
            {iniciaisAluno}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{nomeAluno}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matrícula: {row.matricula || '-'}</div>
          </div>
        </div>
      );
    }},
    { header: 'Turma', accessor: 'nome_turma' },
    { header: 'Registro', render: (row) => {
      const status = (row.status || row.descricao || '').toUpperCase();
      const isEntrada = status === 'ENTRADA';
      return (
        <div>
          <span className={`badge ${isEntrada ? 'badge-success' : 'badge-warning'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '0.25rem' }}>
            {isEntrada ? <LogIn size={12}/> : <LogOut size={12}/>}
            {isEntrada ? 'Entrada' : 'Saída'}
          </span>
          {!isEntrada && row.nome_responsavel && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Retirado por: {row.nome_responsavel}</div>
          )}
        </div>
      );
    }},
    { header: 'Horário', render: (row) => new Date(row.data_hora).toLocaleTimeString('pt-BR') }
  ];



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={PAGE_STYLES.pageTitle}>Registro de Frequência</h1>
          <p style={PAGE_STYLES.pageSubtitle}>Gerencie a entrada e saída dos alunos</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" onClick={() => openModal('saida')}><LogOut size={16} /> Registrar Saída</Button>
          <Button onClick={() => openModal('entrada')}><LogIn size={16} /> Registrar Entrada</Button>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock style={{ color: 'var(--primary)' }} size={20} />
            {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{historico.length} registros computados</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)}
            style={{ backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem', outline: 'none', fontSize: '0.85rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={historico} loading={loading} emptyMessage="Nenhum registro de ponto encontrado hoje." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Registrar ${tipoRegistro === 'entrada' ? 'Entrada' : 'Saída'}`}>
        <form onSubmit={handleSubmit}>
          {error && <div style={PAGE_STYLES.errorBox}>{error}</div>}
          <FormInput label="Selecione o Aluno" name="id_aluno" type="select" value={formData.id_aluno} onChange={handleInputChange} required options={alunos.filter(a => a.ativo).map(a => ({ value: a.id, label: a.nome }))} />
          {tipoRegistro === 'saida' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>CPF do Responsável</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={cpfResponsavel}
                    onChange={(e) => setCpfResponsavel(e.target.value)}
                    placeholder="000.000.000-00"
                    style={{ ...PAGE_STYLES.searchInput, flex: 1 }}
                  />
                  <Button type="button" onClick={handleValidarCPF} disabled={validatingCpf}>
                    {validatingCpf ? 'Validando...' : 'Validar CPF'}
                  </Button>
                </div>
                {validacaoMensagem && (
                  <div style={{
                    marginTop: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                    backgroundColor: cpfValidado ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: cpfValidado ? 'var(--success)' : 'var(--danger)',
                    border: `1px solid ${cpfValidado ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    fontSize: '0.875rem', fontWeight: 500
                  }}>
                    {validacaoMensagem}
                  </div>
                )}
              </div>
              
              {cpfValidado && responsavelValidado && (
                <div style={{ 
                  marginTop: '0.5rem', marginBottom: '1rem', padding: '0.75rem', 
                  backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', gap: '0.75rem' 
                }}>
                  {(() => {
                    const rawFoto = responsavelValidado.foto_url || responsavelValidado.foto || responsavelValidado.Foto;
                    const fotoUrl = getFotoUrl(rawFoto);
                    return (
                      <>
                        {fotoUrl && (
                          <img
                            src={fotoUrl}
                            alt={responsavelValidado.nome}
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
                          {responsavelValidado.nome?.substring(0, 2).toUpperCase()}
                        </div>
                      </>
                    )
                  })()}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{responsavelValidado.nome}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{responsavelValidado.parentesco || responsavelValidado.descricaotipo || responsavelValidado.descricao_tipo || 'Responsável'}</div>
                  </div>
                </div>
              )}
            </>
          )}
          <FormInput label="Horário" name="hora" type="time" value={formData.hora} onChange={handleInputChange} required />
          <div style={PAGE_STYLES.modalActions}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving} disabled={tipoRegistro === 'saida' && !cpfValidado}>Confirmar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

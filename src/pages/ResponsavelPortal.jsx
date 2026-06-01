import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, FileText, Send, MessageSquare } from 'lucide-react';
import { Modal } from '../components/Modal';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { PAGE_STYLES } from '../constants/theme';
import '../components/Layout.css'; // For basic header styling
import { useNavigate } from 'react-router-dom';

export const ResponsavelPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal para responder
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comunicadoId, setComunicadoId] = useState(null);
  const [resposta, setResposta] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const alunosRes = await api.get('/portal/alunos');
        setAlunos(alunosRes || []);
        if (alunosRes && alunosRes.length > 0) {
          setSelectedAlunoId(alunosRes[0].id);
        }
        
        const comRes = await api.get('/portal/comunicados');
        setComunicados(comRes || []);
      } catch (err) {
        console.error('Erro ao carregar dados', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAlunoId) {
      const fetchResumo = async () => {
        try {
          const res = await api.get(`/portal/aluno/${selectedAlunoId}/resumo`);
          setResumo(res);
        } catch (err) {
          console.error('Erro ao carregar resumo', err);
        }
      };
      fetchResumo();
    }
  }, [selectedAlunoId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResponder = (id) => {
    setComunicadoId(id);
    setResposta('');
    setIsModalOpen(true);
  };

  const submitResposta = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/comunicacao/avisos/${comunicadoId}/responder`, { mensagem: resposta });
      setIsModalOpen(false);
      alert('Resposta enviada com sucesso');
    } catch (err) {
      alert(err.message || 'Erro ao enviar resposta');
    } finally {
      setSaving(false);
    }
  };

  const selectedAluno = alunos.find(a => a.id === selectedAlunoId);
  const userName = user?.nome || 'Responsável';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Header simplificado para responsável */}
      <header className="header" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Portal do Responsável - {userName}</h1>
        <button className="btn-logout" onClick={handleLogout} title="Sair do sistema">
          <LogOut size={18} />
        </button>
      </header>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {loading ? (
          <div>Carregando informações...</div>
        ) : alunos.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <GraduationCap size={48} style={{ color: 'var(--text-muted)' }} />
            <p>Nenhuma criança vinculada ao seu cadastro no momento.</p>
          </div>
        ) : (
          <>
            {/* Seletor de Crianças */}
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {alunos.map(aluno => (
                <div 
                  key={aluno.id}
                  onClick={() => setSelectedAlunoId(aluno.id)}
                  style={{
                    padding: '1rem 1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: selectedAlunoId === aluno.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: selectedAlunoId === aluno.id ? 'var(--primary-light)' : 'var(--surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    minWidth: '200px'
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {aluno.nome.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>{aluno.nome}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{aluno.nome_turma || 'Sem turma'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
              
              {/* Coluna 1: Resumo do Dia */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Resumo do Dia - {selectedAluno?.nome}</h2>
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Entrada/Saída</h4>
                    {resumo?.ponto?.length > 0 ? resumo.ponto.map((p, idx) => (
                      <div key={idx} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        <strong>{p.status}</strong> às {new Date(p.data_hora).toLocaleTimeString('pt-BR')} 
                        {p.nome_responsavel ? ` por ${p.nome_responsavel}` : ''}
                      </div>
                    )) : <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nenhum registro hoje.</p>}
                  </div>

                  <hr style={{ borderColor: 'var(--border)', opacity: 0.5 }} />

                  <div>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Rotina (Alimentação, Higiene, Sono)</h4>
                    {resumo?.rotina?.length > 0 ? resumo.rotina.map((r, idx) => (
                      <div key={idx} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        - {r.checklist}: {r.realizado ? <span style={{color: 'var(--success)'}}>Realizado</span> : <span style={{color: 'var(--danger)'}}>Não realizado ({r.observacao})</span>}
                      </div>
                    )) : <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nenhum registro hoje.</p>}
                  </div>

                  <hr style={{ borderColor: 'var(--border)', opacity: 0.5 }} />

                  <div>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Medicações Administradas</h4>
                    {resumo?.medicacoes?.length > 0 ? resumo.medicacoes.map((m, idx) => (
                      <div key={idx} style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        - {m.nome_medicamento} às {new Date(m.data_hora).toLocaleTimeString('pt-BR')} (Previsto: {m.hora_info})
                      </div>
                    )) : <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nenhum registro hoje.</p>}
                  </div>

                </div>
              </div>

              {/* Coluna 2: Comunicados */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Comunicados</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {comunicados.length === 0 ? (
                    <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                      <FileText size={32} style={{ color: 'var(--text-muted)' }} />
                      <p>Nenhum comunicado.</p>
                    </div>
                  ) : (
                    comunicados.map(aviso => (
                      <div key={aviso.id} className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{aviso.titulo}</h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(aviso.data_publicacao).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{aviso.conteudo}</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button variant="outline" onClick={() => handleResponder(aviso.id)}>
                            <MessageSquare size={16} /> Responder
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Responder Comunicado">
        <form onSubmit={submitResposta}>
          <FormInput 
            label="Sua Mensagem" 
            name="mensagem" 
            type="textarea" 
            value={resposta} 
            onChange={(e) => setResposta(e.target.value)} 
            required 
            rows={4} 
          />
          <div style={PAGE_STYLES.modalActions}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}><Send size={16}/> Enviar</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

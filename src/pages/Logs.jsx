import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Search, FileText, ShieldAlert } from 'lucide-react';

export const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const fetchLogs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (dataInicio) params.append('data_inicio', dataInicio);
        if (dataFim) params.append('data_fim', dataFim);
        const data = await api.get(`/logs?${params.toString()}`);
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao buscar logs:', err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilter = () => {
    fetchLogs();
  };

  const handleClear = () => {
    setDataInicio('');
    setDataFim('');
    setSearchTerm('');
    // The state updates are async, so we'll fetch explicitly without params
    setLoading(true);
    api.get('/logs').then(data => {
      setLogs(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const filtered = logs.filter(l =>
    (l.acao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.tipo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.nome_funcionario || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.entidade || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeClass = (tipo) => {
    const t = (tipo || '').toUpperCase();
    if (t === 'PONTO') return 'badge-success';
    if (t === 'ALUNO') return 'badge-info';
    if (t === 'RESPONSAVEL') return 'badge-warning';
    if (t === 'FUNCIONARIO') return 'badge-primary';
    if (t === 'TURMA') return 'badge-info';
    if (t === 'ROTINA') return 'badge-success';
    if (t === 'MEDICACAO') return 'badge-danger';
    if (t === 'AVISO') return 'badge-warning';
    if (t === 'AUTH') return 'badge-primary';
    if (t === 'PERFIL') return 'badge-info';
    return 'badge-info';
  };

  const columns = [
    {
      header: 'Data/Hora',
      render: (row) => {
        const d = row.data_hora || row.datahora;
        return d ? new Date(d).toLocaleString('pt-BR') : '-';
      }
    },
    { header: 'Tipo', render: (row) => {
      const tipo = row.tipo || 'Ação';
      return <span className={`badge ${getBadgeClass(tipo)}`}>{tipo}</span>;
    }},
    { header: 'Ação', render: (row) => (
      <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
        {row.acao || '-'}
      </span>
    )},
    { header: 'Descrição', render: (row) => (
      <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
        {row.descricao || '-'}
      </span>
    )},
    { header: 'Responsável pela ação', render: (row) => (
      <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
        {row.nome_funcionario || row.responsavel_acao || row.usuario || row.email || '-'}
      </span>
    )},
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Logs do Sistema</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Rastreabilidade de ações realizadas no sistema (somente leitura)</p>
      </div>

      <div className="card" style={{
        padding: '0.875rem 1.125rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
        backgroundColor: 'var(--info-bg)', borderColor: 'rgba(59,130,246,0.15)',
      }}>
        <ShieldAlert size={18} style={{ color: 'var(--info)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--info)' }}>
          Os registros de log são somente leitura e não podem ser alterados ou excluídos (RN-016).
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.875rem', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
          <input type="text" placeholder="Buscar nos logs..."
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%', color: 'var(--text-primary)' }}
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>De:</span>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} 
                 style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', fontSize: '0.85rem' }} />
          
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Até:</span>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} 
                 style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', fontSize: '0.85rem' }} />
          
          <button onClick={handleFilter} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
            Filtrar
          </button>
          <button onClick={handleClear} style={{ padding: '0.5rem 1rem', background: 'var(--surface)', color: 'var(--text-primary)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
            Limpar
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="Nenhum log encontrado." />
    </div>
  );
};

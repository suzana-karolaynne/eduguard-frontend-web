import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { Clock, ArrowRight, ArrowLeft, Pill, Coffee, Droplets, Moon, Search } from 'lucide-react';

export const Historico = () => {
  const [alunos, setAlunos] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState('');
  const [dataInicio, setDataInicio] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dataFim, setDataFim] = useState(() => new Date().toISOString().split('T')[0]);
  const [historico, setHistorico] = useState([]);
  const [rotinas, setRotinas] = useState([]);
  const [medicacaoHist, setMedicacaoHist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/alunos').then(data => setAlunos(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const buscarHistorico = async () => {
    if (!selectedAluno) return;
    setLoading(true);
    try {
      const [pontoData, rotinaData, medicacaoData] = await Promise.all([
        api.get(`/ponto/aluno/${selectedAluno}?de=${dataInicio}&ate=${dataFim}`).catch(() => []),
        api.get(`/rotina/aluno/${selectedAluno}?data=${dataFim}`).catch(() => []),
        api.get(`/medicacao/aluno/${selectedAluno}/historico`).catch(() => []),
      ]);
      setHistorico(Array.isArray(pontoData) ? pontoData : []);
      setRotinas(Array.isArray(rotinaData) ? rotinaData : []);
      setMedicacaoHist(Array.isArray(medicacaoData) ? medicacaoData : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getIconForType = (tipo) => {
    const t = (tipo || '').toLowerCase();
    if (t.includes('entrada')) return <ArrowRight size={16} style={{ color: 'var(--success)' }} />;
    if (t.includes('saida') || t.includes('saída')) return <ArrowLeft size={16} style={{ color: 'var(--danger)' }} />;
    if (t.includes('alimenta')) return <Coffee size={16} style={{ color: 'var(--warning)' }} />;
    if (t.includes('higiene')) return <Droplets size={16} style={{ color: 'var(--info)' }} />;
    if (t.includes('sono')) return <Moon size={16} style={{ color: '#8b5cf6' }} />;
    if (t.includes('medica')) return <Pill size={16} style={{ color: '#ec4899' }} />;
    return <Clock size={16} style={{ color: 'var(--text-muted)' }} />;
  };

  const alunoNome = alunos.find(a => String(a.id) === String(selectedAluno))?.nome || '';

  const timelineItems = [
    ...historico.map((item, i) => ({ ...item, _key: `p-${i}`, _type: 'ponto' })),
    ...rotinas.map((item, i) => ({ ...item, _key: `r-${i}`, _type: 'rotina' })),
    ...medicacaoHist.map((item, i) => ({ ...item, _key: `m-${i}`, _type: 'medicacao' })),
  ].sort((a, b) => {
    const d1 = new Date(b.data_hora || b.datahorasys || b.data);
    const d2 = new Date(a.data_hora || a.datahorasys || a.data);
    return d1 - d2;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Histórico do Aluno</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Consulte o histórico completo de atividades (RN-011: últimos 90 dias)</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <FormInput label="Aluno" name="aluno" type="select" value={selectedAluno}
            onChange={(e) => setSelectedAluno(e.target.value)}
            options={alunos.map(a => ({ value: String(a.id), label: `${a.nome} (${a.matricula || ''})` }))}
            required />
        </div>
        <div style={{ minWidth: '150px' }}>
          <FormInput label="Data Início" name="di" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div style={{ minWidth: '150px' }}>
          <FormInput label="Data Fim" name="df" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <Button onClick={buscarHistorico} loading={loading} disabled={!selectedAluno}>
            <Search size={16} /> Buscar
          </Button>
        </div>
      </div>

      {alunoNome && (
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
          Timeline de {alunoNome}
        </h2>
      )}

      {timelineItems.length === 0 && !loading && selectedAluno && (
        <div className="empty-state">
          <Clock size={40} />
          <p>Nenhum registro encontrado para o período selecionado.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {timelineItems.map((item) => {
          const isRealizado = (r) => {
            const valor = r.realizado ?? r.rotinafeita ?? r.RotinaFeita ?? r.feito ?? r.status;
            if (typeof valor === 'boolean') return valor;
            if (typeof valor === 'string') {
              const n = valor.toLowerCase().trim();
              return ['true', 'sim', 'realizado', 'feito', '1'].includes(n);
            }
            if (typeof valor === 'number') return valor === 1;
            return false;
          };
          const realizado = item._type === 'rotina' ? isRealizado(item) : false;

          return (
          <div key={item._key} className="card" style={{
            padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-full)',
              backgroundColor: item._type === 'rotina' ? (realizado ? 'var(--success-bg)' : 'var(--danger-bg)') : 'var(--primary-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {getIconForType(item.descricao || item.tipo)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                {item._type === 'rotina'
                  ? `${item.tipo || item.descricao || 'Rotina'} — ${realizado ? '✅ Realizado' : '❌ Não realizado'}`
                  : item.descricao || item.tipo || 'Registro'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                {item.observacao || item.obsdenao || ''}
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'right', flexShrink: 0 }}>
              <div>{item.data_hora ? new Date(item.data_hora).toLocaleDateString('pt-BR') : item.data ? new Date(item.data + 'T00:00:00').toLocaleDateString('pt-BR') : item.datahorasys ? new Date(item.datahorasys).toLocaleDateString('pt-BR') : ''}</div>
              <div>{item.hora || (item.data_hora ? new Date(item.data_hora).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) : item.datahorasys ? new Date(item.datahorasys).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) : '')}</div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, allowedTypes = ['funcionario'] }) {
  const { signed, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--background)' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Carregando...</h2>
      </div>
    );
  }

  if (!signed) {
    return <Navigate to="/login" replace />;
  }

  if (user?.tipo_usuario && !allowedTypes.includes(user.tipo_usuario)) {
    if (user.tipo_usuario === 'responsavel') {
      return <Navigate to="/responsavel/portal" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

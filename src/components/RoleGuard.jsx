import React from 'react';
import { useAuth } from '../context/AuthContext';

const normalize = (value) =>
  (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }

  // Accept funcao, funcao_nome, or role from user object
  const userRole = user.funcao || user.funcao_nome || user.role || '';
  
  if (!userRole) {
    return null;
  }

  const normalizedUserRole = normalize(userRole);
  const isAllowed = allowedRoles.some(r => normalize(r) === normalizedUserRole);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
};

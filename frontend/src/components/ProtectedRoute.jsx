import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ children }) => {
  return children;
};

export default ProtectedRoute;

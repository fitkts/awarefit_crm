import React from 'react';
import LoginForm from '../features/auth/LoginForm';
import { useAuthStore } from '../store/auth.store';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If already authenticated, bypass login rendering
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}

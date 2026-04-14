import React from 'react';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">AwareFit Admin Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            안녕하세요, {user?.name} ({user?.role})님
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>
      
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">대시보드 메인 영역</h3>
          <p className="text-muted-foreground">
            피트니스 스튜디오의 현황 및 주요 지표들이 표시될 곳입니다. 왼쪽 사이드바 등의 네비게이션을 추가하여 페이지를 확장해 나갈 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  );
}

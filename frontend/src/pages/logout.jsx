import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { clearAuthData } from '../lib/auth';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    clearAuthData();
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-500">Signing you out...</p>
    </div>
  );
}

export default Logout;

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useDartStore from '../../store/dartStore';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const connectionStatus = useDartStore(s => s.connectionStatus);
  const { isOperator, logout } = useAuthStore();

  const statusColor = {
    connected:    'bg-green-500',
    connecting:   'bg-yellow-400',
    disconnected: 'bg-gray-400',
    error:        'bg-red-500',
  }[connectionStatus] || 'bg-gray-400';

  const statusLabel = {
    connected:    'Live',
    connecting:   'Connecting…',
    disconnected: 'Offline',
    error:        'Error',
  }[connectionStatus] || 'Unknown';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-dart-dark text-white h-14 flex items-center px-4 shadow-lg z-50 relative flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-6">
        <div className="w-8 h-8 bg-dart-red rounded-full flex items-center justify-center font-black text-sm select-none">D</div>
        <div>
          <div className="font-black text-sm leading-none tracking-wide">SMART DART</div>
          <div className="text-xs text-gray-400 leading-none">Dar Rapid Transit</div>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex gap-1 flex-1">
        <NavLink to="/" label="Passenger Info" active={location.pathname === '/'} />
        {/* Operator tab only visible when logged in */}
        {isOperator && (
          <NavLink to="/admin" label="Operator Dashboard" active={location.pathname.startsWith('/admin')} />
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Live status */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`w-2 h-2 rounded-full ${statusColor} ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`} />
          <span className="text-gray-300">{statusLabel}</span>
        </div>

        {/* Operator controls – only visible when logged in */}
        {isOperator && (
          <div className="flex items-center gap-2">
            <span className="bg-dart-red/20 border border-dart-red/40 text-red-300 text-xs px-2 py-0.5 rounded-full font-medium">
              Operator
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white text-xs transition-colors"
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
        active ? 'bg-dart-red text-white' : 'text-gray-300 hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  );
}

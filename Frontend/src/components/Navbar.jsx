import React from 'react';
import { Landmark, Shield, User, LogOut } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon">
          <Landmark size={22} />
        </div>
        <span>NovaBank</span>
      </div>

      <div className="nav-actions">
        {user && (
          <>
            <div className="user-badge">
              <User size={16} />
              <span>{user.name || user.email}</span>
              {user.systemUser && (
                <span className="system-tag" title="Authorized System Account">
                  <Shield size={12} />
                  System User
                </span>
              )}
            </div>

            <button
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              title="Logout"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

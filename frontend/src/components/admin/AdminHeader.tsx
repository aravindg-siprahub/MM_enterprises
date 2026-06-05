"use client";

import { LogOut, User, Menu } from "lucide-react";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {

  const handleLogout = () => {
    // Expire the session cookie immediately
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    // Hard redirect to login — ensures browser sends the cleared cookie state
    window.location.href = "/admin/login";
  };

  return (
    <header className="h-16 bg-white border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Menu size={24} />
          </button>
        )}
        <div className="font-semibold text-lg text-[var(--text-primary)] hidden sm:block">
          Dashboard
        </div>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[var(--primary)]">
            <User size={16} />
          </div>
          <span className="hidden sm:inline">Admin User</span>
        </div>
        
        <div className="h-6 w-px bg-gray-200 mx-1 sm:mx-2" />
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

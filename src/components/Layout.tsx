import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../firebase';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Mic, 
  LogOut,
  BrainCircuit,
  Settings,
  Crown,
  FileText,
  Search,
  Podcast,
  Library,
  Mail,
  Wand2
} from 'lucide-react';
import { cn } from '../lib/utils';

export const Layout = () => {
  const { user, credits } = useAuth();

  const navItems = [
    { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/app/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/app/agents', icon: BrainCircuit, label: 'Forge' },
    { to: '/app/image-editor', icon: Wand2, label: 'Editor' },
    { to: '/app/documents', icon: FileText, label: 'Docs' },
    { to: '/app/research', icon: Search, label: 'Research' },
    { to: '/app/podcast', icon: Podcast, label: 'Podcast' },
    { to: '/app/video-analysis', icon: Video, label: 'Video AI' },
    { to: '/app/email', icon: Mail, label: 'Email' },
    { to: '/app/gallery', icon: Library, label: 'Gallery' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#030303] text-zinc-100 overflow-hidden font-sans selection:bg-orange-500/30">
      {/* Top Navigation */}
      <nav className="flex-none h-16 border-b border-orange-500/10 bg-[#030303]/90 backdrop-blur-xl z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-full flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg border border-orange-500/30 bg-[#050505] flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                <Crown className="w-4 h-4 text-orange-500" strokeWidth={2} />
              </div>
              <span className="font-black italic text-sm tracking-widest uppercase text-white">Nexus Elite</span>
            </Link>

            <div className="hidden md:flex items-center gap-1 overflow-x-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2 px-3 py-2 rounded-none text-[10px] font-bold tracking-widest uppercase transition-all duration-200 border-b-2 whitespace-nowrap",
                    isActive 
                      ? "border-orange-500 text-orange-500 bg-orange-500/5" 
                      : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-orange-500/20 bg-orange-500/5 rounded-sm">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-orange-400">CRD: {credits?.toLocaleString() || 0}</span>
            </div>

            <div className="flex items-center gap-2">
              <NavLink
                to="/app/settings"
                className={({ isActive }) => cn(
                  "p-2 transition-colors",
                  isActive ? "text-orange-500" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Settings className="w-4 h-4" />
              </NavLink>
              
              <button onClick={logout} className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>

              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-7 h-7 rounded-sm border border-orange-500/30 ml-2" />
              ) : (
                <div className="w-7 h-7 bg-orange-600 text-white flex items-center justify-center text-xs font-black ml-2 rounded-sm">
                  {user?.email?.[0].toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#030303]">
        {/* Subtle background grid matching landing */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
          <div className="w-full h-full max-w-5xl border-x border-orange-500/10 relative">
            <div className="absolute top-1/4 left-0 right-0 h-px bg-orange-500/10" />
            <div className="absolute top-3/4 left-0 right-0 h-px bg-orange-500/10" />
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col h-full max-w-[1600px] w-full mx-auto p-6">
          <div className="flex-1 bg-[#080808] border border-orange-500/10 shadow-[0_0_50px_rgba(249,115,22,0.03)] relative overflow-hidden flex flex-col rounded-xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};;

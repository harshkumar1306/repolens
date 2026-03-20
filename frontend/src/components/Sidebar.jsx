import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Clock, Plus, LogOut, Menu, X } from 'lucide-react';
import { AppContext } from '../App';
import { motion, AnimatePresence } from 'framer-motion';

/* Logo mark SVG */
function LensIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5.25" stroke="white" strokeWidth="1.75" />
      <line
        x1="11" y1="11" x2="14.5" y2="14.5"
        stroke="white" strokeWidth="1.75" strokeLinecap="round"
      />
    </svg>
  );
}

const navItems = [
  { to: '/',        end: true,  label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/history', end: false, label: 'History',   Icon: Clock },
];

function NavItem({ to, end, label, Icon }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '7px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: isActive ? 500 : 400,
        textDecoration: 'none',
        background: isActive ? 'var(--bg-elevated)' : 'transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        transition: 'all 0.15s',
      })}
      onMouseEnter={(e) => {
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'rgba(226,228,213,0.04)';
        }
      }}
      onMouseLeave={(e) => {
        /* NavLink handles active state via style prop */
      }}
    >
      <Icon size={15} />
      {label}
    </NavLink>
  );
}

/* ─── Desktop sidebar ──────────────────────────────── */
function SidebarContent({ onNewAnalysis, onLogout, user }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #E45B11 0%, #F8AB0B 100%)' }}
          >
            <LensIcon size={15} />
          </div>
          <span
            className="text-base font-bold tracking-tight"
            style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
          >
            RepoLens
          </span>
        </div>
      </div>

      {/* New Analysis CTA */}
      <div className="px-3 mb-3">
        <button
          onClick={onNewAnalysis}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
          style={{
            background: 'rgba(228,91,17,0.11)',
            border: '1px solid rgba(228,91,17,0.22)',
            color: 'var(--accent)',
            fontFamily: '"DM Mono", monospace',
            fontSize: '12px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(228,91,17,0.2)';
            e.currentTarget.style.borderColor = 'rgba(228,91,17,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(228,91,17,0.11)';
            e.currentTarget.style.borderColor = 'rgba(228,91,17,0.22)';
          }}
        >
          <div className="flex items-center gap-2">
            <Plus size={13} />
            New Analysis
          </div>
          <kbd
            style={{
              fontSize: '10px',
              padding: '2px 5px',
              borderRadius: '4px',
              background: 'rgba(228,91,17,0.14)',
              color: 'rgba(228,91,17,0.65)',
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 pt-1">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* User */}
      <div
        className="p-3 mt-auto"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2.5 px-1">
          <img
            src={user?.avatarUrl}
            alt={user?.username}
            className="w-7 h-7 rounded-full shrink-0"
            style={{ border: '1.5px solid var(--border-hover)' }}
          />
          <span
            className="flex-1 text-xs truncate"
            style={{ fontFamily: '"DM Mono", monospace', color: 'var(--text-secondary)' }}
          >
            {user?.username}
          </span>
          <button
            onClick={onLogout}
            title="Sign out"
            style={{
              padding: '6px',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.background = 'rgba(228,91,17,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ──────────────────────────────────── */
export default function Sidebar() {
  const { user, logout, setPaletteOpen } = useContext(AppContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 h-full shrink-0"
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <SidebarContent
          user={user}
          onNewAnalysis={() => setPaletteOpen(true)}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 shrink-0 absolute top-0 left-0 right-0 z-30"
        style={{
          background: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #E45B11, #F8AB0B)' }}
          >
            <LensIcon size={12} />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            RepoLens
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(22,22,20,0.7)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-56 md:hidden"
              style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
              <SidebarContent
                user={user}
                onNewAnalysis={() => { setPaletteOpen(true); setMobileOpen(false); }}
                onLogout={handleLogout}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
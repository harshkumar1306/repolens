import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Clock, Plus, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { AppContext } from '../App';
import { motion, AnimatePresence } from 'framer-motion';

function LensIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5.25" stroke="white" strokeWidth="1.75" />
      <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const navItems = [
  { to: '/',        end: true,  label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/history', end: false, label: 'History',   Icon: Clock },
];

/* CSS-driven NavLink — no JS hover handlers so active state can't get stuck */
function NavItem({ to, end, label, Icon }) {
  return (
    <NavLink to={to} end={end} className="sidebar-nav-item">
      <Icon size={15} />
      <span>{label}</span>
    </NavLink>
  );
}

/* ─── Sidebar inner content ─────────────────────────────────────── */
function SidebarInner({ user, onNewAnalysis, onLogout, sidebarSlot, collapsed }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* New Analysis — hidden when slot is active (results page owns the CTA) */}
      {!sidebarSlot && (
        <div className="px-3 mb-3 mt-1">
          <button
            onClick={onNewAnalysis}
            className="sidebar-new-btn w-full flex items-center justify-between px-3 py-2 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Plus size={13} />
              {!collapsed && <span>New Analysis</span>}
            </div>
            {!collapsed && (
              <kbd className="sidebar-kbd">⌘</kbd>
            )}
          </button>
        </div>
      )}

      {/* Slot OR default nav */}
      <div className="flex-1 overflow-y-auto px-3">
        {sidebarSlot ? (
          sidebarSlot
        ) : (
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>
        )}
      </div>

      {/* User row */}
      {!sidebarSlot && (
        <div className="p-3 mt-auto shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5 px-1">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username || 'avatar'}
                className="w-7 h-7 rounded-full shrink-0"
                style={{ border: '1.5px solid var(--border-hover)' }}
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg,#E45B11,#F8AB0B)',
                  fontSize: 11, color: 'white', fontFamily: '"DM Mono",monospace',
                }}
              >
                {(user?.username || '?')[0].toUpperCase()}
              </div>
            )}
            {!collapsed && (
              <span
                className="flex-1 truncate"
                style={{ fontFamily: '"DM Mono",monospace', fontSize: 12, color: 'var(--text-secondary)' }}
              >
                {user?.username || 'user'}
              </span>
            )}
            <button
              onClick={onLogout}
              title="Sign out"
              className="sidebar-icon-btn"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────────────── */
export default function Sidebar() {
  const { user, logout, setPaletteOpen, sidebarCollapsed, setSidebarCollapsed, sidebarSlot } =
    useContext(AppContext);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SIDEBAR_W = sidebarCollapsed ? 52 : 224;

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <motion.aside
        animate={{ width: SIDEBAR_W }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="hidden md:flex flex-col h-full shrink-0 overflow-hidden"
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo row + toggle */}
        <div
          className="flex items-center shrink-0 px-3 pt-4 pb-3"
          style={{ minHeight: 52, gap: sidebarCollapsed ? 0 : 8 }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#E45B11 0%,#F8AB0B 100%)' }}
          >
            <LensIcon size={15} />
          </div>

          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                style={{
                  fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15,
                  color: 'var(--text-primary)', letterSpacing: '-0.02em',
                  overflow: 'hidden', whiteSpace: 'nowrap',
                }}
              >
                RepoLens
              </motion.span>
            )}
          </AnimatePresence>

          {/* Toggle button — always visible, pushes to right when expanded */}
          <button
            onClick={() => setSidebarCollapsed((c) => !c)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="sidebar-icon-btn ml-auto"
            style={{ flexShrink: 0 }}
          >
            {sidebarCollapsed
              ? <PanelLeftOpen  size={14} />
              : <PanelLeftClose size={14} />
            }
          </button>
        </div>

        <SidebarInner
          user={user}
          onNewAnalysis={() => setPaletteOpen(true)}
          onLogout={handleLogout}
          sidebarSlot={sidebarCollapsed ? null : sidebarSlot}
          collapsed={sidebarCollapsed}
        />
      </motion.aside>

      {/* ── Mobile top bar ───────────────────────────────── */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 absolute top-0 left-0 right-0 z-30 shrink-0"
        style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#E45B11,#F8AB0B)' }}
          >
            <LensIcon size={12} />
          </div>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            RepoLens
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <PanelLeftOpen size={18} />
        </button>
      </div>

      {/* ── Mobile drawer ────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(22,22,20,0.7)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-56 md:hidden flex flex-col"
              style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2.5 px-3 pt-4 pb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#E45B11,#F8AB0B)' }}>
                  <LensIcon size={15} />
                </div>
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>RepoLens</span>
                <button onClick={() => setMobileOpen(false)} className="sidebar-icon-btn ml-auto">
                  <PanelLeftClose size={14} />
                </button>
              </div>
              <SidebarInner
                user={user}
                onNewAnalysis={() => { setPaletteOpen(true); setMobileOpen(false); }}
                onLogout={handleLogout}
                sidebarSlot={sidebarSlot}
                collapsed={false}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Github, ArrowRight } from 'lucide-react';

const GITHUB_AUTH_URL = 'https://repolens-backend-awkk.onrender.com/auth/github';

/* ── Particle canvas ─────────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouse     = useRef({ x: -9999, y: -9999 });
  const raf       = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#E45B11', '#F4860D', '#F8AB0B', '#FBC255', '#B0B2A3'];
    const N = 55;

    const particles = Array.from({ length: N }, () => ({
      x:   Math.random() * canvas.width,
      y:   Math.random() * canvas.height,
      vx:  (Math.random() - 0.5) * 0.35,
      vy:  (Math.random() - 0.5) * 0.35,
      r:   1.5 + Math.random() * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.25 + Math.random() * 0.5,
    }));

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', () => { mouse.current = { x: -9999, y: -9999 }; });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update + draw particles
      for (const p of particles) {
        // Mouse repulsion
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          const force = (90 - dist) / 90;
          p.vx += (dx / dist) * force * 0.25;
          p.vy += (dy / dist) * force * 0.25;
        }

        // Dampen
        p.vx *= 0.97;
        p.vy *= 0.97;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0)              p.x = canvas.width;
        if (p.x > canvas.width)   p.x = 0;
        if (p.y < 0)              p.y = canvas.height;
        if (p.y > canvas.height)  p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      // Connect nearby particles
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = '#E45B11';
            ctx.globalAlpha = (1 - d / 110) * 0.12;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}

/* ── Login page ──────────────────────────────────────────────────── */
export default function Login() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg)', overflow: 'hidden',
    }}>
      {/* ── Left: particle panel ── */}
      <div
        className="hidden md:flex"
        style={{
          flex: 1, position: 'relative',
          borderRight: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <ParticleCanvas />

        {/* Centred wordmark over canvas */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg,#E45B11 0%,#F8AB0B 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 48px rgba(228,91,17,0.4)',
            marginBottom: 20,
          }}>
            <svg width="32" height="32" viewBox="0 0 22 22" fill="none">
              <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="2.2"/>
              <line x1="15.5" y1="15.5" x2="20" y2="20" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{
            fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 32,
            color: 'var(--text-primary)', letterSpacing: '-0.03em',
          }}>
            RepoLens
          </span>
          <p style={{
            fontFamily: '"DM Mono",monospace', fontSize: 13,
            color: 'var(--text-muted)', marginTop: 10, letterSpacing: '0.04em',
          }}>
            AI Documentation Generator
          </p>
        </div>
      </div>

      {/* ── Right: auth form ── */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: '100%', maxWidth: 420,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '60px 48px', position: 'relative',
        }}
      >
        {/* Glow blob behind form */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(228,91,17,0.12) 0%,transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-3 mb-10">
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg,#E45B11,#F8AB0B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="2.2"/>
              <line x1="15.5" y1="15.5" x2="20" y2="20" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>
            RepoLens
          </span>
        </div>

        <div style={{ width: '100%', maxWidth: 320, position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 26,
            color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.025em',
          }}>
            Get started
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.65 }}>
            Connect your GitHub account to start generating AI documentation for any repository.
          </p>

          <motion.a
            href={GITHUB_AUTH_URL}
            whileHover={{ scale: 1.015, boxShadow: '0 0 32px rgba(228,91,17,0.22)' }}
            whileTap={{ scale: 0.985 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 20px', borderRadius: 12, width: '100%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-hover)',
              color: 'var(--text-primary)', textDecoration: 'none',
              fontFamily: '"DM Mono",monospace', fontSize: 13, fontWeight: 500,
            }}
          >
            <Github size={18} />
            Continue with GitHub
            <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
          </motion.a>

          <p style={{
            marginTop: 18, fontFamily: '"DM Mono",monospace',
            fontSize: 11, color: 'var(--text-muted)', textAlign: 'center',
          }}>
            Read-only access · Your code is never stored
          </p>
        </div>
      </motion.div>
    </div>
  );
}
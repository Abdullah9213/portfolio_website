import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView, animate, stagger } from "framer-motion";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;700&family=DM+Serif+Display:ital@0;1&display=swap');
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700,800,900&f[]=cabinet-grotesk@400,500,700,800&display=swap');
`;

const G = {
  bg: "#050505",
  bg1: "#0a0a0a",
  bg2: "#101010",
  bg3: "#171717",
  border: "rgba(255,255,255,0.06)",
  border2: "rgba(255,255,255,0.12)",
  text: "#f7f7f5",
  text2: "#888882",
  text3: "#444440",
  accent: "#F5A623",
  accentDim: "rgba(245,166,35,0.1)",
  accentGlow: "rgba(245,166,35,0.25)",
  red: "#ff453a",
  blue: "#0a84ff",
  green: "#30d158",
};

const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: ${G.bg}; color: ${G.text}; overflow-x: hidden; }
::selection { background: ${G.accent}; color: #000; }
::-webkit-scrollbar { width: 1px; }
::-webkit-scrollbar-track { background: ${G.bg}; }
::-webkit-scrollbar-thumb { background: ${G.accent}; }
a { text-decoration: none; color: inherit; }
.mono { font-family: 'IBM Plex Mono', monospace; }
.display { font-family: 'Clash Display', 'DM Serif Display', sans-serif; }
.body-font { font-family: 'Cabinet Grotesk', sans-serif; }
@keyframes grain {
  0%,100%{transform:translate(0,0)}
  10%{transform:translate(-2%,-3%)}
  20%{transform:translate(1%,2%)}
  30%{transform:translate(-1%,1%)}
  40%{transform:translate(2%,-1%)}
  50%{transform:translate(-2%,2%)}
  60%{transform:translate(1%,-2%)}
  70%{transform:translate(-1%,3%)}
  80%{transform:translate(2%,1%)}
  90%{transform:translate(-2%,-1%)}
}
@keyframes scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
`;

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useMagnet(strength = 0.4) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 200, damping: 20 });
  const y = useSpring(0, { stiffness: 200, damping: 20 });
  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  }, [strength, x, y]);
  const onLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return { ref, x, y, onMove, onLeave };
}

function useScramble(text, trigger) {
  const [display, setDisplay] = useState(text);
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";
  useEffect(() => {
    if (!trigger) return;
    let frame = 0;
    const total = 18;
    const id = setInterval(() => {
      setDisplay(text.split("").map((ch, i) => {
        if (ch === " ") return " ";
        if (frame / total > i / text.length) return ch;
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join(""));
      frame++;
      if (frame > total) { setDisplay(text); clearInterval(id); }
    }, 40);
    return () => clearInterval(id);
  }, [trigger, text]);
  return display;
}

// ─── CURSOR ──────────────────────────────────────────────────────────────────
function Cursor() {
  const cx = useMotionValue(-100);
  const cy = useMotionValue(-100);
  const sx = useSpring(cx, { stiffness: 500, damping: 40 });
  const sy = useSpring(cy, { stiffness: 500, damping: 40 });
  const rx = useSpring(cx, { stiffness: 120, damping: 20 });
  const ry = useSpring(cy, { stiffness: 120, damping: 20 });
  const [hov, setHov] = useState(false);
  const [click, setClick] = useState(false);
  useEffect(() => {
    const move = (e) => { cx.set(e.clientX); cy.set(e.clientY); };
    const over = (e) => setHov(!!e.target.closest("a,button,[data-mag]"));
    const down = () => setClick(true);
    const up = () => setClick(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);
  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      {/* dot */}
      <motion.div style={{
        position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9999,
        x: useTransform(sx, v => v - 4), y: useTransform(sy, v => v - 4),
        width: 8, height: 8, borderRadius: "50%", background: G.accent,
        scale: click ? 0.5 : 1, mixBlendMode: "difference",
      }} />
      {/* ring */}
      <motion.div style={{
        position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9998,
        x: useTransform(rx, v => v - (hov ? 24 : 16)),
        y: useTransform(ry, v => v - (hov ? 24 : 16)),
        width: hov ? 48 : 32, height: hov ? 48 : 32,
        borderRadius: "50%",
        border: `1px solid ${hov ? G.accent : "rgba(245,166,35,0.35)"}`,
        transition: "width 0.3s, height 0.3s, border-color 0.3s",
      }} />
    </>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = ["Work", "Experience", "Skills", "Contact"];
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "1.25rem 2.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: scrolled ? `1px solid ${G.border}` : "1px solid transparent",
        background: scrolled ? "rgba(5,5,5,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        transition: "all 0.4s ease",
      }}>
      <span className="mono" style={{ fontSize: "0.78rem", color: G.accent, letterSpacing: "0.1em" }}>
        AG.DEV
      </span>
      <div style={{ display: "flex", gap: "2.5rem" }}>
        {links.map((l) => (
          <motion.a
            key={l} href={`#${l.toLowerCase()}`}
            className="mono"
            whileHover={{ color: G.accent }}
            style={{ fontSize: "0.7rem", color: G.text2, letterSpacing: "0.12em", textTransform: "uppercase", transition: "color 0.2s" }}>
            {l}
          </motion.a>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: G.green }} />
        <span className="mono" style={{ fontSize: "0.65rem", color: G.text2 }}>Available</span>
      </div>
    </motion.nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setTimeout(() => setReady(true), 200); }, []);
  const nameA = useScramble("ABDULLAH", ready);
  const nameB = useScramble("GHAFFAR", ready);
  const mag = useMagnet(0.15);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -120]);
  const heroOp = useTransform(scrollY, [0, 500], [1, 0]);

  const roles = ["Backend Engineer", "AI Systems", "Automation", "RAG Pipelines", "Full Stack"];
  const [roleIdx, setRoleIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setRoleIdx(i => (i + 1) % roles.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.section id="hero" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "flex-end", padding: "0 2.5rem 5rem",
      position: "relative", overflow: "hidden",
      y: heroY, opacity: heroOp,
    }}>
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(${G.border} 1px, transparent 1px), linear-gradient(90deg, ${G.border} 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
        maskImage: "radial-gradient(ellipse 70% 70% at 20% 80%, black 30%, transparent 100%)",
      }} />

      {/* Grain overlay */}
      <div style={{
        position: "absolute", inset: "-50%", zIndex: 1, opacity: 0.035,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        animation: "grain 0.5s steps(1) infinite",
        pointerEvents: "none",
      }} />

      {/* Amber glow */}
      <div style={{
        position: "absolute", bottom: "-200px", left: "-100px", zIndex: 0,
        width: "700px", height: "700px", borderRadius: "50%",
        background: `radial-gradient(circle, ${G.accentGlow} 0%, transparent 65%)`,
        pointerEvents: "none",
      }} />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", zIndex: 2, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: 32, height: 1, background: G.accent }} />
        <span className="mono" style={{ fontSize: "0.68rem", color: G.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Software Engineer · Islamabad, Pakistan · 2026
        </span>
      </motion.div>

      {/* Giant name */}
      <motion.div
        ref={mag.ref}
        onMouseMove={mag.onMove}
        onMouseLeave={mag.onLeave}
        style={{ x: mag.x, y: mag.y, position: "relative", zIndex: 2, lineHeight: 0.88, marginBottom: "2rem" }}>
        <motion.h1
          className="display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: "clamp(5rem, 15vw, 14rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            color: G.text,
            display: "block",
            lineHeight: 0.9,
          }}>
          <motion.span
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "block" }}>
            {nameA}
          </motion.span>
          <motion.span
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "block", WebkitTextStroke: `2px ${G.accent}`, color: "transparent" }}>
            {nameB}
          </motion.span>
        </motion.h1>
      </motion.div>

      {/* Role ticker + desc */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}>
          <div className="mono" style={{ fontSize: "0.65rem", color: G.text3, letterSpacing: "0.15em", marginBottom: "0.4rem", textTransform: "uppercase" }}>
            Currently focused on
          </div>
          <div style={{ overflow: "hidden", height: "2rem" }}>
            <motion.div
              key={roleIdx}
              initial={{ y: 32 }} animate={{ y: 0 }}
              exit={{ y: -32 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="display"
              style={{ fontSize: "1.5rem", fontWeight: 700, color: G.accent }}>
              {roles[roleIdx]}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
          style={{ maxWidth: 380 }}>
          <p className="body-font" style={{ fontSize: "0.9rem", color: G.text2, lineHeight: 1.7, marginBottom: "1.5rem" }}>
            I build backend systems, AI pipelines, and automation workflows that actually ship —
            load-tested under real load, delivered to paying clients, and maintained with care.
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <MagButton href="#work" primary>View Work</MagButton>
            <MagButton href="mailto:abdullah.gheffer@gmail.com">Get In Touch</MagButton>
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        style={{ position: "absolute", right: "2.5rem", bottom: "3rem", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ writingMode: "vertical-rl", fontFamily: "IBM Plex Mono", fontSize: "0.62rem", color: G.text3, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Scroll
        </div>
        <motion.div
          animate={{ scaleY: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          style={{ width: 1, height: 48, background: `linear-gradient(${G.accent}, transparent)` }} />
      </motion.div>
    </motion.section>
  );
}

// ─── MAGNETIC BUTTON ──────────────────────────────────────────────────────────
function MagButton({ children, href, primary }) {
  const mag = useMagnet(0.35);
  return (
    <motion.a
      href={href}
      ref={mag.ref}
      onMouseMove={mag.onMove}
      onMouseLeave={mag.onLeave}
      style={{ x: mag.x, y: mag.y }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}>
      <div className="mono" style={{
        fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase",
        padding: "0.85rem 1.75rem", borderRadius: "3px",
        background: primary ? G.accent : "transparent",
        color: primary ? "#000" : G.text2,
        border: primary ? "none" : `1px solid ${G.border2}`,
        fontWeight: primary ? 700 : 400,
        transition: "color 0.2s, border-color 0.2s",
        display: "inline-block",
      }}>
        {children}
      </div>
    </motion.a>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { n: "22.5K", label: "Users Served", sub: "FYPilot platform" },
    { n: "<$0.03", label: "Per AI Run", sub: "ContraGuard AI" },
    { n: "70%", label: "Overhead Cut", sub: "Admin automation" },
    { n: "<25s", label: "Full Analysis", sub: "6-agent pipeline" },
    { n: "33%", label: "Latency Drop", sub: "Redis caching" },
    { n: "85%", label: "Match Accuracy", sub: "Semantic similarity" },
  ];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section ref={ref} style={{ padding: "0 2.5rem 8rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(6, 1fr)",
        borderTop: `1px solid ${G.border}`, borderLeft: `1px solid ${G.border}`,
      }}>
        {stats.map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              padding: "2rem 1.5rem",
              borderRight: `1px solid ${G.border}`,
              borderBottom: `1px solid ${G.border}`,
            }}>
            <div className="display" style={{ fontSize: "2.2rem", fontWeight: 800, color: G.accent, lineHeight: 1, marginBottom: "0.4rem" }}>
              {s.n}
            </div>
            <div className="mono" style={{ fontSize: "0.68rem", color: G.text, letterSpacing: "0.05em", marginBottom: "0.2rem" }}>
              {s.label}
            </div>
            <div className="mono" style={{ fontSize: "0.6rem", color: G.text3 }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
function ProjectCard({ project, index, featured }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sRotX = useSpring(rotX, { stiffness: 200, damping: 30 });
  const sRotY = useSpring(rotY, { stiffness: 200, damping: 30 });
  const [hov, setHov] = useState(false);

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotX.set(-py * 8);
    rotY.set(px * 8);
  };
  const handleLeave = () => { rotX.set(0); rotY.set(0); setHov(false); };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={handleLeave}
      style={{
        rotateX: sRotX, rotateY: sRotY,
        transformStyle: "preserve-3d",
        perspective: 1000,
        gridColumn: featured ? "1 / -1" : "auto",
        background: G.bg2,
        border: `1px solid ${hov ? G.border2 : G.border}`,
        borderRadius: "6px",
        padding: featured ? "3rem" : "2rem",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.3s",
        display: featured ? "grid" : "block",
        gridTemplateColumns: featured ? "1fr 1fr" : undefined,
        gap: featured ? "4rem" : undefined,
      }}>
      {/* Hover glow */}
      <motion.div
        animate={{ opacity: hov ? 1 : 0 }}
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(circle at 50% 0%, ${G.accentDim}, transparent 60%)`,
          transition: "opacity 0.4s",
        }} />
      {/* Top accent line */}
      <motion.div
        animate={{ scaleX: hov ? 1 : 0 }}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "1px",
          background: `linear-gradient(90deg, transparent, ${G.accent}, transparent)`,
          transformOrigin: "left",
          transition: "transform 0.4s ease",
        }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <span className="mono" style={{ fontSize: "0.6rem", color: G.text3, letterSpacing: "0.2em" }}>
            {String(index + 1).padStart(2, "0")} / PROJECT
          </span>
          {project.status && (
            <span className="mono" style={{
              fontSize: "0.6rem", padding: "0.2rem 0.6rem", borderRadius: "2px",
              background: G.accentDim, color: G.accent, border: `1px solid rgba(245,166,35,0.2)`,
            }}>{project.status}</span>
          )}
        </div>
        <h3 className="display" style={{ fontSize: featured ? "2.5rem" : "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          {project.name}
        </h3>
        <p className="body-font" style={{ fontSize: "0.85rem", color: G.text2, lineHeight: 1.6, marginBottom: "1.25rem" }}>
          {project.tagline}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.5rem" }}>
          {project.metrics.map((m, i) => (
            <span key={i} className="mono" style={{
              fontSize: "0.65rem", padding: "0.25rem 0.6rem", borderRadius: "2px",
              background: i === 0 ? G.accentDim : "rgba(255,255,255,0.04)",
              color: i === 0 ? G.accent : G.text2,
              border: `1px solid ${i === 0 ? "rgba(245,166,35,0.2)" : G.border}`,
            }}>{m}</span>
          ))}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
          {project.stack.map((s, i) => (
            <span key={i} className="mono" style={{
              fontSize: "0.6rem", color: G.text3, padding: "0.2rem 0.5rem",
              border: `1px solid ${G.border}`, borderRadius: "2px",
            }}>{s}</span>
          ))}
        </div>
      </div>

      {featured && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {project.bullets.map((b, i) => (
              <li key={i} style={{ display: "flex", gap: "0.75rem", fontSize: "0.82rem", color: G.text2, lineHeight: 1.65 }}>
                <span className="mono" style={{ color: G.accent, fontSize: "0.7rem", flexShrink: 0, marginTop: "0.15rem" }}>→</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

// ─── WORK ─────────────────────────────────────────────────────────────────────
function Work() {
  const projects = [
    {
      name: "FYPilot",
      tagline: "AI-enhanced FYP management system for FAST-NUCES's 22,500 students.",
      status: "Production Ready",
      metrics: ["2 months → minutes", "85% match accuracy", "70% overhead cut", "Artillery stress-tested"],
      stack: ["Python", "FastAPI", "React", "OR-Tools CP-SAT", "FAISS", "PostgreSQL", "Redis", "PM2", "Docker", "GitHub Actions", "LangChain"],
      bullets: [
        "Replaced a 2-month manual panel assignment process with an OR-Tools CP-SAT constraint optimisation engine — supervisor availability, expertise matching, workload caps. Baseline measured directly from academic officers under NDA.",
        "FAISS semantic similarity + novelty weighting ensemble detects duplicate proposals. Validated with heavily paraphrased variants — returned 85% match with correct clause attribution. Admin overhead cut 70%.",
        "Polyglot persistence (PostgreSQL + Redis) with PM2 cluster mode to fully utilise CPU cores. Stays responsive under simultaneous load from thousands of concurrent users.",
        "Artillery stress-tested under full concurrent load. CI/CD via GitHub Actions: testing → Docker builds → staged deployment.",
      ],
    },
    {
      name: "ContraGuard AI",
      tagline: "6-agent LangChain contract risk analysis. Full review in under 25 seconds at under $0.03.",
      metrics: ["<25s end-to-end", "<$0.03 / run", "33% latency reduction", "15% fewer LLM calls"],
      stack: ["LangChain", "BERT/RoBERTa", "ChromaDB", "Celery", "Redis", "Tesseract OCR", "FastAPI", "React", "Docker"],
    },
    {
      name: "Mandi Express",
      tagline: "Full MLOps pipeline for agricultural price prediction across all Pakistani mandis.",
      metrics: ["Nationwide coverage", "Live drift monitoring", "Continuous retraining"],
      stack: ["Airflow", "MLflow", "DVC", "AWS S3", "GitHub Actions", "CML", "Prometheus", "Grafana", "Docker"],
    },
    {
      name: "Maze Lab",
      tagline: "The entire DSA syllabus in one C++ codebase. Human vs AI gameplay.",
      metrics: ["A* pathfinding", "MST generation", "OOP architecture"],
      stack: ["C++", "OOP", "A*", "MST", "Graph Traversal", "STL"],
    },
  ];
  return (
    <section id="work" style={{ padding: "0 2.5rem 8rem", maxWidth: 1200, margin: "0 auto" }}>
      <SectionLabel label="Selected Work" />
      <SectionTitle lines={["Things I've built", "that actually ship."]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: G.border, border: `1px solid ${G.border}`, borderRadius: "6px", overflow: "hidden" }}>
        {projects.map((p, i) => (
          <div key={i} style={{ background: G.bg, gridColumn: i === 0 ? "1 / -1" : "auto" }}>
            <ProjectCard project={p} index={i} featured={i === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── EXPERIENCE ───────────────────────────────────────────────────────────────
function Experience() {
  const items = [
    {
      date: "Jan 2026 – May 2026", co: "Accessory Kingz", loc: "Remote · Sharjah, UAE",
      role: "Software Engineer (Contract)",
      bullets: [
        "Sole engineer on a greenfield WMS: architected and delivered the full system on UltimatePOS with deep refactoring across service and utility layers — changes had system-wide ripple effects requiring full regression coverage.",
        "Custom modules for inventory, HRM, order processing, and profit monitoring with UAE-specific business logic.",
        "Cut operator data-entry time ~10% by automating redundant manual steps. Delivered on schedule with full handover documentation.",
      ],
    },
    {
      date: "Jul 2025 – Aug 2025", co: "Foowin Living", loc: "Remote · via SSMarketing",
      role: "Web Developer (Contract)",
      bullets: [
        "Converted a dead static page into a fully automated SMTP-based inquiry routing system — eliminated 100% of missed customer messages.",
        "Improved session retention and SEO via navbar redesign, dynamic content truncation, and deliberate CTAs.",
      ],
    },
    {
      date: "Aug 2022 – Jun 2026", co: "FAST-NUCES", loc: "Islamabad, Pakistan",
      role: "B.S. Software Engineering",
      bullets: [
        "Relevant: Software Architecture · OS · DSA · DB Systems · Networks · Applied AI · MLOps · Generative AI · InfoSec · Formal Methods · BPE · Process Mining.",
        "Runner-up, NASCON 2025 Software Engineering Quiz — 2nd among 50+ teams nationwide.",
        "NASCON 2024 Web Dev Hackathon — built 3D interactive EdTech platform.",
      ],
    },
  ];
  return (
    <section id="experience" style={{ padding: "0 2.5rem 8rem", maxWidth: 1200, margin: "0 auto" }}>
      <SectionLabel label="Experience" />
      <SectionTitle lines={["Real clients.", "Real systems."]} />
      <div>
        {items.map((item, i) => {
          const ref = useRef(null);
          const inView = useInView(ref, { once: true, margin: "-60px" });
          return (
            <motion.div key={i} ref={ref}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "grid", gridTemplateColumns: "200px 1fr",
                gap: "3rem", padding: "2.5rem 0",
                borderBottom: `1px solid ${G.border}`,
              }}>
              <div>
                <div className="mono" style={{ fontSize: "0.65rem", color: G.text3, marginBottom: "0.4rem" }}>{item.date}</div>
                <div className="mono" style={{ fontSize: "0.78rem", color: G.accent, marginBottom: "0.25rem" }}>{item.co}</div>
                <div className="mono" style={{ fontSize: "0.62rem", color: G.text3 }}>{item.loc}</div>
              </div>
              <div>
                <div className="display" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem" }}>{item.role}</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {item.bullets.map((b, j) => (
                    <li key={j} style={{ display: "flex", gap: "0.75rem", fontSize: "0.82rem", color: G.text2, lineHeight: 1.65 }}>
                      <span className="mono" style={{ color: G.accent, fontSize: "0.65rem", flexShrink: 0, marginTop: "0.2rem" }}>▸</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ─── SKILLS ───────────────────────────────────────────────────────────────────
function Skills() {
  const groups = [
    { label: "Languages", items: ["Python", "C++", "TypeScript", "JavaScript", "SQL", "Java", "Bash", "C#"] },
    { label: "Backend", items: ["FastAPI", "Node.js", "REST APIs", "Microservices", "Celery", "WebSockets", "LangChain"] },
    { label: "AI / ML", items: ["RAG Pipelines", "BERT/RoBERTa", "FAISS", "ChromaDB", "PyTorch", "LLM Integration", "OR-Tools CP-SAT", "Sentence Transformers", "YOLO", "OpenCV"] },
    { label: "Databases", items: ["PostgreSQL", "Redis", "ChromaDB", "SQLite", "Schema Design", "Query Optimisation"] },
    { label: "DevOps / Cloud", items: ["Docker", "GitHub Actions", "AWS S3/ECS/Lambda", "PM2", "Airflow", "MLflow", "DVC", "Prometheus", "Grafana", "DagsHub"] },
    { label: "Frontend", items: ["React 18", "TypeScript", "Tailwind CSS", "Figma", "HTML/CSS"] },
    { label: "Automation", items: ["n8n", "SMTP Pipelines", "Webhook Flows", "API Integrations", "Celery", "GitHub Actions CML"] },
    { label: "Engineering", items: ["System Design", "OOP", "Design Patterns", "TDD", "pytest", "Artillery", "A*", "Graph Algorithms"] },
  ];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section id="skills" style={{ padding: "0 2.5rem 8rem", maxWidth: 1200, margin: "0 auto" }}>
      <SectionLabel label="Technical Skills" />
      <SectionTitle lines={["The full stack."]} />
      <div ref={ref} style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        border: `1px solid ${G.border}`, borderRadius: "6px", overflow: "hidden",
      }}>
        {groups.map((g, gi) => (
          <motion.div key={gi}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: gi * 0.06, duration: 0.5 }}
            style={{
              padding: "1.75rem",
              borderRight: (gi + 1) % 4 !== 0 ? `1px solid ${G.border}` : "none",
              borderBottom: gi < 4 ? `1px solid ${G.border}` : "none",
            }}>
            <div className="mono" style={{ fontSize: "0.6rem", color: G.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>
              {g.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {g.items.map((item, ii) => (
                <motion.span key={ii}
                  whileHover={{ color: G.accent, borderColor: G.accent, background: G.accentDim }}
                  className="mono"
                  style={{
                    fontSize: "0.68rem", color: G.text2, padding: "0.25rem 0.55rem",
                    border: `1px solid ${G.border}`, borderRadius: "2px",
                    transition: "all 0.2s", cursor: "default",
                  }}>
                  {item}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────
function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const links = [
    { icon: "✉", label: "Email", val: "abdullah.gheffer@gmail.com", href: "mailto:abdullah.gheffer@gmail.com" },
    { icon: "gh", label: "GitHub", val: "github.com/Abdullah9213", href: "https://github.com/Abdullah9213" },
    { icon: "in", label: "LinkedIn", val: "linkedin.com/in/abdullah-ghaffar--", href: "https://linkedin.com/in/abdullah-ghaffar--" },
    { icon: "↗", label: "Portfolio", val: "abdullahghaffar.dev", href: "https://abdullahghaffar.dev" },
  ];
  return (
    <section id="contact" style={{
      borderTop: `1px solid ${G.border}`,
      padding: "8rem 2.5rem",
    }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8rem", alignItems: "center" }}>
        <div>
          <SectionLabel label="Contact" />
          <motion.h2
            className="display"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(3rem, 6vw, 5rem)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em", marginBottom: "1.5rem" }}>
            Let's build<br />
            <span style={{ WebkitTextStroke: `2px ${G.accent}`, color: "transparent" }}>something</span><br />
            real.
          </motion.h2>
          <motion.p
            className="body-font"
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{ fontSize: "0.88rem", color: G.text2, lineHeight: 1.7, marginBottom: "2rem" }}>
            Open to full-time roles, long-term contracts, and serious freelance projects.
            If you need someone who ships and thinks about the outcome — not just the ticket — reach out.
          </motion.p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {links.map((l, i) => (
              <motion.a key={i} href={l.href} target="_blank"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.1 * i + 0.3, duration: 0.5 }}
                whileHover={{ x: 6, borderColor: G.accent }}
                style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "0.85rem 1rem", border: `1px solid ${G.border}`,
                  borderRadius: "3px", transition: "border-color 0.2s",
                }}>
                <span className="mono" style={{ fontSize: "0.65rem", color: G.accent, width: "20px" }}>{l.icon}</span>
                <span className="mono" style={{ fontSize: "0.65rem", color: G.text3, width: "70px", letterSpacing: "0.1em" }}>{l.label}</span>
                <span className="mono" style={{ fontSize: "0.72rem", color: G.text2 }}>{l.val}</span>
              </motion.a>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
          style={{
            background: G.bg2, border: `1px solid ${G.border}`,
            borderRadius: "6px", padding: "2.5rem",
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: G.green }} />
            <span className="mono" style={{ fontSize: "0.68rem", color: G.green, letterSpacing: "0.1em" }}>
              Available for new work — June 2026
            </span>
          </div>
          {[
            ["Location", "Islamabad, Pakistan"],
            ["Timezone", "UTC+5"],
            ["Preferred Role", "Backend / AI Engineer"],
            ["Open To", "Full-time · Contract · Remote"],
            ["Graduating", "June 2026"],
            ["Response Time", "Within 24 hours"],
            ["Phone", "+92 318-0687481"],
          ].map(([k, v], i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.7rem 0", borderBottom: `1px solid ${G.border}`,
            }}>
              <span className="mono" style={{ fontSize: "0.65rem", color: G.text3 }}>{k}</span>
              <span className="mono" style={{ fontSize: "0.7rem", color: G.text }}>{v}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${G.border}`,
      padding: "2rem 2.5rem",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <span className="mono" style={{ fontSize: "0.65rem", color: G.text3 }}>© 2026 Abdullah Ghaffar</span>
      <span className="mono" style={{ fontSize: "0.65rem", color: G.text3 }}>
        Built from scratch · <span style={{ color: G.accent }}>No templates</span>
      </span>
    </footer>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function SectionLabel({ label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
      <div style={{ width: 20, height: 1, background: G.accent }} />
      <span className="mono" style={{ fontSize: "0.65rem", color: G.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>{label}</span>
    </motion.div>
  );
}

function SectionTitle({ lines }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} style={{ marginBottom: "3.5rem" }}>
      {lines.map((line, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="display"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          {line}
        </motion.div>
      ))}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{FONTS + css}</style>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Work />
        <Experience />
        <Skills />
        <Contact />
        <Footer />
      </main>
    </>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Paleta y tokens ───────────────────────────────────────────────────────────
const theme = {
  bg: "#0D1117",
  surface: "#161B22",
  surfaceAlt: "#1C2128",
  border: "#30363D",
  accent: "#58A6FF",
  accentSoft: "rgba(88,166,255,0.12)",
  accentGlow: "rgba(88,166,255,0.25)",
  teal: "#56D364",
  tealSoft: "rgba(86,211,100,0.12)",
  amber: "#E3B341",
  amberSoft: "rgba(227,179,65,0.12)",
  rose: "#F85149",
  roseSoft: "rgba(248,81,73,0.12)",
  violet: "#BC8CFF",
  violetSoft: "rgba(188,140,255,0.12)",
  text: "#E6EDF3",
  textMuted: "#8B949E",
  textDim: "#484F58",
};

// ─── Datos iniciales ───────────────────────────────────────────────────────────
const INITIAL_STATE = {
  screen: "home",
  profile: { name: "", streak: 0, totalSessions: 0, joinDate: null },
  logs: [],       // { date, level, triggers, mood, notes, techniques }
  currentCrisis: false,
};

const ANXIETY_TECHNIQUES = [
  {
    id: "box-breath",
    name: "Respiración Box",
    category: "Neurociencia",
    icon: "⬛",
    color: theme.accent,
    colorSoft: theme.accentSoft,
    desc: "Regula el sistema nervioso autónomo en 4 minutos",
    science: "Activa el nervio vago y reduce el cortisol",
    steps: [4, 4, 4, 4],
    labels: ["Inhala", "Sostén", "Exhala", "Sostén"],
    duration: 480,
  },
  {
    id: "478",
    name: "Técnica 4-7-8",
    category: "Neurociencia",
    icon: "🌊",
    color: theme.teal,
    colorSoft: theme.tealSoft,
    desc: "Induce relajación profunda en ciclos de respiración",
    science: "Estimula el sistema parasimpático",
    steps: [4, 7, 8, 0],
    labels: ["Inhala", "Sostén", "Exhala", ""],
    duration: 380,
  },
  {
    id: "grounding-54321",
    name: "Grounding 5-4-3-2-1",
    category: "Psicoanálisis",
    icon: "🎯",
    color: theme.violet,
    colorSoft: theme.violetSoft,
    desc: "Ancla tu mente al presente interrumpiendo el ciclo de ansiedad",
    science: "Técnica de anclaje sensorial cognitivo-conductual",
    steps: null,
    duration: 300,
    guide: [
      { title: "5 cosas que VES", icon: "👁️", desc: "Mira a tu alrededor y nombra 5 cosas que puedes ver. Sé específico: el borde de una silla, una sombra en la pared..." },
      { title: "4 cosas que TOCAS", icon: "✋", desc: "Lleva atención a tu cuerpo. Nombra 4 sensaciones físicas: la textura de tu ropa, el peso del teléfono, el suelo bajo tus pies." },
      { title: "3 cosas que ESCUCHAS", icon: "👂", desc: "Cierra los ojos y escucha. Nombra 3 sonidos distintos: cercanos, lejanos, suaves o fuertes." },
      { title: "2 cosas que HUELES", icon: "👃", desc: "Inhala y presta atención a los olores del ambiente. Si no percibes nada, recuerda un olor que te genere calma." },
      { title: "1 cosa que SABOREAS", icon: "👅", desc: "Presta atención a tu boca. ¿Qué sabor sientes ahora mismo? Acéptalo sin juzgarlo." },
    ],
  },
  {
    id: "body-scan",
    name: "Escaneo Corporal",
    category: "Neurociencia",
    icon: "🧘",
    color: theme.amber,
    colorSoft: theme.amberSoft,
    desc: "Identifica tensión física y libérala conscientemente",
    science: "Integración mente-cuerpo / Somática",
    steps: null,
    duration: 600,
    guide: [
      { title: "Pies y tobillos", icon: "🦶", desc: "Lleva tu atención a los pies. ¿Sientes tensión, calor o frío? No juzgues, solo observa y respira." },
      { title: "Piernas y rodillas", icon: "🦵", desc: "Sube lentamente a pantorrillas y rodillas. Inhala profundo y al exhalar, suelta cualquier tensión que encuentres." },
      { title: "Caderas y abdomen", icon: "⭕", desc: "Observa el movimiento de tu abdomen al respirar. ¿Tu cadera está tensa o relajada? Permítete soltar." },
      { title: "Pecho y espalda", icon: "💙", desc: "¿Sientes opresión en el pecho? Inhala profundo y al exhalar deja que se ablande. Relaja también la espalda." },
      { title: "Hombros y cuello", icon: "🌡️", desc: "Zona de mayor tensión. Eleva los hombros al inhalar y suéltalos con fuerza al exhalar. Repite 2 veces." },
      { title: "Rostro y cabeza", icon: "😌", desc: "Relaja la mandíbula, suaviza el ceño. Deja que tu mente descanse. Todo tu cuerpo está ahora más liviano." },
    ],
  },
  {
    id: "cognitive-reframe",
    name: "Reestructuración Cognitiva",
    category: "Psicoanálisis",
    icon: "🔄",
    color: theme.accent,
    colorSoft: theme.accentSoft,
    desc: "Desafía pensamientos automáticos negativos",
    science: "Terapia Cognitivo-Conductual (TCC)",
    steps: null,
    duration: 420,
    guide: [
      { title: "Identifica el pensamiento", icon: "💭", desc: "¿Qué pensamiento automático está generando ansiedad? Nómbralo con claridad, sin juzgarlo: 'Estoy pensando que...'" },
      { title: "Busca la evidencia", icon: "🔍", desc: "¿Qué evidencia real tienes de que ese pensamiento es verdadero? ¿Y qué evidencia tienes en contra? Sé honesto." },
      { title: "Perspectiva externa", icon: "🪞", desc: "Si un amigo tuviera ese mismo pensamiento, ¿qué le dirías? ¿Cómo lo verías desde afuera, sin estar dentro?" },
      { title: "Descatastrofiza", icon: "📉", desc: "¿Cuál es el peor escenario realista? ¿Podrías manejarlo si ocurriera? ¿Qué tan probable es realmente que pase?" },
      { title: "Pensamiento equilibrado", icon: "⚖️", desc: "Formula un pensamiento más balanceado que reconozca la realidad sin exagerarla. No tienes que ser optimista, solo justo." },
    ],
  },
];

const MOODS = [
  { emoji: "😰", label: "Crisis", value: 1, color: theme.rose },
  { emoji: "😟", label: "Alto", value: 2, color: "#F0883E" },
  { emoji: "😐", label: "Medio", value: 3, color: theme.amber },
  { emoji: "🙂", label: "Bajo", value: 4, color: theme.teal },
  { emoji: "😌", label: "Tranquilo", value: 5, color: theme.accent },
];

const TRIGGERS = [
  "Trabajo", "Relaciones", "Salud", "Finanzas", "Social",
  "Familia", "Futuro", "Pasado", "Cuerpo", "Sin causa",
];

// ─── Utilerías ─────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().split("T")[0];
}
function fmtDate(d) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-MX", {
    day: "2-digit", month: "short",
  });
}
function avgLevel(logs) {
  if (!logs.length) return 0;
  return (logs.reduce((s, l) => s + l.level, 0) / logs.length).toFixed(1);
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function SerenityLogo({ size = 48 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 512 512">
      <defs>
        <linearGradient id="slwg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#BC8CFF"/>
          <stop offset="50%"  stopColor="#58A6FF"/>
          <stop offset="100%" stopColor="#56D364"/>
        </linearGradient>
        <radialGradient id="slbg" cx="50%" cy="42%" r="60%">
          <stop offset="0%"   stopColor="#1C2128"/>
          <stop offset="100%" stopColor="#0D1117"/>
        </radialGradient>
        <filter id="slglow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="slcc"><circle cx="256" cy="256" r="178"/></clipPath>
      </defs>
      <rect width="512" height="512" rx="108" fill="url(#slbg)"/>
      <circle cx="256" cy="256" r="188" fill="#161B22" stroke="#21262D" strokeWidth="2"/>
      <circle cx="256" cy="256" r="155" fill="none" stroke="#30363D" strokeWidth="1" opacity="0.35"/>
      <g filter="url(#slglow)" clipPath="url(#slcc)" opacity="0.45">
        <path d="M78,256 C110,256 133,172 165,172 C197,172 219,340 251,340 C283,340 305,172 337,172 C369,172 391,256 423,256"
              fill="none" stroke="url(#slwg)" strokeWidth="24" strokeLinecap="round"/>
      </g>
      <path clipPath="url(#slcc)"
            d="M78,256 C110,256 133,172 165,172 C197,172 219,340 251,340 C283,340 305,172 337,172 C369,172 391,256 423,256"
            fill="none" stroke="url(#slwg)" strokeWidth="14" strokeLinecap="round"/>
      <circle cx="165" cy="172" r="9" fill="#BC8CFF" opacity="0.9"/>
      <circle cx="165" cy="172" r="5" fill="#e8d8ff" opacity="0.95"/>
      <circle cx="251" cy="340" r="9" fill="#58A6FF" opacity="0.9"/>
      <circle cx="251" cy="340" r="5" fill="#d0e8ff" opacity="0.95"/>
      <circle cx="337" cy="172" r="9" fill="#56D364" opacity="0.9"/>
      <circle cx="337" cy="172" r="5" fill="#d0ffe0" opacity="0.95"/>
    </svg>
  );
}

// ─── CSS global ────────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body, #root {
      height: 100%;
      background: ${theme.bg};
      color: ${theme.text};
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      -webkit-font-smoothing: antialiased;
      overscroll-behavior: none;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 2px; }

    .app-shell {
      max-width: 430px;
      margin: 0 auto;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }

    .screen {
      flex: 1;
      overflow-y: auto;
      padding: 0 0 80px;
    }

    /* ── Animaciones ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes breathe-in {
      from { transform: scale(1); }
      to   { transform: scale(1.45); }
    }
    @keyframes breathe-out {
      from { transform: scale(1.45); }
      to   { transform: scale(1); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes crisis-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(248,81,73,0.4); }
      50%       { box-shadow: 0 0 0 12px rgba(248,81,73,0); }
    }

    .fade-up { animation: fadeUp 0.4s ease both; }

    .card {
      background: ${theme.surface};
      border: 1px solid ${theme.border};
      border-radius: 16px;
      padding: 18px;
    }
    .card-sm {
      background: ${theme.surface};
      border: 1px solid ${theme.border};
      border-radius: 12px;
      padding: 14px;
    }

    button { cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; }

    .btn-primary {
      background: ${theme.accent};
      color: #0D1117;
      border-radius: 12px;
      padding: 14px 24px;
      font-size: 15px;
      font-weight: 600;
      width: 100%;
      transition: opacity 0.2s, transform 0.15s;
    }
    .btn-primary:active { opacity: 0.85; transform: scale(0.98); }

    .btn-ghost {
      background: transparent;
      color: ${theme.textMuted};
      border-radius: 12px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 500;
      width: 100%;
      border: 1px solid ${theme.border};
      transition: background 0.2s;
    }
    .btn-ghost:active { background: ${theme.surfaceAlt}; }

    .section-header {
      font-family: 'Fraunces', serif;
      font-size: 22px;
      font-weight: 600;
      color: ${theme.text};
      line-height: 1.2;
    }
    .label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: ${theme.textMuted};
    }

    /* Nav bottom */
    .bottom-nav {
      position: fixed;
      bottom: 0; left: 50%; transform: translateX(-50%);
      width: 100%; max-width: 430px;
      background: ${theme.surface};
      border-top: 1px solid ${theme.border};
      display: flex;
      padding: 8px 0 env(safe-area-inset-bottom, 8px);
      z-index: 100;
    }
    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 6px 4px;
      background: transparent;
      border: none;
      color: ${theme.textDim};
      font-size: 10px;
      font-weight: 500;
      font-family: 'DM Sans', sans-serif;
      transition: color 0.2s;
    }
    .nav-item.active { color: ${theme.accent}; }
    .nav-icon { font-size: 20px; }

    /* Chip */
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid ${theme.border};
      background: transparent;
      color: ${theme.textMuted};
    }
    .chip.selected {
      background: ${theme.accentSoft};
      border-color: ${theme.accent};
      color: ${theme.accent};
    }

    /* Range slider */
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      background: ${theme.border};
      border-radius: 3px;
      outline: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 22px; height: 22px;
      border-radius: 50%;
      background: ${theme.accent};
      box-shadow: 0 0 0 4px ${theme.accentSoft};
      cursor: pointer;
    }

    textarea, input[type=text] {
      background: ${theme.surfaceAlt};
      border: 1px solid ${theme.border};
      border-radius: 12px;
      color: ${theme.text};
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      padding: 12px 14px;
      width: 100%;
      outline: none;
      resize: none;
      transition: border-color 0.2s;
    }
    textarea:focus, input[type=text]:focus {
      border-color: ${theme.accent};
    }
    textarea::placeholder, input::placeholder {
      color: ${theme.textDim};
    }

    /* Progress bar */
    .progress-bar {
      height: 6px;
      background: ${theme.border};
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.6s ease;
    }

    /* Crisis button */
    .crisis-fab {
      position: fixed;
      bottom: 72px; right: 16px;
      width: 56px; height: 56px;
      border-radius: 50%;
      background: ${theme.rose};
      color: white;
      font-size: 22px;
      display: flex; align-items: center; justify-content: center;
      border: none;
      box-shadow: 0 4px 20px rgba(248,81,73,0.4);
      z-index: 99;
      cursor: pointer;
      animation: crisis-pulse 2.5s ease infinite;
    }

    .breathing-circle {
      width: 160px; height: 160px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column;
      position: relative;
      margin: 0 auto;
    }
    .breathing-ring {
      position: absolute;
      inset: -16px;
      border-radius: 50%;
      border: 2px solid;
      opacity: 0;
    }
  `}</style>
);

// ─── Componentes pequeños ──────────────────────────────────────────────────────
function ProgressBar({ value, max, color = theme.accent }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function Badge({ label, color, bg }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 9px",
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 600,
      color,
      background: bg,
    }}>{label}</span>
  );
}

// ─── Pantalla: Onboarding ──────────────────────────────────────────────────────
function OnboardingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");

  const slides = [
    {
      icon: "🧠",
      title: "Tu espacio seguro",
      body: "Herramientas basadas en neurociencia y psicoanálisis para entender, procesar y reducir tu ansiedad cada día.",
    },
    {
      icon: "📊",
      title: "Seguimiento inteligente",
      body: "Registra tus niveles diarios, identifica patrones y celebra cada avance en tu camino hacia el bienestar.",
    },
    {
      icon: "🆘",
      title: "Siempre contigo",
      body: "Cuando llegue una crisis, estaremos aquí con técnicas inmediatas para ayudarte a recuperar el control.",
    },
  ];

  if (step === slides.length) {
    return (
      <div className="app-shell" style={{ justifyContent: "center", padding: "32px 24px" }}>
        <div className="fade-up" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
            <SerenityLogo size={72} />
          </div>
          <h1 className="section-header" style={{ marginBottom: 8 }}>¿Cómo te llamas?</h1>
          <p style={{ color: theme.textMuted, marginBottom: 32, fontSize: 14 }}>
            Para personalizar tu experiencia
          </p>
          <input
            type="text"
            placeholder="Tu nombre..."
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ marginBottom: 16, textAlign: "center", fontSize: 18 }}
          />
          <button
            className="btn-primary"
            onClick={() => name.trim() && onDone(name.trim())}
            style={{ opacity: name.trim() ? 1 : 0.4 }}
          >
            Comenzar mi camino →
          </button>
        </div>
      </div>
    );
  }

  const s = slides[step];
  return (
    <div className="app-shell" style={{ justifyContent: "space-between", padding: "60px 28px 48px" }}>
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8,
            borderRadius: 4,
            background: i === step ? theme.accent : theme.border,
            transition: "width 0.3s ease, background 0.3s",
          }} />
        ))}
      </div>

      <div className="fade-up" style={{ textAlign: "center" }} key={step}>
        <div style={{ fontSize: 80, marginBottom: 32 }}>{s.icon}</div>
        <h1 className="section-header" style={{ fontSize: 28, marginBottom: 16 }}>{s.title}</h1>
        <p style={{ color: theme.textMuted, fontSize: 16, lineHeight: 1.6 }}>{s.body}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="btn-primary" onClick={() => setStep(s => s + 1)}>
          {step < slides.length - 1 ? "Siguiente" : "Empezar"}
        </button>
        {step < slides.length - 1 && (
          <button className="btn-ghost" onClick={() => setStep(slides.length)}>
            Omitir
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Pantalla: Crisis ─────────────────────────────────────────────────────────
function CrisisScreen({ onClose }) {
  const [phase, setPhase] = useState(0);
  const [breathStep, setBreathStep] = useState(0); // 0=inhala,1=sostén,2=exhala
  const [breathCount, setBreathCount] = useState(0);
  const [timer, setTimer] = useState(4);
  const [animState, setAnimState] = useState("in");
  const intervalRef = useRef(null);

  const phases = [
    {
      title: "Estás a salvo",
      body: "Este momento pasará. Tu sistema nervioso está reaccionando, pero puedes calmarlo.",
      action: "Quiero calmarme",
    },
    { title: "Respiración de emergencia", body: null, action: null },
    {
      title: "Grounding rápido",
      body: "Nombra en voz alta:\n• 5 cosas que VES ahora\n• 4 cosas que TOCAS\n• 3 cosas que ESCUCHAS\n• 2 cosas que HUELES\n• 1 cosa que SIENTES",
      action: "Lo hice, me siento mejor",
    },
  ];

  // Lógica de respiración
  useEffect(() => {
    if (phase !== 1) return;
    const durations = [4, 4, 4];
    const labels = ["Inhala", "Sostén", "Exhala"];

    setTimer(durations[breathStep]);
    setAnimState(breathStep === 0 ? "in" : breathStep === 2 ? "out" : "hold");

    intervalRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          const next = (breathStep + 1) % 3;
          setBreathStep(next);
          if (next === 0) setBreathCount(c => c + 1);
          return durations[next];
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [phase, breathStep]);

  const breathLabels = ["Inhala", "Sostén", "Exhala"];
  const circleColor = breathStep === 0 ? theme.teal : breathStep === 2 ? theme.accent : theme.amber;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(13,17,23,0.97)",
      zIndex: 200,
      display: "flex", flexDirection: "column",
      padding: "40px 24px 32px",
      maxWidth: 430, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <Badge label="🆘 Modo Crisis" color={theme.rose} bg={theme.roseSoft} />
        {phase === 2 && (
          <button onClick={onClose} style={{
            background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
            borderRadius: 8, padding: "6px 12px", color: theme.textMuted, fontSize: 13,
          }}>
            Salir
          </button>
        )}
      </div>

      {phase === 0 && (
        <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🫁</div>
          <h2 className="section-header" style={{ fontSize: 26, marginBottom: 16, color: theme.text }}>
            {phases[0].title}
          </h2>
          <p style={{ color: theme.textMuted, fontSize: 16, lineHeight: 1.7, marginBottom: 48 }}>
            {phases[0].body}
          </p>
          <button className="btn-primary" onClick={() => setPhase(1)}
            style={{ background: theme.rose }}>
            {phases[0].action}
          </button>
        </div>
      )}

      {phase === 1 && (
        <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 8, textAlign: "center" }}>
            Ciclo {breathCount + 1} de 4
          </p>
          <p className="section-header" style={{ fontSize: 28, marginBottom: 40, textAlign: "center" }}>
            {breathLabels[breathStep]}
          </p>

          <div className="breathing-circle" style={{
            background: `radial-gradient(circle, ${circleColor}22 0%, transparent 70%)`,
            border: `2px solid ${circleColor}44`,
            animation: animState === "in"
              ? "breathe-in 4s ease forwards"
              : animState === "out"
              ? "breathe-out 4s ease forwards"
              : "none",
          }}>
            <div className="breathing-ring" style={{
              borderColor: circleColor,
              animation: "pulse-ring 2s ease infinite",
            }} />
            <span style={{ fontSize: 56, fontFamily: "Fraunces", fontWeight: 300, color: circleColor }}>
              {timer}
            </span>
            <span style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>segundos</span>
          </div>

          <div style={{ marginTop: 48, width: "100%" }}>
            <ProgressBar value={breathCount} max={4} color={circleColor} />
            <p style={{ color: theme.textDim, fontSize: 12, textAlign: "center", marginTop: 8 }}>
              Progreso de respiración
            </p>
          </div>

          {breathCount >= 4 && (
            <button className="btn-primary" onClick={() => setPhase(2)} style={{ marginTop: 24 }}>
              Continuar al grounding →
            </button>
          )}
        </div>
      )}

      {phase === 2 && (
        <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 48, textAlign: "center", marginBottom: 24 }}>🎯</div>
          <h2 className="section-header" style={{ textAlign: "center", marginBottom: 24, fontSize: 24 }}>
            {phases[2].title}
          </h2>
          <div className="card" style={{ marginBottom: 32 }}>
            {phases[2].body.split("\n").map((line, i) => (
              <p key={i} style={{
                color: i === 0 ? theme.textMuted : theme.text,
                fontSize: i === 0 ? 13 : 15,
                lineHeight: 1.8,
                fontWeight: i === 0 ? 400 : 500,
              }}>{line}</p>
            ))}
          </div>
          <button className="btn-primary" onClick={onClose}
            style={{ background: theme.teal, color: "#0D1117" }}>
            ✓ {phases[2].action}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Pantalla: Técnica Guiada (Grounding, Body Scan, Cognitiva) ───────────────
function GuidedTechniqueScreen({ technique, onBack }) {
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);
  const guide = technique.guide;

  if (done) {
    return (
      <div style={{ padding: "24px 20px", textAlign: "center" }}>
        <button onClick={onBack} style={{
          background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
          borderRadius: 10, width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: theme.text, fontSize: 16, margin: "0 0 40px",
        }}>←</button>
        <div className="fade-up">
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h3 className="section-header" style={{ marginBottom: 8 }}>¡Ejercicio completado!</h3>
          <p style={{ color: theme.textMuted, marginBottom: 32, fontSize: 14 }}>
            Terminaste {technique.name}
          </p>
          <button className="btn-primary" onClick={onBack}>Volver</button>
        </div>
      </div>
    );
  }

  const Header = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
      <button onClick={onBack} style={{
        background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
        borderRadius: 10, width: 36, height: 36,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: theme.text, fontSize: 16,
      }}>←</button>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>{technique.name}</h2>
        <Badge label={technique.category} color={technique.color} bg={technique.colorSoft} />
      </div>
    </div>
  );

  if (step === -1) {
    return (
      <div style={{ padding: "24px 20px" }}>
        <Header />
        <div className="card-sm" style={{ marginBottom: 28, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20 }}>🔬</span>
          <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.6 }}>
            <strong style={{ color: theme.text }}>Base científica: </strong>
            {technique.science}
          </p>
        </div>
        <div className="card" style={{ marginBottom: 32, textAlign: "center", padding: "32px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{technique.icon}</div>
          <p style={{ color: theme.textMuted, fontSize: 14, lineHeight: 1.7 }}>{technique.desc}</p>
        </div>
        <div style={{ marginBottom: 24 }}>
          <p className="label" style={{ marginBottom: 12 }}>Pasos del ejercicio</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {guide.map((g, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10,
                background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
              }}>
                <span style={{ fontSize: 18 }}>{g.icon}</span>
                <span style={{ fontSize: 13, color: theme.textMuted }}>{g.title}</span>
              </div>
            ))}
          </div>
        </div>
        <button className="btn-primary" onClick={() => setStep(0)}
          style={{ background: technique.color, color: "#0D1117" }}>
          Iniciar ejercicio →
        </button>
      </div>
    );
  }

  const current = guide[step];
  const isLast = step === guide.length - 1;

  return (
    <div style={{ padding: "24px 20px" }}>
      <Header />

      {/* Indicador de progreso */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span className="label">Paso {step + 1} de {guide.length}</span>
          <span style={{ fontSize: 13, color: technique.color, fontWeight: 600 }}>
            {Math.round(((step + 1) / guide.length) * 100)}%
          </span>
        </div>
        <ProgressBar value={step + 1} max={guide.length} color={technique.color} />
      </div>

      {/* Paso actual */}
      <div className="fade-up" key={step}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", padding: "32px 20px",
          background: technique.colorSoft,
          border: `1px solid ${technique.color}44`,
          borderRadius: 20, marginBottom: 32,
        }}>
          <span style={{ fontSize: 56, marginBottom: 16 }}>{current.icon}</span>
          <h3 className="section-header" style={{ fontSize: 20, marginBottom: 16, color: technique.color }}>
            {current.title}
          </h3>
          <p style={{ color: theme.textMuted, fontSize: 14, lineHeight: 1.7 }}>
            {current.desc}
          </p>
        </div>

        {/* Navegación */}
        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button className="btn-ghost" onClick={() => setStep(s => s - 1)}
              style={{ flex: "0 0 auto", width: "auto", padding: "14px 20px" }}>
              ←
            </button>
          )}
          <button className="btn-primary" onClick={() => isLast ? setDone(true) : setStep(s => s + 1)}
            style={{ background: isLast ? technique.color : technique.color, color: "#0D1117" }}>
            {isLast ? "Completar ✓" : "Siguiente →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pantalla: Técnica de Respiración ─────────────────────────────────────────
function BreathingTechniqueScreen({ technique, onBack }) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(0);
  const [t, setT] = useState(technique.steps[0]);
  const [rounds, setRounds] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const TARGET_ROUNDS = 4;

  useEffect(() => {
    if (!active) return;
    const steps = technique.steps.filter(s => s > 0);
    const labels = technique.labels.filter((_, i) => technique.steps[i] > 0);
    const stepCount = steps.length;

    setT(steps[0]);

    ref.current = setInterval(() => {
      setT(prev => {
        if (prev <= 1) {
          setPhase(p => {
            const np = (p + 1) % stepCount;
            if (np === 0) {
              setRounds(r => {
                if (r + 1 >= TARGET_ROUNDS) {
                  setActive(false);
                  setDone(true);
                  clearInterval(ref.current);
                }
                return r + 1;
              });
            }
            return np;
          });
          return steps[(phase + 1) % stepCount];
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(ref.current);
  }, [active, phase]);

  const steps = technique.steps.filter(s => s > 0);
  const labels = technique.labels.filter((_, i) => technique.steps[i] > 0);
  const phaseLabel = active ? labels[phase % labels.length] : "Listo";

  return (
    <div style={{ padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <button onClick={onBack} style={{
          background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
          borderRadius: 10, width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: theme.text, fontSize: 16,
        }}>←</button>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>{technique.name}</h2>
          <Badge label={technique.category} color={technique.color} bg={technique.colorSoft} />
        </div>
      </div>

      {/* Science note */}
      <div className="card-sm" style={{ marginBottom: 28, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 20 }}>🔬</span>
        <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.6 }}>
          <strong style={{ color: theme.text }}>Base científica: </strong>
          {technique.science}
        </p>
      </div>

      {done ? (
        <div className="fade-up" style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h3 className="section-header" style={{ marginBottom: 8 }}>¡Excelente trabajo!</h3>
          <p style={{ color: theme.textMuted, marginBottom: 32, fontSize: 14 }}>
            Completaste {TARGET_ROUNDS} rondas de {technique.name}
          </p>
          <button className="btn-primary" onClick={onBack}>Volver</button>
        </div>
      ) : (
        <>
          {/* Círculo */}
          <div style={{ position: "relative", margin: "32px auto 40px", width: 200, height: 200 }}>
            {/* Anillo exterior */}
            <div style={{
              position: "absolute", inset: -10,
              borderRadius: "50%",
              border: `2px solid ${technique.color}33`,
            }} />
            {/* Círculo principal */}
            <div style={{
              width: 200, height: 200,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${technique.color}1a 0%, transparent 70%)`,
              border: `2px solid ${technique.color}55`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              transition: "transform 0.5s ease",
              transform: active && phaseLabel === "Inhala" ? "scale(1.1)"
                : active && phaseLabel === "Exhala" ? "scale(0.9)"
                : "scale(1)",
            }}>
              <span style={{
                fontSize: 56, fontFamily: "Fraunces", fontWeight: 300,
                color: technique.color, lineHeight: 1,
              }}>
                {active ? t : "•"}
              </span>
              <span style={{ fontSize: 14, color: theme.textMuted, marginTop: 6, fontWeight: 500 }}>
                {phaseLabel}
              </span>
            </div>
          </div>

          {/* Progreso */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span className="label">Rondas</span>
              <span style={{ fontSize: 13, color: technique.color }}>{rounds}/{TARGET_ROUNDS}</span>
            </div>
            <ProgressBar value={rounds} max={TARGET_ROUNDS} color={technique.color} />
          </div>

          {/* Steps visualization */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
            {labels.map((l, i) => (
              <div key={i} style={{
                flex: 1, padding: "10px 6px",
                borderRadius: 10,
                background: active && phase % labels.length === i ? technique.colorSoft : theme.surfaceAlt,
                border: `1px solid ${active && phase % labels.length === i ? technique.color : theme.border}`,
                textAlign: "center",
                transition: "all 0.3s",
              }}>
                <div style={{ fontSize: 18, fontFamily: "Fraunces", fontWeight: 600, color: technique.color }}>
                  {steps[i]}
                </div>
                <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          <button
            className="btn-primary"
            onClick={() => { setActive(a => !a); setPhase(0); setRounds(0); setT(steps[0]); }}
            style={{ background: active ? theme.rose : technique.color }}
          >
            {active ? "⏸ Pausar" : rounds > 0 ? "▶ Continuar" : "▶ Iniciar"}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Pantalla: Home ─────────────────────────────────────────────────────────────
function HomeScreen({ state, onNavigate, onCheckIn, onCrisis }) {
  const { profile, logs } = state;
  const todayLog = logs.find(l => l.date === today());
  const lastLogs = logs.slice(-7);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  const avgToday = todayLog ? todayLog.level : null;
  const trend = lastLogs.length >= 2
    ? lastLogs[lastLogs.length - 1].level - lastLogs[lastLogs.length - 2].level
    : 0;

  return (
    <div style={{ padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <SerenityLogo size={28} />
          <p style={{ color: theme.textMuted, fontSize: 14 }}>{greeting}</p>
        </div>
        <h1 className="section-header" style={{ fontSize: 26 }}>
          {profile.name || "Hola"}
        </h1>
        {profile.streak > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <span style={{ fontSize: 13, color: theme.amber, fontWeight: 600 }}>
              {profile.streak} días seguidos
            </span>
          </div>
        )}
      </div>

      {/* Check-in card */}
      {!todayLog ? (
        <div className="card" style={{
          marginBottom: 20,
          background: `linear-gradient(135deg, ${theme.surface} 0%, #1a2030 100%)`,
          border: `1px solid ${theme.accent}33`,
        }}>
          <div className="fade-up">
            <p className="label" style={{ marginBottom: 8 }}>Check-in diario</p>
            <h3 className="section-header" style={{ fontSize: 20, marginBottom: 8 }}>
              ¿Cómo está tu ansiedad hoy?
            </h3>
            <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 16 }}>
              Registra cómo te sientes para hacer seguimiento de tu progreso
            </p>
            <button className="btn-primary" onClick={onCheckIn}>
              Registrar ahora →
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{
          marginBottom: 20,
          border: `1px solid ${theme.teal}33`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p className="label" style={{ marginBottom: 4 }}>Hoy registraste</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 28 }}>{MOODS.find(m => m.value === todayLog.level)?.emoji}</span>
                <span style={{ fontSize: 20, fontWeight: 600, color: MOODS.find(m => m.value === todayLog.level)?.color }}>
                  {MOODS.find(m => m.value === todayLog.level)?.label}
                </span>
              </div>
            </div>
            <div style={{
              fontSize: 13, color: trend <= -1 ? theme.teal : trend >= 1 ? theme.rose : theme.textMuted,
            }}>
              {trend < 0 ? "▲ Mejorando" : trend > 0 ? "▼ Subiendo" : "→ Estable"}
            </div>
          </div>
        </div>
      )}

      {/* Módulo Crisis */}
      <div className="card" style={{
        marginBottom: 20,
        background: theme.roseSoft,
        border: `1px solid ${theme.rose}44`,
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{ fontSize: 32 }}>🆘</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>¿Estás en crisis ahora?</p>
          <p style={{ color: theme.textMuted, fontSize: 12 }}>Ayuda inmediata disponible</p>
        </div>
        <button onClick={onCrisis} style={{
          background: theme.rose, color: "white", border: "none",
          borderRadius: 10, padding: "8px 14px", fontWeight: 600, fontSize: 13,
        }}>
          Ayuda
        </button>
      </div>

      {/* Técnicas rápidas */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Técnicas recomendadas</h3>
          <button onClick={() => onNavigate("techniques")} style={{
            background: "transparent", border: "none",
            color: theme.accent, fontSize: 13, fontWeight: 500,
          }}>Ver todas</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ANXIETY_TECHNIQUES.slice(0, 3).map(t => (
            <button key={t.id} onClick={() => onNavigate("technique", t)}
              style={{
                background: theme.surface, border: `1px solid ${theme.border}`,
                borderRadius: 12, padding: "14px", textAlign: "left",
                display: "flex", alignItems: "center", gap: 12,
                transition: "border-color 0.2s",
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: t.colorSoft, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 22, flexShrink: 0,
              }}>
                {t.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.name}</p>
                <p style={{ color: theme.textMuted, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.desc}
                </p>
              </div>
              <span style={{ color: t.color, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                {Math.floor(t.duration / 60)}min
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats mini */}
      {logs.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "Sesiones", value: profile.totalSessions, icon: "📅" },
            { label: "Promedio", value: avgLevel(logs), icon: "📊" },
            { label: "Racha", value: `${profile.streak}d`, icon: "🔥" },
          ].map((s, i) => (
            <div key={i} className="card-sm" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Fraunces" }}>{s.value}</div>
              <div className="label" style={{ marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Pantalla: Check-in ─────────────────────────────────────────────────────────
function CheckInScreen({ onSave, onBack, existing }) {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState(existing?.level || 3);
  const [selectedTriggers, setSelectedTriggers] = useState(existing?.triggers || []);
  const [notes, setNotes] = useState(existing?.notes || "");

  const mood = MOODS.find(m => m.value === level);

  const toggleTrigger = (t) => {
    setSelectedTriggers(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const handleSave = () => {
    onSave({
      date: today(),
      level,
      triggers: selectedTriggers,
      notes,
      timestamp: Date.now(),
    });
  };

  return (
    <div style={{ padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <button onClick={onBack} style={{
          background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
          borderRadius: 10, width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: theme.text, fontSize: 16,
        }}>←</button>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Check-in diario</h2>
          <p style={{ fontSize: 12, color: theme.textMuted }}>{fmtDate(today())}</p>
        </div>
      </div>

      {/* Paso 1: Nivel */}
      {step === 0 && (
        <div className="fade-up">
          <h3 className="section-header" style={{ marginBottom: 8, fontSize: 22 }}>
            ¿Cómo está tu ansiedad?
          </h3>
          <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 32 }}>
            Sé honesto contigo mismo — no hay respuestas incorrectas
          </p>

          {/* Emoji selector */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
            {MOODS.map(m => (
              <button key={m.value} onClick={() => setLevel(m.value)}
                style={{
                  background: level === m.value ? m.color + "22" : "transparent",
                  border: `2px solid ${level === m.value ? m.color : "transparent"}`,
                  borderRadius: 14, padding: "12px 8px",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 4, transition: "all 0.2s", cursor: "pointer",
                  flex: 1, margin: "0 3px",
                }}>
                <span style={{ fontSize: 28 }}>{m.emoji}</span>
                <span style={{ fontSize: 10, color: level === m.value ? m.color : theme.textMuted, fontWeight: 600 }}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          {/* Slider */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span className="label">Nivel de ansiedad</span>
              <span style={{ fontSize: 14, color: mood.color, fontWeight: 700 }}>
                {level}/5 — {mood.label}
              </span>
            </div>
            <input
              type="range" min={1} max={5} step={1} value={level}
              onChange={e => setLevel(Number(e.target.value))}
              style={{ accentColor: mood.color }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: theme.textDim }}>Crisis</span>
              <span style={{ fontSize: 11, color: theme.textDim }}>Tranquilo</span>
            </div>
          </div>

          <button className="btn-primary" onClick={() => setStep(1)}>
            Continuar →
          </button>
        </div>
      )}

      {/* Paso 2: Disparadores */}
      {step === 1 && (
        <div className="fade-up">
          <h3 className="section-header" style={{ marginBottom: 8, fontSize: 22 }}>
            ¿Qué lo desencadena?
          </h3>
          <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 24 }}>
            Selecciona todos los que apliquen (opcional)
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
            {TRIGGERS.map(t => (
              <button
                key={t}
                className={`chip ${selectedTriggers.includes(t) ? "selected" : ""}`}
                onClick={() => toggleTrigger(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost" onClick={() => setStep(0)} style={{ flex: "0 0 auto", width: "auto", padding: "14px 20px" }}>
              ←
            </button>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Notas */}
      {step === 2 && (
        <div className="fade-up">
          <h3 className="section-header" style={{ marginBottom: 8, fontSize: 22 }}>
            ¿Algo que quieras registrar?
          </h3>
          <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 24 }}>
            Pensamientos, sensaciones, contexto... Este es tu espacio seguro
          </p>

          <textarea
            rows={5}
            placeholder="Escribe lo que sientes sin filtros..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ marginBottom: 32 }}
          />

          {/* Cognitive reframe prompt */}
          {level <= 2 && (
            <div className="card-sm" style={{
              marginBottom: 24,
              background: theme.violetSoft,
              border: `1px solid ${theme.violet}44`,
            }}>
              <p style={{ fontSize: 13, color: theme.violet, fontWeight: 600, marginBottom: 4 }}>
                💜 Reestructuración cognitiva
              </p>
              <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.6 }}>
                Cuando estés listo, pregúntate: ¿qué evidencia tengo de que lo que temo realmente pasará?
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost" onClick={() => setStep(1)} style={{ flex: "0 0 auto", width: "auto", padding: "14px 20px" }}>
              ←
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Guardar registro ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pantalla: Técnicas ─────────────────────────────────────────────────────────
function TechniquesScreen({ onNavigate }) {
  const cats = ["Todas", "Neurociencia", "Psicoanálisis"];
  const [cat, setCat] = useState("Todas");
  const filtered = ANXIETY_TECHNIQUES.filter(t => cat === "Todas" || t.category === cat);

  return (
    <div style={{ padding: "24px 20px" }}>
      <h2 className="section-header" style={{ marginBottom: 6 }}>Técnicas</h2>
      <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 20 }}>
        Basadas en neurociencia y psicoanálisis
      </p>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {cats.map(c => (
          <button
            key={c}
            className={`chip ${cat === c ? "selected" : ""}`}
            onClick={() => setCat(c)}
          >{c}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(t => (
          <button key={t.id} onClick={() => onNavigate("technique", t)}
            style={{
              background: theme.surface, border: `1px solid ${theme.border}`,
              borderRadius: 14, padding: "16px", textAlign: "left",
              transition: "border-color 0.2s",
            }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: t.colorSoft,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, flexShrink: 0,
              }}>{t.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</p>
                  <Badge label={`${Math.floor(t.duration / 60)}m`} color={t.color} bg={t.colorSoft} />
                </div>
                <Badge label={t.category} color={t.color} bg={t.colorSoft} />
              </div>
            </div>
            <p style={{ color: theme.textMuted, fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
              {t.desc}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12 }}>🔬</span>
              <span style={{ fontSize: 12, color: theme.textDim }}>{t.science}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Pantalla: Progreso ─────────────────────────────────────────────────────────
function ProgressScreen({ state }) {
  const { logs, profile } = state;
  const last30 = logs.slice(-30);
  const last7 = logs.slice(-7);

  const avg7 = last7.length ? (last7.reduce((s, l) => s + l.level, 0) / last7.length).toFixed(1) : "—";
  const avg30 = last30.length ? (last30.reduce((s, l) => s + l.level, 0) / last30.length).toFixed(1) : "—";

  const topTriggers = {};
  logs.forEach(l => l.triggers?.forEach(t => { topTriggers[t] = (topTriggers[t] || 0) + 1; }));
  const sortedTriggers = Object.entries(topTriggers).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxTrig = sortedTriggers[0]?.[1] || 1;

  const days = ["L", "M", "X", "J", "V", "S", "D"];

  // Mini bar chart últimos 7 días
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const log = logs.find(l => l.date === key);
    const dayName = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
    return { day: dayName, level: log?.level || 0, date: key };
  });

  const levelColor = (l) => {
    if (l <= 1) return theme.rose;
    if (l <= 2) return "#F0883E";
    if (l <= 3) return theme.amber;
    if (l <= 4) return theme.teal;
    return theme.accent;
  };

  return (
    <div style={{ padding: "24px 20px" }}>
      <h2 className="section-header" style={{ marginBottom: 6 }}>Tu progreso</h2>
      <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 24 }}>
        {logs.length} registros totales
      </p>

      {logs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h3 style={{ fontFamily: "Fraunces", fontSize: 20, marginBottom: 8 }}>Sin datos aún</h3>
          <p style={{ color: theme.textMuted, fontSize: 13 }}>
            Completa tu primer check-in para ver tu progreso
          </p>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Promedio 7d", value: avg7, sub: "ansiedad", icon: "📅", color: theme.accent },
              { label: "Promedio 30d", value: avg30, sub: "ansiedad", icon: "📊", color: theme.violet },
              { label: "Racha actual", value: `${profile.streak}d`, sub: "días seguidos", icon: "🔥", color: theme.amber },
              { label: "Total sesiones", value: profile.totalSessions, sub: "registros", icon: "✅", color: theme.teal },
            ].map((s, i) => (
              <div key={i} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span className="label">{s.label}</span>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                </div>
                <div style={{
                  fontSize: 32, fontFamily: "Fraunces", fontWeight: 600,
                  color: s.color, margin: "8px 0 4px",
                }}>{s.value}</div>
                <span style={{ fontSize: 11, color: theme.textDim }}>{s.sub}</span>
              </div>
            ))}
          </div>

          {/* Bar chart 7 días */}
          <div className="card" style={{ marginBottom: 20 }}>
            <p style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Últimos 7 días</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90, marginBottom: 8 }}>
              {chartData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: "100%",
                    height: d.level ? `${(d.level / 5) * 70}px` : 4,
                    borderRadius: 6,
                    background: d.level ? levelColor(d.level) : theme.border,
                    transition: "height 0.5s ease",
                    minHeight: 4,
                  }} />
                  <span style={{ fontSize: 11, color: theme.textDim }}>{d.day}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, color: theme.rose }}>● Crisis</span>
              <span style={{ fontSize: 11, color: theme.teal }}>● Bajo</span>
              <span style={{ fontSize: 11, color: theme.accent }}>● Tranquilo</span>
            </div>
          </div>

          {/* Disparadores frecuentes */}
          {sortedTriggers.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Disparadores frecuentes</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sortedTriggers.map(([t, count]) => (
                  <div key={t}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{t}</span>
                      <span style={{ fontSize: 12, color: theme.textMuted }}>{count}x</span>
                    </div>
                    <ProgressBar value={count} max={maxTrig} color={theme.violet} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial reciente */}
          <div>
            <p style={{ fontWeight: 600, marginBottom: 14, fontSize: 14 }}>Historial reciente</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {logs.slice().reverse().slice(0, 10).map((l, i) => {
                const m = MOODS.find(m => m.value === l.level);
                return (
                  <div key={i} className="card-sm" style={{
                    display: "flex", alignItems: "center", gap: 12,
                    borderLeft: `3px solid ${m.color}`,
                  }}>
                    <span style={{ fontSize: 24 }}>{m.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: m.color }}>{m.label}</span>
                        <span style={{ fontSize: 12, color: theme.textDim }}>{fmtDate(l.date)}</span>
                      </div>
                      {l.triggers?.length > 0 && (
                        <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                          {l.triggers.join(", ")}
                        </p>
                      )}
                      {l.notes && (
                        <p style={{ fontSize: 12, color: theme.textDim, marginTop: 2,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {l.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Pantalla: Aprende ──────────────────────────────────────────────────────────
function LearnScreen() {
  const [open, setOpen] = useState(null);

  const articles = [
    {
      icon: "🧠",
      category: "Neurociencia",
      title: "¿Qué ocurre en tu cerebro durante la ansiedad?",
      color: theme.accent,
      colorSoft: theme.accentSoft,
      body: `La ansiedad activa la amígdala, tu "detector de amenazas". Cuando se dispara, envía señales al hipotálamo que activan el sistema nervioso simpático: adrenalina, cortisol, aumento cardíaco.\n\nEsto es la respuesta de "lucha o huida" — útil ante peligros reales, pero problemática cuando se activa por pensamientos.\n\nLa corteza prefrontal puede regular la amígdala, pero necesita práctica. Las técnicas de esta app fortalecen esa conexión.`,
    },
    {
      icon: "🌀",
      category: "Psicoanálisis",
      title: "El ciclo de la ansiedad y cómo romperlo",
      color: theme.violet,
      colorSoft: theme.violetSoft,
      body: `La ansiedad funciona en ciclos: pensamiento amenazante → activación física → evitación → alivio temporal → refuerzo del miedo.\n\nLa evitación es el mantenedor principal. Al evitar lo que nos genera ansiedad, le decimos a nuestro cerebro "esto es peligroso".\n\nLa exposición gradual y la reestructuración cognitiva son las herramientas más efectivas para romper este ciclo.`,
    },
    {
      icon: "💤",
      category: "Neurociencia",
      title: "Sueño, cortisol y ansiedad",
      color: theme.teal,
      colorSoft: theme.tealSoft,
      body: `El sueño insuficiente aumenta los niveles de cortisol hasta un 37% y reduce la regulación emocional de la corteza prefrontal.\n\nDormir menos de 7 horas duplica la probabilidad de episodios de ansiedad al día siguiente.\n\nPriorizar el sueño es una de las intervenciones más poderosas para la salud mental — tan efectiva como la medicación en algunos estudios.`,
    },
    {
      icon: "🔄",
      category: "Psicoanálisis",
      title: "Pensamientos automáticos: cómo identificarlos",
      color: theme.amber,
      colorSoft: theme.amberSoft,
      body: `Los pensamientos automáticos negativos (PANs) son evaluaciones instantáneas que ocurren sin conciencia. Son la base del sufrimiento ansioso.\n\nPatrones comunes: catastrofización ("lo peor va a pasar"), lectura de mente ("piensan mal de mí"), todo-o-nada ("soy un fracaso").\n\nIdentificarlos es el primer paso. Pregúntate: ¿qué estaba pensando justo antes de sentirme ansioso?`,
    },
  ];

  return (
    <div style={{ padding: "24px 20px" }}>
      <h2 className="section-header" style={{ marginBottom: 6 }}>Aprende</h2>
      <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 24 }}>
        Neurociencia y psicoanálisis aplicados
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {articles.map((a, i) => (
          <div key={i} className="card" style={{
            border: `1px solid ${open === i ? a.color + "55" : theme.border}`,
            transition: "border-color 0.3s",
          }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              style={{
                background: "transparent", border: "none", textAlign: "left",
                width: "100%", padding: 0, cursor: "pointer",
              }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: a.colorSoft, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <Badge label={a.category} color={a.color} bg={a.colorSoft} />
                  <p style={{ fontWeight: 600, fontSize: 14, marginTop: 6, lineHeight: 1.4, color: theme.text }}>
                    {a.title}
                  </p>
                </div>
                <span style={{ color: theme.textMuted, fontSize: 18, marginTop: 4 }}>
                  {open === i ? "▲" : "▼"}
                </span>
              </div>
            </button>

            {open === i && (
              <div className="fade-up" style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${theme.border}` }}>
                {a.body.split("\n\n").map((p, j) => (
                  <p key={j} style={{
                    color: j === 0 ? theme.text : theme.textMuted,
                    fontSize: 14, lineHeight: 1.7, marginBottom: j < 2 ? 12 : 0,
                  }}>{p}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── App principal ─────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem("anxietyapp_v1");
      return saved ? JSON.parse(saved) : INITIAL_STATE;
    } catch { return INITIAL_STATE; }
  });

  const [screen, setScreen] = useState("home");
  const [activeTechnique, setActiveTechnique] = useState(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  const isOnboarded = !!state.profile.joinDate;

  // Persist
  useEffect(() => {
    try { localStorage.setItem("anxietyapp_v1", JSON.stringify(state)); }
    catch {}
  }, [state]);

  const handleOnboard = (name) => {
    setState(s => ({
      ...s,
      profile: { ...s.profile, name, joinDate: today() },
    }));
  };

  const handleCheckIn = (log) => {
    setState(s => {
      const newLogs = s.logs.filter(l => l.date !== log.date).concat(log);
      newLogs.sort((a, b) => a.date.localeCompare(b.date));

      // Streak calculation
      let streak = 0;
      const d = new Date();
      while (true) {
        const key = d.toISOString().split("T")[0];
        if (newLogs.find(l => l.date === key)) {
          streak++;
          d.setDate(d.getDate() - 1);
        } else break;
      }

      return {
        ...s,
        logs: newLogs,
        profile: {
          ...s.profile,
          totalSessions: newLogs.length,
          streak,
        },
      };
    });
    setShowCheckIn(false);
  };

  const navigate = (dest, payload = null) => {
    if (dest === "technique") {
      setActiveTechnique(payload);
    } else if (dest === "techniques") {
      setScreen("techniques");
      setActiveTechnique(null);
    } else {
      setScreen(dest);
      setActiveTechnique(null);
    }
  };

  if (!isOnboarded) {
    return (
      <>
        <GlobalStyle />
        <OnboardingScreen onDone={handleOnboard} />
      </>
    );
  }

  if (showCrisis) {
    return (
      <>
        <GlobalStyle />
        <CrisisScreen onClose={() => setShowCrisis(false)} />
      </>
    );
  }

  if (showCheckIn) {
    return (
      <>
        <GlobalStyle />
        <div className="app-shell">
          <div className="screen">
            <CheckInScreen
              existing={state.logs.find(l => l.date === today())}
              onSave={handleCheckIn}
              onBack={() => setShowCheckIn(false)}
            />
          </div>
        </div>
      </>
    );
  }

  if (activeTechnique) {
    const TechScreen = activeTechnique.steps ? BreathingTechniqueScreen : GuidedTechniqueScreen;
    return (
      <>
        <GlobalStyle />
        <div className="app-shell">
          <div className="screen">
            <TechScreen
              technique={activeTechnique}
              onBack={() => setActiveTechnique(null)}
            />
          </div>
        </div>
      </>
    );
  }

  const navItems = [
    { id: "home", icon: "🏠", label: "Inicio" },
    { id: "checkin", icon: "✏️", label: "Check-in" },
    { id: "techniques", icon: "🧘", label: "Técnicas" },
    { id: "progress", icon: "📊", label: "Progreso" },
    { id: "learn", icon: "📚", label: "Aprende" },
  ];

  return (
    <>
      <GlobalStyle />
      <div className="app-shell">
        <div className="screen">
          {screen === "home" && (
            <HomeScreen
              state={state}
              onNavigate={navigate}
              onCheckIn={() => setShowCheckIn(true)}
              onCrisis={() => setShowCrisis(true)}
            />
          )}
          {screen === "techniques" && (
            <TechniquesScreen onNavigate={navigate} />
          )}
          {screen === "progress" && (
            <ProgressScreen state={state} />
          )}
          {screen === "learn" && <LearnScreen />}
        </div>

        {/* Crisis FAB */}
        {screen === "home" && (
          <button className="crisis-fab" onClick={() => setShowCrisis(true)} title="Modo crisis">
            🆘
          </button>
        )}

        {/* Bottom Nav */}
        <nav className="bottom-nav">
          {navItems.map(n => (
            <button
              key={n.id}
              className={`nav-item ${screen === n.id ? "active" : ""}`}
              onClick={() => {
                if (n.id === "checkin") setShowCheckIn(true);
                else setScreen(n.id);
              }}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

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
  logs: [],
  currentCrisis: false,
  tasks: [],
  taskLogs: [],
  totalPoints: 0,
  awardedPeriods: [],
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
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes celebrate-pop {
      0%   { transform: scale(0.6); opacity: 0; }
      70%  { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
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

// ─── Constantes de Objetivos ────────────────────────────────────────────────────
const TASK_CATEGORIES = [
  { id: "TCC",          full: "Terapia Cognitivo-Conductual", icon: "🔄", color: theme.accent,    colorSoft: theme.accentSoft,  desc: "Cambia patrones de pensamiento y comportamiento que generan ansiedad" },
  { id: "ACT",          full: "Aceptación y Compromiso",      icon: "🌿", color: theme.teal,      colorSoft: theme.tealSoft,    desc: "Acepta emociones difíciles y actúa conforme a tus valores reales" },
  { id: "DBT",          full: "Dialéctico-Conductual",        icon: "⚖️", color: theme.amber,     colorSoft: theme.amberSoft,   desc: "Regula emociones intensas y mejora relaciones interpersonales" },
  { id: "Neurociencia", full: "Neurociencia Aplicada",        icon: "🧠", color: theme.violet,    colorSoft: theme.violetSoft,  desc: "Regula tu sistema nervioso autónomo con base científica sólida" },
  { id: "Hipnoterapia", full: "Hipnoterapia Guiada",          icon: "🌀", color: theme.rose,      colorSoft: theme.roseSoft,    desc: "Reprograma el subconsciente para reducir la ansiedad crónica" },
  { id: "Mindfulness",  full: "Mindfulness / MBSR",           icon: "🧘", color: "#56D364",       colorSoft: "rgba(86,211,100,0.12)", desc: "Atención plena para silenciar el ruido mental y el estrés" },
  { id: "Personalizada",full: "Tarea personalizada",          icon: "✨", color: theme.textMuted, colorSoft: theme.surfaceAlt,  desc: "Crea tu propia práctica adaptada a tus necesidades y caso particular" },
];

const TASK_SUGGESTIONS = [
  // ── TCC ─────────────────────────────────────────────────────────────────────
  { id: "tcc-thought-record", category: "TCC", icon: "📝", title: "Diario de pensamientos",    desc: "Identifica y desafía pensamientos automáticos negativos con evidencia real",             science: "Reduce distorsiones cognitivas hasta un 60% — Beck, 1979",                                          period: "diario",  targetAmount: 1,  unit: "sesión",    duration: "15 min",   points: 10, difficulty: "Fácil" },
  { id: "tcc-exposure",       category: "TCC", icon: "🚪", title: "Exposición gradual",         desc: "Enfrenta situaciones evitadas de forma progresiva y controlada",                        science: "La evitación mantiene la ansiedad; la exposición la extingue — Wolpe",                              period: "semanal", targetAmount: 2,  unit: "sesiones",  duration: "30 min",   points: 25, difficulty: "Moderado" },
  { id: "tcc-activation",     category: "TCC", icon: "🎨", title: "Activación conductual",      desc: "Realiza 1 actividad placentera al día para romper el ciclo de retirada emocional",      science: "Aumenta dopamina y autoeficacia; interrumpe espirales ansioso-depresivas",                           period: "diario",  targetAmount: 1,  unit: "actividad", duration: "20 min",   points: 10, difficulty: "Fácil" },
  // ── ACT ─────────────────────────────────────────────────────────────────────
  { id: "act-values",         category: "ACT", icon: "🧭", title: "Práctica de valores",         desc: "Reflexiona sobre lo que más importa y realiza una acción alineada con ello",            science: "Alinear acción con valores reduce angustia existencial — Hayes, 1999",                               period: "semanal", targetAmount: 1,  unit: "sesión",    duration: "20 min",   points: 20, difficulty: "Moderado" },
  { id: "act-defusion",       category: "ACT", icon: "☁️", title: "Defusión cognitiva",          desc: "Observa tus pensamientos como nubes pasajeras sin aferrarte ni rechazarlos",            science: "Reduce el impacto de pensamientos intrusivos sin suprimirlos — Hayes",                               period: "diario",  targetAmount: 10, unit: "minutos",   duration: "10 min",   points: 10, difficulty: "Fácil" },
  { id: "act-committed",      category: "ACT", icon: "🎯", title: "Acción comprometida",         desc: "Realiza una acción alineada con tus valores aunque sientas malestar emocional",         science: "El compromiso con valores genera resiliencia y autoestima genuina",                                  period: "diario",  targetAmount: 1,  unit: "acción",    duration: "Variable", points: 15, difficulty: "Moderado" },
  // ── DBT ─────────────────────────────────────────────────────────────────────
  { id: "dbt-tipp",           category: "DBT", icon: "🌡️", title: "Habilidad TIPP",              desc: "Temperatura fría, Intensidad física, Respiración pausada, Relajación progresiva",       science: "Cambia la química cerebral rápidamente en crisis emocional — Linehan",                               period: "diario",  targetAmount: 1,  unit: "práctica",  duration: "10 min",   points: 15, difficulty: "Fácil" },
  { id: "dbt-mindfulness",    category: "DBT", icon: "👁️", title: "Mindfulness DBT",             desc: "Observa, describe y participa sin juzgar. Enfócate en el momento presente efectivo",    science: "Núcleo de DBT: aumenta tolerancia al malestar — Linehan, 1993",                                     period: "diario",  targetAmount: 10, unit: "minutos",   duration: "10 min",   points: 10, difficulty: "Fácil" },
  { id: "dbt-emotion-reg",    category: "DBT", icon: "🎛️", title: "Regulación emocional",        desc: "Nombra tus emociones y reduce vulnerabilidad: sueño, alimentación, ejercicio",          science: "Nombrar emociones reduce activación amigdalar hasta 50% — Lieberman, 2007",                         period: "diario",  targetAmount: 1,  unit: "registro",  duration: "10 min",   points: 10, difficulty: "Fácil" },
  // ── Neurociencia ─────────────────────────────────────────────────────────────
  { id: "neuro-cardiac",      category: "Neurociencia", icon: "💗", title: "Coherencia cardíaca",   desc: "Inhala 5 seg, exhala 5 seg durante 5 min — repite 3 veces al día",                   science: "Regula el SNA y reduce cortisol significativamente — HeartMath Institute",                          period: "diario",  targetAmount: 3,  unit: "sesiones",  duration: "5 min c/u", points: 20, difficulty: "Fácil" },
  { id: "neuro-vagus",        category: "Neurociencia", icon: "⚡", title: "Estimulación vagal",    desc: "Humming, agua fría en el cuello, cantar o gargarismos profundos",                     science: "El nervio vago es el freno del sistema simpático — Porges, 2011",                                   period: "diario",  targetAmount: 1,  unit: "práctica",  duration: "5 min",    points: 10, difficulty: "Fácil" },
  { id: "neuro-nsdr",         category: "Neurociencia", icon: "😴", title: "NSDR / Yoga Nidra",    desc: "Non-Sleep Deep Rest: relajación profunda consciente para restaurar dopamina",          science: "Restaura dopamina basal y reduce cortisol en 20 min — Huberman Lab, Stanford",                     period: "diario",  targetAmount: 20, unit: "minutos",   duration: "20 min",   points: 20, difficulty: "Fácil" },
  { id: "neuro-sunlight",     category: "Neurociencia", icon: "☀️", title: "Luz solar matutina",   desc: "Exponerte a luz natural en los primeros 30 min del día sin pantallas",                  science: "Sincroniza ritmo circadiano y optimiza serotonina/dopamina — Huberman",                            period: "diario",  targetAmount: 10, unit: "minutos",   duration: "10–30 min",points: 10, difficulty: "Fácil" },
  // ── Hipnoterapia ─────────────────────────────────────────────────────────────
  { id: "hypno-relaxation",   category: "Hipnoterapia", icon: "🌀", title: "Relajación hipnótica", desc: "Inducción autónoma: cuenta regresiva 10-1, visualización de lugar seguro interno",     science: "El estado hipnótico reduce actividad amigdalar y corteza cingulada posterior — Raz, 2005",         period: "diario",  targetAmount: 1,  unit: "sesión",    duration: "20 min",   points: 20, difficulty: "Moderado" },
  { id: "hypno-anchor",       category: "Hipnoterapia", icon: "⚓", title: "Anclaje positivo",     desc: "Crea un anclaje sensorial (gesto + emoción) para activar calma en momentos difíciles", science: "Programación neurolingüística aplicada — Bandler y Grinder, 1975",                                 period: "semanal", targetAmount: 3,  unit: "prácticas", duration: "15 min",   points: 20, difficulty: "Moderado" },
  // ── Mindfulness ──────────────────────────────────────────────────────────────
  { id: "mindful-meditation", category: "Mindfulness",  icon: "🧘", title: "Meditación plena",    desc: "Observa el flujo de pensamientos sin juzgar, con foco en la respiración",              science: "MBSR reduce ansiedad un 58% — Hofmann et al., 2010, metaanálisis de 39 estudios",                 period: "diario",  targetAmount: 20, unit: "minutos",   duration: "20 min",   points: 20, difficulty: "Moderado" },
  { id: "mindful-walk",       category: "Mindfulness",  icon: "🚶", title: "Caminata consciente",  desc: "Camina prestando atención a cada paso, sensaciones y entorno sin juzgar nada",         science: "Combina movimiento y mindfulness para efecto ansiolítico doble",                                    period: "diario",  targetAmount: 15, unit: "minutos",   duration: "15 min",   points: 15, difficulty: "Fácil" },
];

const LEVELS = [
  { level: 1, title: "Aprendiz",     minPoints: 0,    icon: "🌱", color: theme.teal },
  { level: 2, title: "Practicante",  minPoints: 100,  icon: "🌿", color: theme.accent },
  { level: 3, title: "Comprometido", minPoints: 300,  icon: "🌳", color: theme.violet },
  { level: 4, title: "Maestro",      minPoints: 600,  icon: "⭐", color: theme.amber },
  { level: 5, title: "Sabio",        minPoints: 1000, icon: "🔮", color: theme.rose },
];

const ICON_OPTIONS = ["✨","🎯","💪","🧘","🌅","📝","🏃","💤","🌿","⭐","💙","🎨","📖","🌊","🔮","🧠","💗","☀️","🌱","🎵","🦋","🍃","⚡","🌺","🏔️"];

// ─── Helpers de objetivos ───────────────────────────────────────────────────────
function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function getWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const wn = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(wn).padStart(2, "0")}`;
}

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getPeriodKey(period) {
  if (period === "diario")  return today();
  if (period === "semanal") return getWeekKey();
  if (period === "mensual") return getMonthKey();
  return "lifetime";
}

function getTaskProgress(task, taskLogs) {
  const logs = taskLogs.filter(l => l.taskId === task.id);
  if (task.period === "diario") {
    const t = today();
    return logs.filter(l => l.date === t).reduce((s, l) => s + l.amount, 0);
  }
  if (task.period === "semanal") {
    const wk = getWeekKey();
    return logs.filter(l => getWeekKey(new Date(l.date + "T12:00:00")) === wk).reduce((s, l) => s + l.amount, 0);
  }
  if (task.period === "mensual") {
    const mk = getMonthKey();
    return logs.filter(l => l.date.startsWith(mk)).reduce((s, l) => s + l.amount, 0);
  }
  return logs.reduce((s, l) => s + l.amount, 0);
}

function getCurrentLevel(points) {
  let lvl = LEVELS[0];
  for (const l of LEVELS) { if (points >= l.minPoints) lvl = l; }
  return lvl;
}

function getNextLevel(points) {
  return LEVELS.find(l => l.minPoints > points) || null;
}

function getCategoryInfo(id) {
  return TASK_CATEGORIES.find(c => c.id === id) || TASK_CATEGORIES[TASK_CATEGORIES.length - 1];
}

function fmtMonthName(date = new Date()) {
  return date.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}

// ─── Modal: Celebración ────────────────────────────────────────────────────────
const CELEBRATION_MSGS = [
  "Tu sistema nervioso te lo agradece 🧠",
  "Cada práctica recablea tu cerebro hacia la calma",
  "La neuroplasticidad está de tu lado",
  "Estás construyendo resiliencia real",
  "Tu corteza prefrontal se fortalece con cada logro",
  "La dopamina que generaste hoy es tuya",
  "Pequeños pasos, cambios profundos en el cerebro",
  "Estás rompiendo el ciclo de la ansiedad, logro a logro",
];

function CelebrationModal({ task, pointsEarned, totalPoints, onClose }) {
  const msg = CELEBRATION_MSGS[Math.floor(Math.random() * CELEBRATION_MSGS.length)];
  const lvl = getCurrentLevel(totalPoints);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(13,17,23,0.93)",
      zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 370, textAlign: "center",
        background: theme.surface, border: `1px solid ${theme.teal}55`,
        borderRadius: 20, padding: "36px 24px",
        animation: "celebrate-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        <div style={{ fontSize: 64, animation: "float 2s ease-in-out infinite", display: "block", marginBottom: 14 }}>🎉</div>
        <h2 style={{ fontFamily: "Fraunces", fontSize: 22, fontWeight: 600, color: theme.teal, marginBottom: 6 }}>
          ¡Objetivo completado!
        </h2>
        <p style={{ fontSize: 15, fontWeight: 600, color: theme.text, marginBottom: 4 }}>{task.title}</p>
        <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 22, lineHeight: 1.65 }}>{msg}</p>

        <div style={{
          background: theme.tealSoft, border: `1px solid ${theme.teal}44`,
          borderRadius: 14, padding: "14px 20px", marginBottom: 18,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, color: theme.teal, fontFamily: "Fraunces" }}>+{pointsEarned}</div>
            <div style={{ fontSize: 11, color: theme.teal, opacity: 0.8 }}>Serenity Points</div>
          </div>
          <div style={{ width: 1, height: 36, background: `${theme.teal}44` }} />
          <div>
            <div style={{ fontSize: 22 }}>{lvl.icon}</div>
            <div style={{ fontSize: 11, color: theme.teal, opacity: 0.8 }}>{lvl.title}</div>
          </div>
        </div>

        <button className="btn-primary" onClick={onClose} style={{ background: theme.teal, color: "#0D1117" }}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

// ─── Pantalla: Objetivos ───────────────────────────────────────────────────────
function TasksScreen({ tasks, taskLogs, totalPoints, awardedPeriods, onAddTask, onLogProgress, onDeleteTask }) {
  const [view, setView] = useState("main");
  const [browseCat, setBrowseCat] = useState("TCC");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [logAmount, setLogAmount] = useState(1);
  const [logNote, setLogNote] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    title: "", category: "Personalizada", icon: "✨",
    period: "diario", targetAmount: 1, unit: "sesión", points: 10, description: "",
  });

  const lvl = getCurrentLevel(totalPoints);
  const nextLvl = getNextLevel(totalPoints);
  const mk = getMonthKey();

  const monthCompletions = awardedPeriods.filter(k => {
    const pk = k.split("::")[1];
    if (!pk) return false;
    return (pk.length === 10 && pk.startsWith(mk)) || (pk.length === 7 && pk === mk);
  }).length;

  const monthPoints = awardedPeriods
    .filter(k => {
      const pk = k.split("::")[1];
      if (!pk) return false;
      return (pk.length === 10 && pk.startsWith(mk)) || (pk.length === 7 && pk === mk);
    })
    .reduce((sum, k) => {
      const t = tasks.find(x => x.id === k.split("::")[0]);
      return sum + (t?.points || 0);
    }, 0);

  const activeTasks = tasks.filter(t => t.isActive);

  const handleAddSuggestion = (s) => {
    if (tasks.some(t => t.templateId === s.id)) { setView("main"); return; }
    onAddTask({
      id: genId(), templateId: s.id, title: s.title, category: s.category, icon: s.icon,
      description: s.desc, period: s.period, targetAmount: s.targetAmount,
      unit: s.unit, points: s.points, isActive: true, createdAt: today(),
    });
    setView("main");
  };

  const handleCreate = () => {
    if (!form.title.trim()) return;
    onAddTask({
      id: genId(), templateId: null, title: form.title.trim(), category: form.category, icon: form.icon,
      description: form.description, period: form.period,
      targetAmount: Number(form.targetAmount) || 1, unit: form.unit || "sesión",
      points: Number(form.points) || 10, isActive: true, createdAt: today(),
    });
    setForm({ title: "", category: "Personalizada", icon: "✨", period: "diario", targetAmount: 1, unit: "sesión", points: 10, description: "" });
    setView("main");
  };

  const openLog = (task) => {
    setSelectedTask(task);
    setLogAmount(["minutos", "horas"].includes(task.unit) ? "" : 1);
    setLogNote("");
    setShowLog(true);
  };

  const handleLog = () => {
    if (!selectedTask) return;
    onLogProgress(selectedTask.id, Number(logAmount) || 1, logNote);
    setShowLog(false);
  };

  // ── Vista principal ──────────────────────────────────────────────────────────
  if (view === "main") {
    const lvlPct = nextLvl
      ? Math.min(100, ((totalPoints - lvl.minPoints) / (nextLvl.minPoints - lvl.minPoints)) * 100)
      : 100;
    const ptsToNext = nextLvl ? nextLvl.minPoints - totalPoints : 0;

    return (
      <div style={{ padding: "24px 20px" }}>
        {/* Nivel y puntos */}
        <div className="card" style={{
          marginBottom: 20,
          background: `linear-gradient(135deg, ${lvl.color}18, ${theme.surface})`,
          border: `1px solid ${lvl.color}44`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <p className="label" style={{ marginBottom: 6 }}>Tu nivel</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 28 }}>{lvl.icon}</span>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "Fraunces", color: lvl.color }}>{lvl.title}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="label" style={{ marginBottom: 6 }}>Serenity Points</p>
              <span style={{ fontSize: 28, fontWeight: 700, fontFamily: "Fraunces", color: lvl.color }}>{totalPoints}</span>
            </div>
          </div>
          {nextLvl && (
            <>
              <ProgressBar value={totalPoints - lvl.minPoints} max={nextLvl.minPoints - lvl.minPoints} color={lvl.color} />
              <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 6 }}>
                {ptsToNext} pts para {nextLvl.icon} {nextLvl.title}
              </p>
            </>
          )}
          {!nextLvl && (
            <p style={{ fontSize: 12, color: lvl.color, marginTop: 4 }}>✨ Nivel máximo alcanzado</p>
          )}
        </div>

        {/* Resumen mensual */}
        <button onClick={() => setView("summary")} style={{
          width: "100%", background: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: 14, padding: "14px 16px", textAlign: "left",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24, cursor: "pointer",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: theme.amberSoft, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 20,
            }}>📊</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Resumen mensual</p>
              <p style={{ fontSize: 12, color: theme.textMuted }}>
                {monthCompletions} logros · {monthPoints} pts en {fmtMonthName()}
              </p>
            </div>
          </div>
          <span style={{ color: theme.textMuted, fontSize: 18 }}>›</span>
        </button>

        {/* Prácticas activas */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Mis prácticas activas</h3>
          <span style={{ fontSize: 12, color: theme.textMuted }}>{activeTasks.length} activas</span>
        </div>

        {activeTasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 20px", color: theme.textMuted }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: theme.text }}>Sin prácticas activas</p>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>
              Añade prácticas terapéuticas basadas en evidencia o crea las tuyas personalizadas
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
            {activeTasks.map(task => {
              const progress   = getTaskProgress(task, taskLogs);
              const complete   = progress >= task.targetAmount;
              const cat        = getCategoryInfo(task.category);
              const pct        = Math.min(100, (progress / task.targetAmount) * 100);
              const awardKey   = `${task.id}::${getPeriodKey(task.period)}`;
              const wasAwarded = awardedPeriods.includes(awardKey);
              const isConfirmDelete = deleteTarget === task.id;

              return (
                <div key={task.id} className="card" style={{
                  border: `1px solid ${complete ? cat.color + "55" : theme.border}`,
                  background: complete ? `linear-gradient(135deg, ${cat.color}08, ${theme.surface})` : theme.surface,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: cat.colorSoft,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, flexShrink: 0,
                    }}>{task.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{task.title}</p>
                        <span style={{ fontSize: 12, color: complete ? cat.color : theme.textMuted, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                          {complete ? "✓" : `${progress}/${task.targetAmount}`}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <Badge label={task.category} color={cat.color} bg={cat.colorSoft} />
                        <Badge
                          label={task.period === "diario" ? "Diario" : task.period === "semanal" ? "Semanal" : task.period === "mensual" ? "Mensual" : "Objetivo"}
                          color={theme.textMuted} bg={theme.surfaceAlt}
                        />
                        <Badge label={`⭐ ${task.points} pts`} color={theme.amber} bg={theme.amberSoft} />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: theme.textMuted }}>
                        {progress} de {task.targetAmount} {task.unit}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: complete ? cat.color : theme.textMuted }}>
                        {Math.round(pct)}%
                      </span>
                    </div>
                    <ProgressBar value={progress} max={task.targetAmount} color={cat.color} />
                  </div>

                  {complete && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 10px", background: `${cat.color}15`,
                      borderRadius: 8, marginBottom: 10,
                    }}>
                      <span style={{ fontSize: 14 }}>🌟</span>
                      <span style={{ fontSize: 12, color: cat.color, fontWeight: 500 }}>
                        {wasAwarded ? `+${task.points} pts ganados este período` : "¡Completo! Registra avance para recibir puntos"}
                      </span>
                    </div>
                  )}

                  {isConfirmDelete ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setDeleteTarget(null)} style={{
                        flex: 1, background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
                        borderRadius: 10, padding: 10, fontSize: 13, color: theme.textMuted, cursor: "pointer",
                      }}>Cancelar</button>
                      <button onClick={() => { onDeleteTask(task.id); setDeleteTarget(null); }} style={{
                        flex: 1, background: theme.roseSoft, border: `1px solid ${theme.rose}55`,
                        borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, color: theme.rose, cursor: "pointer",
                      }}>Sí, eliminar</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openLog(task)} style={{
                        flex: 1, background: cat.colorSoft, border: `1px solid ${cat.color}55`,
                        borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600,
                        color: cat.color, cursor: "pointer",
                      }}>+ Registrar avance</button>
                      <button onClick={() => setDeleteTarget(task.id)} style={{
                        background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
                        borderRadius: 10, padding: "10px 14px", color: theme.textDim,
                        fontSize: 16, cursor: "pointer",
                      }}>×</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn-primary" onClick={() => setView("browse")}>
            Explorar prácticas sugeridas
          </button>
          <button className="btn-ghost" onClick={() => { setView("browse"); setBrowseCat("Personalizada"); }}>
            + Crear práctica personalizada
          </button>
        </div>

        {/* Modal: Registrar avance */}
        {showLog && selectedTask && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(13,17,23,0.88)", zIndex: 200,
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}>
            <div className="fade-up" style={{
              background: theme.surface, borderRadius: "24px 24px 0 0",
              padding: "28px 24px 40px", width: "100%", maxWidth: 430,
              border: `1px solid ${theme.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 17, fontWeight: 600 }}>Registrar avance</h3>
                <button onClick={() => setShowLog(false)} style={{
                  background: "transparent", border: "none", color: theme.textMuted, fontSize: 26, cursor: "pointer",
                }}>×</button>
              </div>

              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 22,
                padding: 12, background: theme.surfaceAlt, borderRadius: 12,
              }}>
                <span style={{ fontSize: 24 }}>{selectedTask.icon}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{selectedTask.title}</p>
                  <p style={{ fontSize: 12, color: theme.textMuted }}>
                    Meta: {selectedTask.targetAmount} {selectedTask.unit} ·{" "}
                    {selectedTask.period === "diario" ? "por día" : selectedTask.period === "semanal" ? "por semana" : "por mes"}
                  </p>
                </div>
              </div>

              <p className="label" style={{ marginBottom: 10 }}>¿Cuánto completaste?</p>

              {["minutos", "horas"].includes(selectedTask.unit) ? (
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18 }}>
                  <input
                    type="number" min="1" value={logAmount}
                    onChange={e => setLogAmount(e.target.value)}
                    placeholder="0"
                    style={{ width: 100, textAlign: "center", fontSize: 26, fontWeight: 700, fontFamily: "Fraunces", padding: 12 }}
                  />
                  <div>
                    <p style={{ color: theme.text, fontSize: 15, fontWeight: 600 }}>{selectedTask.unit}</p>
                    <p style={{ color: theme.textMuted, fontSize: 12 }}>meta: {selectedTask.targetAmount}</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
                  <button onClick={() => setLogAmount(a => Math.max(1, Number(a) - 1))} style={{
                    width: 48, height: 48, borderRadius: 12, background: theme.surfaceAlt,
                    border: `1px solid ${theme.border}`, fontSize: 24, color: theme.text, cursor: "pointer",
                  }}>−</button>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 36, fontWeight: 700, fontFamily: "Fraunces", color: theme.text }}>{logAmount}</div>
                    <p style={{ fontSize: 13, color: theme.textMuted }}>{selectedTask.unit}</p>
                  </div>
                  <button onClick={() => setLogAmount(a => Number(a) + 1)} style={{
                    width: 48, height: 48, borderRadius: 12, background: theme.surfaceAlt,
                    border: `1px solid ${theme.border}`, fontSize: 24, color: theme.text, cursor: "pointer",
                  }}>+</button>
                </div>
              )}

              <textarea
                placeholder="Nota opcional (¿cómo te sentiste? ¿qué notaste?)"
                value={logNote} onChange={e => setLogNote(e.target.value)}
                style={{ height: 70, marginBottom: 16 }}
              />

              <button className="btn-primary" onClick={handleLog}>Guardar avance</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Vista: Explorar sugerencias ──────────────────────────────────────────────
  if (view === "browse") {
    const catInfo = getCategoryInfo(browseCat);
    const suggestions = TASK_SUGGESTIONS.filter(s => s.category === browseCat);
    const diffColor = { "Fácil": theme.teal, "Moderado": theme.amber, "Avanzado": theme.rose };

    return (
      <div style={{ padding: "24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => setView("main")} style={{
            background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
            borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center",
            justifyContent: "center", color: theme.text, fontSize: 16, cursor: "pointer",
          }}>←</button>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Explorar prácticas</h2>
        </div>

        {/* Pills de categoría */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 20, scrollbarWidth: "none" }}>
          {TASK_CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setBrowseCat(c.id)} style={{
              flexShrink: 0, padding: "8px 14px", borderRadius: 100, fontSize: 12,
              fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
              background: browseCat === c.id ? c.colorSoft : "transparent",
              border: `1px solid ${browseCat === c.id ? c.color : theme.border}`,
              color: browseCat === c.id ? c.color : theme.textMuted,
            }}>
              {c.icon} {c.id}
            </button>
          ))}
        </div>

        {/* Info de categoría */}
        <div style={{
          background: catInfo.colorSoft, border: `1px solid ${catInfo.color}44`,
          borderRadius: 14, padding: "14px 16px", marginBottom: 20,
        }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: catInfo.color, marginBottom: 4 }}>{catInfo.full}</p>
          <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.55 }}>{catInfo.desc}</p>
        </div>

        {browseCat === "Personalizada" ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>✨</div>
            <p style={{ color: theme.text, fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Diseña tu práctica</p>
            <p style={{ color: theme.textMuted, marginBottom: 24, fontSize: 14, lineHeight: 1.65 }}>
              Crea una práctica completamente adaptada a tus necesidades, ritmo y caso particular
            </p>
            <button className="btn-primary" onClick={() => setView("create")}>
              Crear práctica personalizada
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {suggestions.map(s => {
              const alreadyAdded = tasks.some(t => t.templateId === s.id);
              const dc = diffColor[s.difficulty] || theme.textMuted;
              return (
                <div key={s.id} className="card">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: catInfo.colorSoft,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, flexShrink: 0,
                    }}>{s.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{s.title}</p>
                        <span style={{
                          fontSize: 10, fontWeight: 600, flexShrink: 0, marginLeft: 8,
                          color: dc, background: `${dc}22`, borderRadius: 100, padding: "2px 8px",
                        }}>{s.difficulty}</span>
                      </div>
                      <p style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.55 }}>{s.desc}</p>
                    </div>
                  </div>

                  <div style={{
                    background: theme.surfaceAlt, borderRadius: 10,
                    padding: "8px 12px", marginBottom: 12,
                  }}>
                    <p style={{ fontSize: 11, color: catInfo.color, lineHeight: 1.5 }}>🔬 {s.science}</p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: theme.textMuted }}>⏱ {s.duration}</span>
                      <span style={{ fontSize: 12, color: theme.amber }}>⭐ {s.points} pts</span>
                      <span style={{ fontSize: 12, color: theme.textMuted }}>
                        {s.period === "diario" ? "Diario" : s.period === "semanal" ? "Semanal" : "Mensual"}:
                        {" "}{s.targetAmount} {s.unit}
                      </span>
                    </div>
                    <button onClick={() => handleAddSuggestion(s)} disabled={alreadyAdded} style={{
                      padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                      cursor: alreadyAdded ? "default" : "pointer",
                      background: alreadyAdded ? theme.surfaceAlt : catInfo.colorSoft,
                      border: `1px solid ${alreadyAdded ? theme.border : catInfo.color + "55"}`,
                      color: alreadyAdded ? theme.textMuted : catInfo.color,
                    }}>
                      {alreadyAdded ? "✓ Añadida" : "+ Añadir"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Vista: Crear práctica personalizada ──────────────────────────────────────
  if (view === "create") {
    const formCat = getCategoryInfo(form.category);
    return (
      <div style={{ padding: "24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => setView("browse")} style={{
            background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
            borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center",
            justifyContent: "center", color: theme.text, fontSize: 16, cursor: "pointer",
          }}>←</button>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Nueva práctica</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <p className="label" style={{ marginBottom: 8 }}>Nombre de la práctica</p>
            <input type="text" placeholder="Ej: Journaling de gratitud"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div>
            <p className="label" style={{ marginBottom: 8 }}>Icono</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ICON_OPTIONS.map(ico => (
                <button key={ico} onClick={() => setForm(f => ({ ...f, icon: ico }))} style={{
                  width: 44, height: 44, borderRadius: 10, fontSize: 20, cursor: "pointer",
                  background: form.icon === ico ? theme.accentSoft : theme.surfaceAlt,
                  border: `1px solid ${form.icon === ico ? theme.accent : theme.border}`,
                }}>{ico}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="label" style={{ marginBottom: 8 }}>Enfoque terapéutico</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TASK_CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setForm(f => ({ ...f, category: c.id }))}
                  className={`chip ${form.category === c.id ? "selected" : ""}`}
                  style={form.category === c.id ? {
                    background: c.colorSoft, borderColor: c.color, color: c.color,
                  } : {}}>
                  {c.icon} {c.id}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label" style={{ marginBottom: 8 }}>Frecuencia</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[["diario","Diaria"],["semanal","Semanal"],["mensual","Mensual"],["objetivo","Objetivo único"]].map(([v, l]) => (
                <button key={v} onClick={() => setForm(f => ({ ...f, period: v }))}
                  className={`chip ${form.period === v ? "selected" : ""}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label" style={{ marginBottom: 8 }}>Meta por período</p>
            <div style={{ display: "flex", gap: 10 }}>
              <input type="number" min="1" value={form.targetAmount}
                onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                style={{ width: 80, textAlign: "center" }} />
              <input type="text" placeholder="sesiones / minutos / veces..."
                value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                style={{ flex: 1 }} />
            </div>
          </div>

          <div>
            <p className="label" style={{ marginBottom: 8 }}>Puntos al completar el período</p>
            <div style={{ display: "flex", gap: 8 }}>
              {[5, 10, 15, 20, 25, 30].map(p => (
                <button key={p} onClick={() => setForm(f => ({ ...f, points: p }))} style={{
                  flex: 1, padding: "10px 4px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                  background: form.points === p ? theme.amberSoft : theme.surfaceAlt,
                  border: `1px solid ${form.points === p ? theme.amber : theme.border}`,
                  color: form.points === p ? theme.amber : theme.textMuted,
                }}>{p}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="label" style={{ marginBottom: 8 }}>Descripción (opcional)</p>
            <textarea placeholder="¿Por qué es importante para ti esta práctica?"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ height: 80 }} />
          </div>

          <button className="btn-primary" onClick={handleCreate}
            style={{ opacity: form.title.trim() ? 1 : 0.4 }}>
            Crear práctica
          </button>
        </div>
      </div>
    );
  }

  // ── Vista: Resumen mensual ───────────────────────────────────────────────────
  if (view === "summary") {
    const now = new Date();
    const mk = getMonthKey(now);

    const taskSummaries = tasks.map(task => {
      const completionKeys = awardedPeriods.filter(k => {
        const [tid, pk] = k.split("::");
        if (tid !== task.id || !pk) return false;
        return (pk.length === 10 && pk.startsWith(mk)) || (pk.length === 7 && pk === mk);
      });
      const monthLogs = taskLogs.filter(l => l.taskId === task.id && l.date.startsWith(mk));
      return {
        task,
        completions: completionKeys.length,
        logCount: monthLogs.length,
        pointsEarned: completionKeys.length * task.points,
      };
    }).filter(s => s.logCount > 0 || s.completions > 0);

    const totalMoPts = taskSummaries.reduce((s, t) => s + t.pointsEarned, 0);
    const totalCompl = taskSummaries.reduce((s, t) => s + t.completions, 0);

    const allDates = [...new Set(
      taskLogs.filter(l => l.date.startsWith(mk)).map(l => l.date)
    )].sort();
    let maxStreak = 0, curStreak = 0, prevDate = null;
    for (const d of allDates) {
      if (prevDate) {
        const diff = (new Date(d + "T12:00:00") - new Date(prevDate + "T12:00:00")) / 86400000;
        if (diff === 1) { curStreak++; maxStreak = Math.max(maxStreak, curStreak); }
        else curStreak = 1;
      } else { curStreak = 1; maxStreak = 1; }
      prevDate = d;
    }

    const feedbackMsg = totalCompl >= 15
      ? { title: "Mes excepcional", body: "Estás construyendo nuevos circuitos neurales de calma. La neuroplasticidad trabaja para ti.", icon: "🏆" }
      : totalCompl >= 8
      ? { title: "Gran mes", body: "La consistencia es el ingrediente más poderoso del cambio. Cada logro recablea tu respuesta al estrés.", icon: "⭐" }
      : totalCompl >= 3
      ? { title: "Buen arranque", body: "Todo cambio duradero empieza con pequeños pasos. Tu sistema nervioso ya está respondiendo.", icon: "🌱" }
      : { title: "Empieza hoy", body: "Añade una práctica y registra tu primer avance. El cerebro cambia cuando actuamos, no cuando planeamos.", icon: "💡" };

    return (
      <div style={{ padding: "24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={() => setView("main")} style={{
            background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
            borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center",
            justifyContent: "center", color: theme.text, fontSize: 16, cursor: "pointer",
          }}>←</button>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Resumen mensual</h2>
            <p style={{ fontSize: 12, color: theme.textMuted }}>{fmtMonthName(now)}</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Puntos", value: totalMoPts, icon: "⭐", color: theme.amber },
            { label: "Logros",  value: totalCompl, icon: "✅", color: theme.teal },
            { label: "Racha",   value: `${maxStreak}d`, icon: "🔥", color: theme.rose },
          ].map((s, i) => (
            <div key={i} className="card-sm" style={{ textAlign: "center", border: `1px solid ${s.color}33` }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Fraunces", color: s.color }}>{s.value}</div>
              <div className="label" style={{ marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {taskSummaries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 0", color: theme.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📊</div>
            <p style={{ fontWeight: 600, color: theme.text, marginBottom: 6 }}>Sin registros este mes</p>
            <p style={{ fontSize: 13, lineHeight: 1.65 }}>Registra avances en tus prácticas para ver el resumen aquí.</p>
          </div>
        ) : (
          <>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Prácticas este mes</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {taskSummaries.sort((a, b) => b.completions - a.completions).map(({ task, completions, logCount, pointsEarned }) => {
                const cat = getCategoryInfo(task.category);
                return (
                  <div key={task.id} className="card-sm" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, background: cat.colorSoft,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, flexShrink: 0,
                    }}>{task.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{task.title}</p>
                      <p style={{ fontSize: 12, color: theme.textMuted }}>
                        {logCount} registros · {completions} período{completions !== 1 ? "s" : ""} completo{completions !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {completions > 0
                        ? <span style={{ fontSize: 13, fontWeight: 700, color: theme.amber }}>+{pointsEarned} pts</span>
                        : <span style={{ fontSize: 12, color: theme.textMuted }}>En progreso</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div style={{
          background: theme.tealSoft, border: `1px solid ${theme.teal}44`,
          borderRadius: 16, padding: "18px 16px", textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>{feedbackMsg.icon}</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: theme.teal, marginBottom: 6 }}>{feedbackMsg.title}</p>
          <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.7 }}>{feedbackMsg.body}</p>
        </div>
      </div>
    );
  }

  return null;
}

// ─── App principal ─────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem("anxietyapp_v1");
      const parsed = saved ? JSON.parse(saved) : INITIAL_STATE;
      return {
        ...INITIAL_STATE,
        ...parsed,
        tasks: parsed.tasks || [],
        taskLogs: parsed.taskLogs || [],
        totalPoints: parsed.totalPoints || 0,
        awardedPeriods: parsed.awardedPeriods || [],
      };
    } catch { return INITIAL_STATE; }
  });

  const [screen, setScreen] = useState("home");
  const [activeTechnique, setActiveTechnique] = useState(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [celebration, setCelebration] = useState(null);

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

  const handleAddTask = (task) => {
    setState(s => ({ ...s, tasks: [...s.tasks, task] }));
  };

  const handleLogProgress = (taskId, amount, note) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newLog = {
      id: genId(), taskId, date: today(),
      amount: Number(amount) || 1, note: note || "",
      timestamp: Date.now(),
    };
    const hypoLogs = [...state.taskLogs, newLog];
    const periodKey = getPeriodKey(task.period);
    const awardKey = `${taskId}::${periodKey}`;
    const awarded = state.awardedPeriods || [];

    let pointsEarned = 0;
    let shouldAward = false;
    if (!awarded.includes(awardKey)) {
      const progress = getTaskProgress(task, hypoLogs);
      if (progress >= task.targetAmount) {
        pointsEarned = task.points;
        shouldAward = true;
      }
    }

    setState(s => ({
      ...s,
      taskLogs: [...s.taskLogs, newLog],
      totalPoints: s.totalPoints + pointsEarned,
      awardedPeriods: shouldAward ? [...(s.awardedPeriods || []), awardKey] : (s.awardedPeriods || []),
    }));

    if (shouldAward) {
      setCelebration({ task, pointsEarned });
    }
  };

  const handleDeleteTask = (taskId) => {
    setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== taskId) }));
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
    { id: "home",      icon: "🏠", label: "Inicio" },
    { id: "checkin",   icon: "✏️", label: "Diario" },
    { id: "techniques",icon: "🧘", label: "Técnicas" },
    { id: "objetivos", icon: "🎯", label: "Objetivos" },
    { id: "progress",  icon: "📊", label: "Progreso" },
    { id: "learn",     icon: "📚", label: "Aprende" },
  ];

  return (
    <>
      <GlobalStyle />
      {celebration && (
        <CelebrationModal
          task={celebration.task}
          pointsEarned={celebration.pointsEarned}
          totalPoints={state.totalPoints}
          onClose={() => setCelebration(null)}
        />
      )}
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
          {screen === "objetivos" && (
            <TasksScreen
              tasks={state.tasks}
              taskLogs={state.taskLogs}
              totalPoints={state.totalPoints}
              awardedPeriods={state.awardedPeriods || []}
              onAddTask={handleAddTask}
              onLogProgress={handleLogProgress}
              onDeleteTask={handleDeleteTask}
            />
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

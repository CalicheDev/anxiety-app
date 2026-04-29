# Serenity — App de Control de Ansiedad

App Android (PWA + Capacitor) para controlar y reducir la ansiedad con técnicas basadas en neurociencia, psicoanálisis y terapias de tercera generación. Completamente offline, sin backend, sin APIs externas.

---

## Funcionalidades

### Pantallas principales

| Pantalla | Descripción |
|----------|-------------|
| **Inicio** | Panel con racha, sesiones, técnicas rápidas y estadísticas del día |
| **Diario** | Check-in diario: nivel de ansiedad (1–5), disparadores y notas |
| **Técnicas** | 5 técnicas guiadas de respiración y anclaje cognitivo |
| **Objetivos** | Sistema de prácticas terapéuticas con tracking y recompensas |
| **Progreso** | Historial, gráficas de tendencia y disparadores frecuentes |
| **Aprende** | Artículos de neurociencia y psicoanálisis aplicados |

### Sistema de Objetivos y Prácticas

El módulo central nuevo. Permite al usuario:

- **Explorar prácticas sugeridas** organizadas por enfoque terapéutico:
  - TCC (Terapia Cognitivo-Conductual) — diario de pensamientos, exposición gradual, activación conductual
  - ACT (Aceptación y Compromiso) — clarificación de valores, defusión cognitiva, acción comprometida
  - DBT (Dialéctico-Conductual) — habilidad TIPP, mindfulness DBT, regulación emocional
  - Neurociencia Aplicada — coherencia cardíaca, estimulación vagal, NSDR/Yoga Nidra, luz solar matutina
  - Hipnoterapia Guiada — relajación hipnótica, anclaje positivo neurolingüístico
  - Mindfulness / MBSR — meditación de atención plena, caminata consciente

- **Crear prácticas personalizadas** con frecuencia libre (diaria, semanal, mensual, objetivo único), unidad de medida libre (minutos, sesiones, veces, etc.) y meta parametrizable

- **Registrar avance** por período: contador incremental para prácticas contables, campo numérico para prácticas de tiempo (minutos/horas)

- **Sistema de recompensas** basado en el circuito dopaminérgico mesolímbico:
  - 5 niveles: Aprendiz → Practicante → Comprometido → Maestro → Sabio
  - Puntos (Serenity Points) por cada período completado
  - Modal de celebración con mensajes neurocientíficos al alcanzar cada objetivo
  - Prevención de doble recompensa por período ya acreditado

- **Resumen mensual** con métricas de puntos, logros, racha máxima y análisis adaptativo

### Modo Crisis
Protocolo de 3 fases con respiración de emergencia guiada y técnica de grounding 5-4-3-2-1. Accesible vía botón flotante desde la pantalla de inicio.

---

## Requisitos previos

| Herramienta | Versión mínima | Descarga |
|-------------|----------------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Android Studio | Flamingo+ | [developer.android.com/studio](https://developer.android.com/studio) |
| JDK | 17+ | Incluido en Android Studio |
| Android SDK | API 22+ | Incluido en Android Studio |

---

## Cómo compilar el APK

### Opción A — Script automático (recomendado)

```bash
# APK de debug (para pruebas)
bash BUILD.sh

# APK de release (para distribución)
bash BUILD.sh release
```

### Opción B — Paso a paso manual

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar la web app
npm run build

# 3. Sincronizar con Android
npx cap sync android

# 4. Compilar APK debug
cd android && ./gradlew assembleDebug

# El APK queda en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Opción C — Abrir en Android Studio

```bash
npm run build
npx cap sync android
npx cap open android
```

Luego: **Build → Build Bundle(s)/APK(s) → Build APK(s)**

---

## Comandos de desarrollo

```bash
npm run dev            # Dev server con hot reload en localhost:5173
npm run build          # Build de producción → /dist
npm run preview        # Preview del build de producción
npm run build:android  # Build web + sync Capacitor assets
npm run apk:debug      # Genera APK debug (ejecuta build:android primero)
npm run apk:release    # Genera APK de release firmado
```

---

## Instalar en el teléfono

```bash
# Via USB (con USB Debugging activado)
adb install android/app/build/outputs/apk/debug/app-debug.apk

# O copia el .apk al teléfono y ábrelo desde el explorador de archivos
```

---

## Estructura del proyecto

```
serenity-anxiety-app/
├── src/
│   ├── App.jsx          ← App completa React (~2700 líneas, monolítica)
│   └── main.jsx         ← Entry point + init Capacitor plugins
├── public/
│   ├── manifest.json    ← PWA manifest
│   ├── icons/           ← Iconos app (72→512px)
│   └── icon.svg         ← Icono vectorial
├── android/             ← Proyecto Android nativo (Capacitor)
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml
│   │   └── res/         ← Recursos, splash screens, iconos
│   └── gradlew
├── dist/                ← Build web (generado por Vite)
├── capacitor.config.json
├── vite.config.js
├── BUILD.sh             ← Script build automatizado
└── README.md
```

---

## Arquitectura

Todo el código UI vive en `src/App.jsx`. No hay router ni state manager externo.

**Navegación:** variable `screen` (string) controlada con `setScreen()`. Pantallas: `home`, `techniques`, `objetivos`, `progress`, `learn`. Check-in y Crisis son overlays sobre cualquier pantalla.

**Persistencia:** `localStorage` con clave `anxietyapp_v1`. Forma del estado:

```javascript
{
  profile: { name, streak, totalSessions, joinDate },
  logs: [{ date, level, triggers, notes, timestamp }],
  tasks: [{ id, templateId, title, category, icon, period, targetAmount, unit, points, isActive, createdAt }],
  taskLogs: [{ id, taskId, date, amount, note, timestamp }],
  totalPoints: number,
  awardedPeriods: ["taskId::periodKey", ...],
  currentCrisis: boolean
}
```

**Escala de ansiedad:** 1 = Crisis, 5 = Tranquilo (escala invertida respecto a la intuición típica).

---

## Personalización

### Cambiar nombre de la app
- `android/app/src/main/res/values/strings.xml` → `app_name`
- `capacitor.config.json` → `appName`
- `public/manifest.json` → `name` / `short_name`

### Cambiar ID de la app (para Play Store)
- `capacitor.config.json` → `appId`
- `android/app/build.gradle` → `applicationId`
- `android/app/src/main/AndroidManifest.xml` → actualizar provider authority

### Agregar iconos reales
Reemplaza los archivos en `public/icons/` con tus PNGs:

```bash
npx @capacitor/assets generate --android
```

---

## Publicar en Google Play Store

1. Genera un keystore de firma:
```bash
keytool -genkey -v -keystore serenity-release.keystore \
  -alias serenity -keyalg RSA -keysize 2048 -validity 10000
```

2. Configura la firma en `android/app/build.gradle`:
```gradle
android {
  signingConfigs {
    release {
      storeFile file('../../serenity-release.keystore')
      storePassword 'TU_PASSWORD'
      keyAlias 'serenity'
      keyPassword 'TU_KEY_PASSWORD'
    }
  }
  buildTypes {
    release { signingConfig signingConfigs.release }
  }
}
```

3. Compila el release:
```bash
bash BUILD.sh release
# Salida: android/app/build/outputs/apk/release/app-release.apk
```

---

## Plugins Capacitor incluidos

| Plugin | Uso |
|--------|-----|
| `@capacitor/splash-screen` | Pantalla de carga oscura de 2 segundos |
| `@capacitor/status-bar` | Barra de estado con estilo oscuro |
| `@capacitor/haptics` | Vibración en botón crisis y técnicas |

---

## Solución de problemas

**`ANDROID_HOME` no configurado**
```bash
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**`SDK location not found`**
Crea `android/local.properties`:
```
sdk.dir=/home/TU_USUARIO/Android/Sdk
```

**Gradle descarga muy lento**
```bash
cd android && ./gradlew assembleDebug --offline
```

---

## Info técnica

| Item | Valor |
|------|-------|
| Framework | React 18 + Vite 6 |
| Wrapper nativo | Capacitor 6 |
| Min SDK | Android 5.1 (API 22) |
| Target SDK | Android 14 (API 34) |
| Idioma | Español (es-MX) |
| Datos | localStorage (100% offline) |
| Bundle size | ~183 KB (gzip ~57 KB) |
| Tests | Sin framework de tests |

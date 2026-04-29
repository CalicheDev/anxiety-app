# 🌿 Serenity — App de Control de Ansiedad

App Android (PWA + Capacitor) para controlar y reducir la ansiedad con técnicas de neurociencia y psicoanálisis.

---

## 📋 Requisitos previos

| Herramienta | Versión mínima | Descarga |
|-------------|---------------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Android Studio | Flamingo+ | [developer.android.com/studio](https://developer.android.com/studio) |
| JDK | 17+ | Incluido en Android Studio |
| Android SDK | API 22+ | Incluido en Android Studio |

---

## 🚀 Cómo compilar el APK

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
cd android
./gradlew assembleDebug

# El APK queda en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Opción C — Abrir en Android Studio

```bash
npm run build
npx cap sync android
npx cap open android   # Abre Android Studio
```
Luego en Android Studio: **Build → Build Bundle(s)/APK(s) → Build APK(s)**

---

## 📱 Instalar en el teléfono

```bash
# Via USB (con USB Debugging activado)
adb install android/app/build/outputs/apk/debug/app-debug.apk

# O simplemente copia el .apk al teléfono y ábrelo
```

---

## 🔄 Flujo de desarrollo

```bash
# Desarrollo con hot reload
npm run dev

# Cuando cambias código React → rebuild → sync
npm run build:android    # = npm run build + npx cap sync android

# Si agregas plugins Capacitor
npm install @capacitor/plugin-name
npx cap sync android
```

---

## 📂 Estructura del proyecto

```
serenity-anxiety-app/
├── src/
│   ├── App.jsx          ← App completa React
│   └── main.jsx         ← Entry point
├── public/
│   ├── manifest.json    ← PWA manifest
│   ├── icons/           ← Iconos app (72→512px)
│   └── icon.svg         ← Icono vectorial
├── android/             ← Proyecto Android nativo (Capacitor)
│   ├── app/
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── res/     ← Recursos, iconos, colores
│   └── gradlew          ← Gradle wrapper
├── dist/                ← Build web (generado)
├── capacitor.config.json
├── vite.config.js
├── BUILD.sh             ← Script build automatizado
└── README.md
```

---

## 🎨 Personalización

### Cambiar nombre de la app
- `android/app/src/main/res/values/strings.xml` → `app_name`
- `capacitor.config.json` → `appName`
- `public/manifest.json` → `name` / `short_name`

### Cambiar ID de la app (para publicar en Play Store)
- `capacitor.config.json` → `appId`
- `android/app/build.gradle` → `applicationId`
- `android/app/src/main/AndroidManifest.xml` → actualizar provider authority

### Agregar iconos reales
Reemplaza los archivos en `public/icons/` con tus iconos PNG reales:
- `icon-72.png`, `icon-96.png`, `icon-128.png`, `icon-192.png`, `icon-512.png`

Luego genera los recursos Android con:
```bash
npx @capacitor/assets generate --android
```

---

## 🏪 Publicar en Google Play Store

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
    release {
      signingConfig signingConfigs.release
    }
  }
}
```

3. Compila el release:
```bash
bash BUILD.sh release
```

4. El APK firmado estará en:
   `android/app/build/outputs/apk/release/app-release.apk`

---

## 🧩 Plugins Capacitor incluidos

| Plugin | Uso |
|--------|-----|
| `@capacitor/splash-screen` | Pantalla de carga con fondo oscuro |
| `@capacitor/status-bar` | Barra de estado oscura |
| `@capacitor/haptics` | Vibración en interacciones clave |

---

## 🐛 Solución de problemas

**Error: `ANDROID_HOME` no configurado**
```bash
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Error: `SDK location not found`**
Crea el archivo `android/local.properties`:
```
sdk.dir=/home/TU_USUARIO/Android/Sdk
```

**Error: Gradle descarga muy lento**
```bash
# Usa la caché local de Gradle
cd android && ./gradlew assembleDebug --offline
```

---

## 📊 Info técnica

- **Framework**: React 18 + Vite 6
- **Wrapper nativo**: Capacitor 6
- **Min SDK**: Android 5.1 (API 22)
- **Target SDK**: Android 14 (API 34)
- **Bundle size**: ~183 KB (gzip: ~57 KB)
- **Datos**: localStorage (offline-first)

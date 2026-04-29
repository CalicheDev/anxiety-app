#!/bin/bash
# ============================================================
#  Serenity — Build Script para APK Android
#  Ejecuta este script en tu máquina con Android Studio
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════╗"
echo "║   Serenity — Build APK para Android  ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"

# ── Verificar dependencias ──────────────────────────────────
echo -e "${YELLOW}[1/5] Verificando dependencias...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js no encontrado. Instala desde nodejs.org${NC}"; exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm no encontrado.${NC}"; exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    echo -e "${YELLOW}⚠ ANDROID_HOME no configurado. Intentando con Android Studio...${NC}"
    # Rutas comunes de Android SDK
    POSSIBLE_PATHS=(
        "$HOME/Android/Sdk"
        "$HOME/Library/Android/sdk"
        "$LOCALAPPDATA/Android/Sdk"
        "/opt/android-sdk"
    )
    for p in "${POSSIBLE_PATHS[@]}"; do
        if [ -d "$p" ]; then
            export ANDROID_HOME="$p"
            export ANDROID_SDK_ROOT="$p"
            echo -e "${GREEN}✓ Android SDK encontrado: $p${NC}"
            break
        fi
    done
    if [ -z "$ANDROID_HOME" ]; then
        echo -e "${RED}✗ Android SDK no encontrado."
        echo "  Instala Android Studio desde: https://developer.android.com/studio"
        echo "  Luego ejecuta: export ANDROID_HOME=~/Android/Sdk${NC}"
        exit 1
    fi
fi

# ── Instalar dependencias npm ───────────────────────────────
echo -e "${YELLOW}[2/5] Instalando dependencias npm...${NC}"
npm install
echo -e "${GREEN}✓ Dependencias instaladas${NC}"

# ── Build React ─────────────────────────────────────────────
echo -e "${YELLOW}[3/5] Compilando React app...${NC}"
npm run build
echo -e "${GREEN}✓ Build completado (dist/)${NC}"

# ── Sync Capacitor ──────────────────────────────────────────
echo -e "${YELLOW}[4/5] Sincronizando con Android...${NC}"
npx cap sync android
echo -e "${GREEN}✓ Assets sincronizados${NC}"

# ── Build APK ───────────────────────────────────────────────
echo -e "${YELLOW}[5/5] Compilando APK...${NC}"
cd android

if [ "$1" == "release" ]; then
    echo "  Modo: RELEASE"
    ./gradlew assembleRelease --no-daemon
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
else
    echo "  Modo: DEBUG (usa 'bash BUILD.sh release' para release)"
    ./gradlew assembleDebug --no-daemon
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

cd ..

if [ -f "android/$APK_PATH" ]; then
    SIZE=$(du -sh "android/$APK_PATH" | cut -f1)
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ✓ APK GENERADO!             ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
    echo -e "  📦 Ruta:  android/$APK_PATH"
    echo -e "  📏 Tamaño: $SIZE"
    echo ""
    echo -e "${BLUE}Para instalar en tu teléfono (USB debugging):${NC}"
    echo -e "  adb install android/$APK_PATH"
    echo ""
else
    echo -e "${RED}✗ El APK no fue generado. Revisa los errores arriba.${NC}"
    exit 1
fi

# AI Money — App de Finanzas Personales con IA (Local-First)

Inspirada en el modelo de producto de [AI Money](https://www.ai-money.app/es) y su asistente conversacional Denis. Esta solución permite registrar gastos e ingresos de manera manual, por texto en lenguaje natural, fotos de recibos, notas de voz y a través de WhatsApp, manteniendo todos los datos financieros almacenados de forma privada en el dispositivo local con SQLite.

---

## 🏛️ Arquitectura del Sistema

```
ai-money/
├── packages/
│   └── shared/          # Modelos, esquemas Zod y categorías compartidas
├── apps/
│   ├── mobile/          # Cliente React Native (Expo SDK 52+, TypeScript)
│   │   └── src/
│   │       ├── db/          # Base de datos local SQLite (expo-sqlite) y repositorios
│   │       ├── context/     # FinanceContext (estado reactivo, balance, estadísticas)
│   │       └── components/  # Dashboard, tarjetas, modales de IA y chat Denis
│   └── backend/         # API Node.js / Express para orquestación de IA y WhatsApp
│       └── src/
│           ├── routes/      # Webhook WhatsApp, sincronización, atajos iOS/SMS
│           └── services/    # Extracción estructurada con IA y Denis Chat
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ (probado en Node v24)
- npm 10+
- Dispositivo móvil físico con la app **Expo Go** o emulador Android/iOS

### Instalación de dependencias
```bash
npm install
npm run build:shared
```

### Ejecutar el Cliente Móvil (Expo)
```bash
npm run mobile
```
Escanea el código QR desde tu teléfono con la app **Expo Go** (Android) o la cámara (iOS).

### Ejecutar el Backend (IA & WhatsApp)
```bash
npm run backend
```
El servidor arrancará en `http://localhost:3001`.

---

## ✨ Características Implementadas (MVP)

1. **Arquitectura Local-First con SQLite:**
   - La base de datos `aimoney.db` vive íntegramente en el teléfono móvil del usuario.
   - Modelos de `accounts`, `categories`, `transactions` y `budgets` con soporte para soft deletes (`deleted_at`) para sincronización delta libre de colisiones.
   - Semillas automáticas en el primer arranque: categorías estándar con iconos de Material Design y cuentas base (Efectivo y Bancaria).

2. **Dashboard Financiero Completo:**
   - Visualización de Patrimonio Total en tiempo real.
   - Tarjeta mensual con total de Ingresos, Gastos y porcentaje de tasa de ahorro.
   - Carrusel de cuentas con saldos actualizados automáticamente en cada transacción.
   - Barras de progreso de las categorías con mayor gasto del mes.
   - Historial de transacciones recientes con filtros rápidos (*Todos*, *Gastos*, *Ingresos*).

3. **Registro Rápido con IA:**
   - Modal flotante para escribir gastos en lenguaje natural: *"Almuerzo 28.000 con tarjeta Nu"*, *"Uber 15k"*.
   - El extractor identifica automáticamente el monto, la categoría, el comercio y el tipo de movimiento.

4. **Asistente Denis IA ("Pregúntale a Denis"):**
   - Interfaz conversacional con chips de contexto en vivo (Balance, Gastos).
   - Respuestas adaptadas a los números reales almacenados en la base de datos local SQLite.

5. **Integración con WhatsApp:**
   - Flujo de emparejamiento con código OTP de 6 dígitos desde la pestaña *Ajustes*.
   - Webhook unificado (compatible con Twilio y Meta WhatsApp Cloud API) que procesa mensajes entrantes y encola las transacciones para su descarga en la app móvil.

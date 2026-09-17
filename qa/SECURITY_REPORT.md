# INFORME DE SEGURIDAD Y VULNERABILIDADES (OWASP) — AI MONEY

> **Estándar de Evaluación**: OWASP Top 10 Web / API Security  
> **Alcance**: Frontend Web en Producción, Bundle JS, Configuración de Cabeceras y Backend Express  
> **Fecha**: 17 de Septiembre, 2026  

---

## 1. Cuadro de Resumen de Riesgos

| ID Riesgo | Categoría OWASP | Componente Afectado | Severidad | Estado |
| :--- | :--- | :--- | :---: | :---: |
| **SEC-01** | A01:2021 Broken Access Control | Backend CORS (`Access-Control-Allow-Origin: *`) | **ALTO** | VULNERABLE |
| **SEC-02** | A05:2021 Security Misconfiguration | Cabeceras de seguridad ausentes (CSP, X-Frame-Options, etc.) | **MEDIO** | VULNERABLE |
| **SEC-03** | A05:2021 Security Misconfiguration | Exposición de tecnología (`X-Powered-By: Express`) | **BAJO** | VULNERABLE |
| **SEC-04** | A08:2021 Software and Data Integrity | Petición Insegura / Contenido Mixto (`http://localhost:3001`) | **MEDIO** | VULNERABLE |
| **SEC-05** | A02:2021 Cryptographic Failures | Datos financieros sin cifrar en `localStorage` | **MEDIO** | INFORMATIVO |
| **SEC-06** | A06:2021 Vulnerable Components | Dependencias vulnerables (`qs` en Express / `uuid` en Expo) | **MEDIO** | VULNERABLE |
| **SEC-07** | A04:2021 Insecure Design | Ausencia de Rate Limiting en endpoints de IA | **MEDIO** | VULNERABLE |
| **SEC-08** | A01:2021 Leaks & Secrets | Escaneo de credenciales en Bundle JS | **INFO** | **PASS (0 fugas)** |

---

## 2. Análisis Detallado de Hallazgos

### 2.1 SEC-01: Política de Origen Cruzado (CORS) Permisiva en Backend
- **Evidencia Empírica**:
  ```http
  OPTIONS /api/ai/chat-denis HTTP/1.1
  Host: localhost:3001
  Origin: https://evil-attacker-site.com
  Access-Control-Request-Method: POST

  HTTP/1.1 204 No Content
  Access-Control-Allow-Origin: *
  ```
- **Impacto**: Cualquier aplicación web abierta en el navegador del usuario puede enviar solicitudes al backend local en el puerto 3001 y extraer el contexto financiero y respuestas de IA sin restricción de origen.
- **Remediación**: Configurar `cors` en `apps/backend/src/index.ts` con una lista blanca explícita de dominios autorizados (ej. `https://backend-gold-omega-57.vercel.app`, `http://localhost:8081`).

### 2.2 SEC-02 & SEC-03: Cabeceras de Seguridad Faltantes
- **Evidencia en Frontend (Vercel)**:
  - Solo incluye `strict-transport-security`.
  - **Faltan**: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
  - *Riesgo*: Sin `X-Frame-Options`, la aplicación puede ser embebida en un iframe invisible para ataques de Clickjacking.
- **Evidencia en Backend (Express)**:
  - Cabecera `X-Powered-By: Express` visible en todas las respuestas HTTP, facilitando el reconocimiento de stack a potenciales atacantes.
- **Remediación**:
  - Incorporar middleware `helmet` en el backend Express.
  - Agregar cabeceras de seguridad en `vercel.json`.

### 2.3 SEC-04: Referencia Hardcodeada a `http://localhost:3001` (Contenido Mixto)
- **Evidencia en Código**:
  - `apps/mobile/src/components/DenisChatModal.tsx:66`: `const resp = await fetch('http://localhost:3001/api/ai/chat-denis', ...)`.
- **Impacto**: En despliegue HTTPS en Vercel, el navegador bloquea la llamada por violación de Contenido Mixto (`blocked:mixed-content`). Si bien el código posee un fallback local, genera errores en la consola del cliente y anula la integración con el backend.
- **Remediación**: Emplear una variable de entorno (`EXPO_PUBLIC_API_URL` o configuración dinámica) y protocolo seguro HTTPS relativo o absoluto.

### 2.4 SEC-05: Almacenamiento Local en Texto Plano
- **Evidencia**: Los datos de cuentas, transacciones y saldos de Mario se guardan en JSON plano bajo `localStorage.getItem('ai_money_web_db_v5')`.
- **Impacto**: Aunque es el comportamiento estándar en aplicaciones web locales, cualquier extensión de navegador maliciosa o script XSS tiene acceso irrestricto a los registros financieros.

### 2.5 SEC-06: Vulnerabilidades en Dependencias (`npm audit`)
- **Evidencia**:
  - 13 vulnerabilidades de severidad moderada identificadas por `npm audit`:
    - `qs` en `body-parser` / `express` (Bypass de límite de arrays y DoS).
    - `uuid` en utilitarios de compilación de `@expo/cli`.
- **Remediación**: Ejecutar `npm audit fix` en dependencias compatibles sin romper dependencias de Expo SDK 57.

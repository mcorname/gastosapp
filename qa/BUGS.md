# CATÁLOGO OFICIAL DE BUGS Y DEFECTOS (BUGS.MD) — AI MONEY

> **Auditoría QA**: Basada en Evidencias Empíricas  
> **Total de Defectos Identificados**: 10  
> **Distribución por Severidad**: 3 Alta | 5 Media | 2 Baja  

---

## Índice de Defectos

1. [BUG-001: Despliegue Desactualizado en Vercel Impide Apertura de Modales](#bug-001) (Alta)
2. [BUG-002: Desbordamiento Horizontal en Smartphones por Encabezado Superior](#bug-002) (Alta)
3. [BUG-003: Desbordamiento Horizontal en Tablet Paisaje (1024x768)](#bug-003) (Media)
4. [BUG-004: CORS Permisivo con Wildcard (*) en Servidor Express](#bug-004) (Alta)
5. [BUG-005: Referencia Hardcodeada a http://localhost:3001 Causa Contenido Mixto](#bug-005) (Media)
6. [BUG-006: Fallas Severas de Contraste Tipográfico en Métricas (WCAG AA)](#bug-006) (Media)
7. [BUG-007: Ausencia de H1 y Landmarks Semánticos en el DOM Web](#bug-007) (Media)
8. [BUG-008: Inconsistencia de Marca 'Denis' y Moneda '$' en Asistente Local](#bug-008) (Baja)
9. [BUG-009: Ausencia de Cabeceras de Seguridad y Exposición X-Powered-By](#bug-009) (Media)
10. [BUG-010: Vulnerabilidades en Dependencias (13 Moderadas en qs y uuid)](#bug-010) (Baja)

---

### BUG-001
- **Título**: Despliegue Desactualizado en Vercel Impide Apertura de Modales de Desglose y Ajuste
- **Severidad**: **ALTA** | **Categoría**: Funcional / DevOps
- **Entorno**: Producción (`https://backend-gold-omega-57.vercel.app/`)
- **Pasos para Reproducir**:
  1. Ingresar a `https://backend-gold-omega-57.vercel.app/`.
  2. Hacer clic sobre la tarjeta "Patrimonio Total".
  3. Navegar a la pestaña "Cuentas" y hacer clic en el botón "Ajustar saldo".
- **Resultado Esperado**: Apertura de `NetWorthBreakdownModal` y `BalanceAdjustmentModal`.
- **Resultado Obtenido**: Ninguna respuesta visual ni modal desplegado.
- **Causa Raíz**: Vercel ejecuta el bundle `index-c1d7d6d9cd5f1fc794c1c7bb37883462.js` correspondiente al commit `9508657`, previo a los commits locales `c1751ca` y `22a8648`.
- **Remediación**: Sincronizar repositorio local y ejecutar redeploy en Vercel.

---

### BUG-002
- **Título**: Desbordamiento Horizontal (+93px a +203px) en Todos los Viewports Móviles
- **Severidad**: **ALTA** | **Categoría**: Responsive / UI
- **Entorno**: Producción y Local en resoluciones de 320px a 430px de ancho
- **Pasos para Reproducir**:
  1. Abrir la aplicación en un emulador o dispositivo móvil (ej. iPhone 12/13/14 a 390px o iPhone SE a 320px).
  2. Deslizar la pantalla horizontalmente.
- **Resultado Esperado**: La interfaz debe mantenerse dentro del 100% del viewport (`scrollWidth === clientWidth`).
- **Resultado Obtenido**: Desbordamiento horizontal visible con `scrollWidth` de 523px (+133px a +203px de scroll indeseado).
- **Causa Raíz**: En `TopHeader.tsx`, la barra de búsqueda tiene `width: 290px` fijo y el botón de perfil se ubica a la derecha en `x: 463px` llegando a `523px`.
- **Evidencia**: `qa/screenshots/vp_iphone_12_14_390x844.png`, `qa/screenshots/vp_iphone_se_1st_320x568.png`.
- **Remediación**: En pantallas `< 640px`, colapsar el input de búsqueda en un icono táctil y ocultar el avatar redundante.

---

### BUG-003
- **Título**: Desbordamiento Horizontal (+132px) en Resolución Tablet Paisaje (1024x768)
- **Severidad**: **MEDIA** | **Categoría**: Responsive / Layout
- **Entorno**: Resolución 1024x768
- **Pasos para Reproducir**:
  1. Configurar viewport a 1024x768 (iPad en modo horizontal).
  2. Observar el borde derecho del encabezado.
- **Resultado Esperado**: Adaptación fluida sin barra de desplazamiento horizontal.
- **Resultado Obtenido**: `scrollWidth: 1156px` vs `clientWidth: 1024px` (+132px de desbordamiento).
- **Causa Raíz**: Activación del Sidebar de escritorio (~240px) sumado al ancho mínimo inflexible del contenedor del TopHeader.
- **Remediación**: Aplicar `flexShrink: 1` y `minWidth: 0` al encabezado y limitar el ancho máximo del input en 1024px.

---

### BUG-004
- **Título**: Política CORS Permisiva con Comodín (*) en Backend Express
- **Severidad**: **ALTA** | **Categoría**: Seguridad (OWASP A01: Broken Access Control)
- **Entorno**: Backend (`http://localhost:3001`)
- **Pasos para Reproducir**:
  1. Enviar petición `OPTIONS` con cabecera `Origin: https://sitio-malicioso.com`.
- **Resultado Esperado**: Rechazo o ausencia de `Access-Control-Allow-Origin` para orígenes no autorizados.
- **Resultado Obtenido**: Cabecera de respuesta `Access-Control-Allow-Origin: *`.
- **Causa Raíz**: `app.use(cors())` sin configuración de whitelist en `apps/backend/src/index.ts`.
- **Remediación**: Restringir el origen a dominios autorizados de la aplicación.

---

### BUG-005
- **Título**: Referencia Hardcodeada a `http://localhost:3001` Causa Error de Contenido Mixto
- **Severidad**: **MEDIA** | **Categoría**: Seguridad / Arquitectura
- **Entorno**: Producción Web en Vercel (HTTPS)
- **Pasos para Reproducir**:
  1. Abrir la aplicación en `https://backend-gold-omega-57.vercel.app/`.
  2. Abrir la consola de desarrollador (F12).
  3. Enviar un mensaje en el modal de Mario IA.
- **Resultado Esperado**: Comunicación segura con el backend vía HTTPS o invocación directa del motor local sin errores de consola.
- **Resultado Obtenido**: El navegador bloquea la llamada por `Mixed Content` (`http://` dentro de `https://`).
- **Causa Raíz**: `apps/mobile/src/components/DenisChatModal.tsx:66` invoca directamente la URL insegura `http://localhost:3001`.
- **Remediación**: Parametrizar la URL mediante `process.env.EXPO_PUBLIC_API_URL` o protocolo relativo con HTTPS.

---

### BUG-006
- **Título**: Fallas Severas de Contraste Tipográfico en Métricas Clave (WCAG AA 1.4.3)
- **Severidad**: **MEDIA** | **Categoría**: Accesibilidad
- **Entorno**: Producción Desktop y Móvil
- **Pasos para Reproducir**:
  1. Ejecutar análisis Axe-Core en el Dashboard.
- **Resultado Esperado**: Ratio de contraste mínimo de 4.5:1 para texto estándar y 3:1 para texto grande.
- **Resultado Obtenido**: 40 nodos con ratios deficientes (2.78:1 a 2.93:1) en etiquetas "PATRIMONIO TOTAL", "INGRESOS", montos verdes y naranjas.
- **Remediación**: Ajustar valores hexadecimales en la paleta del tema (`#6E6E69`, `#097B55`, `#D9451C`).

---

### BUG-007
- **Título**: Ausencia de Landmarks Semánticos (`main`, `banner`) y Encabezado `<h1>`
- **Severidad**: **MEDIA** | **Categoría**: Accesibilidad (WCAG 1.3.1, 2.4.1)
- **Entorno**: Web (React Native for Web)
- **Pasos para Reproducir**:
  1. Inspeccionar el árbol DOM generado en el navegador.
- **Resultado Esperado**: Existencia de un elemento `<main>` y un encabezado `<h1>`.
- **Resultado Obtenido**: Estructura 100% de `<div>` sin roles semánticos de navegación ni encabezados de primer nivel.
- **Remediación**: Agregar atributos `accessibilityRole="header"` y `accessibilityRole="main"` en las vistas base.

---

### BUG-008
- **Título**: Inconsistencia de Nomenclatura "Denis" y Moneda en Dólares ($) en Respuestas del Asistente
- **Severidad**: **BAJA** | **Categoría**: UX / Branding
- **Entorno**: Diálogo del Asistente Financiero
- **Pasos para Reproducir**:
  1. Abrir "Pregúntale a Mario".
  2. Preguntar: "¿Cómo puedo ahorrar?".
- **Resultado Esperado**: Respuesta consistente con la identidad "Mario" y montos en Soles (`S/`).
- **Resultado Obtenido**: El mensaje menciona "Resumen rápido de Denis" y formatea los montos con `$`.
- **Causa Raíz**: Strings literales obsoletos en `DenisChatModal.tsx:93-105`.
- **Remediación**: Actualizar los textos y usar la moneda activa del usuario.

---

### BUG-009
- **Título**: Ausencia de Cabeceras de Seguridad y Exposición de Tecnología en Express
- **Severidad**: **MEDIA** | **Categoría**: Seguridad (OWASP A05)
- **Entorno**: Backend Express y Frontend Vercel
- **Pasos para Reproducir**:
  1. Inspeccionar las cabeceras HTTP de respuesta de `/health` y del home de Vercel.
- **Resultado Esperado**: Presencia de CSP, X-Frame-Options, y ocultamiento de tecnología.
- **Resultado Obtenido**: Falta CSP y X-Frame-Options; Express retorna `X-Powered-By: Express`.
- **Remediación**: Incorporar middleware `helmet` en backend y configurar headers en `vercel.json`.

---

### BUG-010
- **Título**: 13 Vulnerabilidades de Severidad Moderada en Dependencias
- **Severidad**: **BAJA** | **Categoría**: Mantenimiento / DevOps
- **Entorno**: Monorepo (`package.json`)
- **Pasos para Reproducir**:
  1. Ejecutar `npm audit`.
- **Resultado Esperado**: 0 vulnerabilidades.
- **Resultado Obtenido**: 13 vulnerabilidades en paquetes transitivos `qs` y `uuid`.
- **Remediación**: Ejecutar `npm audit fix` para actualizar versiones compatibles de dependencias.

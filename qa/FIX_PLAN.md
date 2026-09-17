# PLAN DE REMEDIACIÓN POR FASES (FIX_PLAN.MD) — AI MONEY

> **Estrategia de Solución Basada en Prioridad y Severidad**  
> **Objetivo**: Llevar el sistema al 100% de calidad, estabilidad funcional, accesibilidad WCAG 2.2 AA y seguridad.  

---

## Fase 0: Sincronización y Despliegue en Producción (Inmediato — P0)
- **Objetivo**: Poner en producción las correcciones funcionales ya probadas en local.
- **Acciones**:
  1. Verificar que `git status` y `npm run build` compilan sin errores de TypeScript (confirmado con hash `index-06170445d56ee13a4e9d2aa5bab6776e.js`).
  2. Hacer push a la rama `main` de GitHub (`https://github.com/mcorname/gastosapp.git`).
  3. Desencadenar el redeploy en Vercel para reemplazar el commit antiguo `9508657`.
  4. **Verificación**: Re-ejecutar `qa/test_functional_v3.mjs` confirmando que los casos TC-18 y TC-19 pasen a estado **PASS**.

---

## Fase 1: Remediación de Desbordamiento Responsive (P1)
- **Objetivo**: Erradicar el 100% del desbordamiento horizontal en móviles y tablets.
- **Acciones**:
  1. En `apps/mobile/src/components/TopHeader.tsx`:
     - Agregar media queries / breakpoints para pantallas `< 640px`.
     - Reemplazar el input de búsqueda de ancho fijo (`width: 290px`) por un icono táctil expandible.
     - Ocultar el chip de perfil avatar redundante en móvil.
  2. En el layout de tablet horizontal (1024px):
     - Aplicar `flexShrink: 1` y `minWidth: 0` al contenedor principal para evitar el desborde de 132px.
  3. **Verificación**: Re-ejecutar `qa/test_responsive.mjs` asegurando que los 13 viewports alcancen estado **PASS** (`0 px overflow`).

---

## Fase 2: Robustecimiento de Seguridad y Redes (P1)
- **Objetivo**: Eliminar riesgos OWASP y fallos de contenido mixto.
- **Acciones**:
  1. En `apps/backend/src/index.ts`:
     - Instalar e integrar `helmet` para eliminar `X-Powered-By` y añadir cabeceras defensivas.
     - Configurar `cors` con lista blanca estricta (dominios Vercel y localhost de desarrollo).
  2. En `apps/mobile/src/components/DenisChatModal.tsx`:
     - Reemplazar la URL hardcodeada `http://localhost:3001` por una variable de entorno configurable con fallback seguro.
  3. En `vercel.json`:
     - Añadir cabeceras de seguridad HTTP (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`).
  4. **Verificación**: Re-ejecutar `qa/test_security_api.mjs`.

---

## Fase 3: Accesibilidad WCAG 2.2 AA (P2)
- **Objetivo**: Subsanar las 40 violaciones de contraste y estructuración semántica.
- **Acciones**:
  1. Actualizar la paleta tipográfica en los temas:
     - Textos secundarios grises: cambiar `#979792` por `#5C5C58` (ratio > 4.5:1).
     - Textos e indicadores verdes: cambiar `#0EA876` por `#097B55` (ratio > 4.5:1).
     - Textos de gastos naranjas: cambiar `#FF643D` por `#D9451C` (ratio > 4.5:1).
  2. Agregar roles semánticos (`accessibilityRole="main"`, `accessibilityRole="header"`) en `App.tsx` y encabezados `<h1>`.
  3. Aumentar el área táctil mínima de los botones de ordenación a 24x24px.
  4. **Verificación**: Re-ejecutar `qa/test_accessibility.mjs` con 0 violaciones graves.

---

## Fase 4: Consistencia de UX, Marca y Localización (P2)
- **Objetivo**: Armonizar la experiencia del usuario.
- **Acciones**:
  1. Renombrar las referencias internas de "Denis" a "Mario IA" en `DenisChatModal.tsx` y mensajes de respuesta.
  2. Cambiar los símbolos de moneda hardcodeados de `$` a `S/` (Soles peruanos).
  3. **Verificación**: Validación visual y funcional en diálogo del chat.

---

## Fase 5: Mantenimiento de Dependencias y Pruebas Continuas (P3)
- **Objetivo**: Garantizar sostenibilidad a largo plazo.
- **Acciones**:
  1. Ejecutar `npm audit fix` para mitigar vulnerabilidades en `qs`.
  2. Instalar Vitest en `@ai-money/shared` e implementar tests unitarios para validación y cálculos.
  3. Integrar workflow de GitHub Actions para ejecutar `playwright` y `npm run build` en cada commit.

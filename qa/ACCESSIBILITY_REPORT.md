# INFORME DE ACCESIBILIDAD DIGITAL (WCAG 2.2 AA) — AI MONEY

> **Estándar de Evaluación**: Web Content Accessibility Guidelines (WCAG) 2.2 Nivel AA  
> **Motor de Escaneo**: Axe-Core 4.13.0 vía Playwright  
> **Ámbito**: Vistas Desktop (1280x800) y Móvil (390x844), Modales y Pestañas de Navegación  

---

## 1. Resumen de Violaciones por Pantalla

| Vista Auditada | Violaciones Críticas | Violaciones Serias | Violaciones Moderadas | Total Violaciones | Nodos Afectados |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Dashboard / Home (Desktop)** | 0 | 3 (`color-contrast`, `nested-interactive`, `target-size`) | 3 (`landmark-one-main`, `page-has-heading-one`, `region`) | **6** | 119 |
| **Movimientos Tab** | 0 | 1 (`color-contrast`) | 3 (`landmark-one-main`, `page-has-heading-one`, `region`) | **4** | 7 |
| **Cuentas Tab** | 0 | 1 (`color-contrast`) | 3 (`landmark-one-main`, `page-has-heading-one`, `region`) | **4** | 16 |
| **Ajustes Tab** | 0 | 1 (`color-contrast`) | 3 (`landmark-one-main`, `page-has-heading-one`, `region`) | **4** | 18 |
| **Dashboard / Home (Móvil)** | 0 | 3 (`color-contrast`, `nested-interactive`, `target-size`) | 3 (`landmark-one-main`, `page-has-heading-one`, `region`) | **6** | 92 |

---

## 2. Detalle de Reglas Infringidas y Nodos Afectados

### 2.1 Regla `color-contrast` (Impacto: SERIO) — WCAG 1.4.3
- **Descripción**: Los elementos de texto y contenido esencial deben satisfacer una relación de contraste mínima de 4.5:1 para texto normal y 3:1 para texto grande.
- **Evidencias Empíricas Detectadas**:
  1. **Etiquetas de Encabezado de Métricas ("PATRIMONIO TOTAL", "INGRESOS", "BALANCE DEL MES")**:
     - *Color Texto*: `#979792` (Gris claro)
     - *Color Fondo*: `#FFFFFF` / `#FAFAF8`
     - *Contraste Obtenido*: **2.93:1** (Falla; umbral requerido: 4.5:1)
  2. **Monto de Ingresos ("S/ 5,000.00")**:
     - *Color Texto*: `#0EA876` (Verde esmeralda claro)
     - *Color Fondo*: `#FAFAF8`
     - *Contraste Obtenido*: **2.92:1** (Falla; umbral requerido: 3:1)
  3. **Etiqueta y Monto de Gastos ("GASTOS DEL MES", "S/ 1,892.17")**:
     - *Color Texto*: `#FF643D` (Naranja coral)
     - *Color Fondo*: `#FFF7F5` (Melocotón ultra claro)
     - *Contraste Obtenido*: **2.78:1** (Falla; umbral requerido: 3:1 / 4.5:1)
  4. **Píldora / Badge de Crecimiento ("+62%")**:
     - *Color Texto*: `#0EA876`
     - *Color Fondo*: `#E6F7F1`
     - *Contraste Obtenido*: **2.75:1** (Falla; umbral requerido: 4.5:1)
  5. **Botón de Acción Rápida ("Nuevo gasto")**:
     - *Color Texto*: `#FFFFFF`
     - *Color Fondo*: `#0EA876`
     - *Contraste Obtenido*: **3.05:1** (Falla; umbral requerido: 4.5:1)
- **Solución Recomendada**:
  - Ajustar el gris secundario a `#6E6E69` o `#5C5C58` (brinda 5.2:1 de contraste sobre blanco).
  - Oscurecer el verde financiero a `#097B55` (brinda 4.6:1 sobre blanco y fondo claro).
  - Oscurecer el naranja de gastos a `#D9451C` (brinda 4.7:1 sobre blanco).

### 2.2 Regla `nested-interactive` (Impacto: SERIO) — WCAG 4.1.2
- **Descripción**: Los elementos interactivos no deben anidarse dentro de otros elementos interactivos (genera comportamientos impredecibles en lectores de pantalla y foco por teclado).
- **Evidencia Empírica Detectada**:
  - Tarjetas de resumen del dashboard donde el contenedor principal posee un evento `onClick` / `role="button"` y a su vez contiene botones hijos de acción secundaria.
- **Solución Recomendada**:
  - Separar la superficie de clic o utilizar enlaces semánticos con `aria-label` sin envolver botones hijos.

### 2.3 Regla `target-size` (Impacto: SERIO) — WCAG 2.5.8
- **Descripción**: Todo control táctil debe medir al menos 24x24px o contar con suficiente espaciado circundante.
- **Evidencia Empírica Detectada**:
  - Iconos de ordenación en las columnas de transacciones y botones de visualización rápida con área activa efectiva menor a 22x22px.
- **Solución Recomendada**:
  - Incrementar el `hitSlop` o `padding` a un mínimo de 8px por lado para garantizar un área táctil de 32x32px.

### 2.4 Reglas Estructurales y de Landmark (Impacto: MODERADO)
- **`landmark-one-main` / `region`**:
  - El DOM generado por React Native for Web utiliza `div` anidados sin roles semánticos (`role="main"`, `role="navigation"`, `role="banner"`).
- **`page-has-heading-one`**:
  - La aplicación carece de una etiqueta semántica `<h1>` con el título del dashboard ("AI Money — Panel Financiero"), impidiendo la navegación accesible de usuarios con lectores de pantalla como NVDA o TalkBack.
- **Solución Recomendada**:
  - Agregar `accessibilityRole="header"` y `accessibilityRole="main"` a los contenedores principales de `App.tsx`.

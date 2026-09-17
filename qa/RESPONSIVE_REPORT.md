# INFORME DE PRUEBAS RESPONSIVE — AI MONEY

> **Auditoría Multi-Dispositivo**: 13 Viewports Estándar de Mercado  
> **Motor de Evaluación**: Playwright Chromium Headless  
> **Criterio de Aceptación**: Cero desbordamiento horizontal (`scrollWidth <= clientWidth`), visualización íntegra de controles táctiles, ausencia de solapamientos tipográficos.  

---

## 1. Tabla Resumen de Resultados por Viewport

| Dispositivo / Categoría | Resolución | Ancho Real | Ancho Scroll | Desbordamiento | Estado | Captura de Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **iPhone SE (1ª Gen)** | 320 x 568 | 320 px | 523 px | **+203 px** | **FAIL_OVERFLOW** | `qa/screenshots/vp_iphone_se_1st_320x568.png` |
| **Android Común** | 360 x 800 | 360 px | 523 px | **+163 px** | **FAIL_OVERFLOW** | `qa/screenshots/vp_android_common_360x800.png` |
| **iPhone SE (2ª/3ª Gen)** | 375 x 667 | 375 px | 523 px | **+148 px** | **FAIL_OVERFLOW** | `qa/screenshots/vp_iphone_se_2nd_375x667.png` |
| **iPhone 12 / 13 / 14** | 390 x 844 | 390 px | 523 px | **+133 px** | **FAIL_OVERFLOW** | `qa/screenshots/vp_iphone_12_14_390x844.png` |
| **Pixel 7 / Galaxy S20+** | 412 x 915 | 412 px | 523 px | **+111 px** | **FAIL_OVERFLOW** | `qa/screenshots/vp_pixel_7_412x915.png` |
| **iPhone 15 Pro Max** | 430 x 932 | 430 px | 523 px | **+93 px** | **FAIL_OVERFLOW** | `qa/screenshots/vp_iphone_15_pro_max_430x932.png` |
| **iPad Mini (Retrato)** | 768 x 1024 | 768 px | 768 px | **0 px** | **PASS** | `qa/screenshots/vp_ipad_mini_portrait_768x1024.png` |
| **iPad Air (Retrato)** | 820 x 1180 | 820 px | 820 px | **0 px** | **PASS** | `qa/screenshots/vp_ipad_air_portrait_820x1180.png` |
| **iPad (Paisaje)** | 1024 x 768 | 1024 px | 1156 px | **+132 px** | **FAIL_OVERFLOW** | `qa/screenshots/vp_ipad_landscape_1024x768.png` |
| **Laptop HD** | 1280 x 720 | 1280 px | 1280 px | **0 px** | **PASS** | `qa/screenshots/vp_laptop_hd_1280x720.png` |
| **Laptop Común** | 1366 x 768 | 1366 px | 1366 px | **0 px** | **PASS** | `qa/screenshots/vp_laptop_common_1366x768.png` |
| **MacBook Air 13"** | 1440 x 900 | 1440 px | 1440 px | **0 px** | **PASS** | `qa/screenshots/vp_macbook_air_1440x900.png` |
| **Desktop Full HD** | 1920 x 1080 | 1920 px | 1920 px | **0 px** | **PASS** | `qa/screenshots/vp_desktop_fhd_1920x1080.png` |

---

## 2. Hallazgos Críticos y Análisis de Causa Raíz

### 2.1 Desbordamiento Horizontal en Smartphones (320px a 430px)
- **Monto de Desbordamiento**: Desde +93px en pantallas grandes de teléfono hasta +203px en pantallas pequeñas de 320px.
- **Elemento Causante**:
  - Encabezado superior (`TopHeader.tsx`).
  - El contenedor de búsqueda rápida (`width: 290px` fijo) ubicado a partir de `x: 159px` se extiende hasta `x: 449px`.
  - A su derecha, el botón de perfil de usuario (`M Mario`, `width: 60px`) se posiciona en `x: 463px` y finaliza en `x: 523px`.
  - En cualquier dispositivo con pantalla menor a 523px de ancho, el navegador crea una barra de desplazamiento horizontal no deseada, rompiendo la experiencia móvil.
- **Acción Correctiva Recomendada**:
  - En anchos `< 640px`: ocultar el input de texto de búsqueda expandido y reemplazarlo por un botón icono de lupa que despliegue un modal o barra de búsqueda colapsable.
  - Ocultar el chip de perfil "M" en el header móvil, dado que la barra inferior (`BottomNav`) ya incluye navegación a Ajustes.

### 2.2 Desbordamiento en Tablet Paisaje (1024 x 768)
- **Monto de Desbordamiento**: +132px (`scrollWidth: 1156px` vs `clientWidth: 1024px`).
- **Elemento Causante**:
  - A partir de 1024px de ancho, la aplicación activa el diseño de escritorio con `Sidebar` visible (~240px de ancho).
  - El contenedor principal de contenido (`flex: 1`) contiene el header superior con elementos que carecen de `flex-shrink: 1` o `minWidth: 0`.
  - La suma del ancho del Sidebar + ancho mínimo del contenido + elementos fijos del TopHeader da exactamente 1156px.
- **Acción Correctiva Recomendada**:
  - Añadir `flexShrink: 1` y `minWidth: 0` al contenedor del TopHeader.
  - Permitir que la barra de búsqueda en pantallas de 1024px reduzca su ancho proporcionalmente (`maxWidth: 220px`).

### 2.3 Visualización y Ergonomía de Navegación
- En vista móvil (<= 430px), la barra de navegación inferior (`BottomNav`) es visible y funcional con accesos directos táctiles a *Inicio*, *Movimientos*, *Cuentas*, *Análisis* y *Ajustes*.
- En tablets en orientación vertical (768px y 820px), la aplicación se adapta limpiamente sin desbordamientos horizontales.

# INFORME DE PERFORMANCE Y CORE WEB VITALS — AI MONEY

> **Entorno**: Vercel Edge Network (`https://backend-gold-omega-57.vercel.app/`)  
> **Metodología**: 3 Ejecuciones Automatizadas vía Playwright CDP Session y Navigation Timing API  
> **Fecha de Muestreo**: 17 de Septiembre, 2026  

---

## 1. Métricas Clave y Tiempos de Carga (Promedio de 3 Ejecuciones)

| Indicador | Muestra #1 | Muestra #2 | Muestra #3 | Promedio Final | Calificación / Umbral |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **TTFB (Time to First Byte)** | 85 ms | 83 ms | 84 ms | **84 ms** | **EXCELENTE** (< 200 ms) |
| **FCP (First Contentful Paint)** | 704 ms | 592 ms | 584 ms | **626 ms** | **BUENO** (< 1.8 s) |
| **DOMContentLoaded** | 634 ms | 518 ms | 510 ms | **554 ms** | **BUENO** (< 1.5 s) |
| **Tiempo de Carga Completa** | 1,280 ms | 1,140 ms | 1,110 ms | **1,176 ms** | **BUENO** (< 2.5 s) |
| **Nodos en el DOM** | 320 | 320 | 320 | **320 nodos** | **ÓPTIMO** (< 1,500) |
| **Profundidad Máxima DOM** | 15 niveles | 15 niveles | 15 niveles | **15 niveles** | **ACEPTABLE** (< 32) |
| **Memoria JS Heap en Uso** | 18.2 MB | 18.5 MB | 18.7 MB | **18.5 MB** | **LIGERO** (< 50 MB) |

---

## 2. Auditoría de Recursos y Peso de Bundles

### 2.1 Desglose de Transferencia de Red
- **Bundle Principal JavaScript**:
  - *Transferido por Red (Gzip/Brotli)*: **300.8 KB**
  - *Descomprimido en Memoria*: **1,063,962 bytes (~1.06 MB)**
  - *Módulos Metro compilados*: 290 módulos.
- **Hojas de Estilo CSS**: **0 KB** (React Native for Web compila estilos atómicos directamente en el runtime JS).
- **Tipografías e Iconos**:
  - `@expo/vector-icons` empaqueta fuentes TTF para MaterialIcons, Ionicons, FontAwesome (hasta 19 archivos de fuentes). Metro realiza carga perezosa bajo demanda.
- **HTML Estático de Arranque**: **1.2 KB** (Documento SPA shell).

---

## 3. Diagnóstico de Eficiencia y Oportunidades de Optimización

1. **Monolito de Código JavaScript (Sin Code-Splitting)**:
   - Todo el código de la aplicación (Dashboard, Tablas, Cuentas, Modales de Ajuste, Gráficos SVG y Asistente IA) se entrega en un único archivo JavaScript (`index-xxx.js`).
   - *Recomendación*: Para escalar a futuro, implementar carga diferida (`React.lazy` / dynamic imports) para modales pesados como `DenisChatModal` y gráficos de análisis.
2. **Carga de Fuentes de Iconos**:
   - Actualmente se incluyen paquetes completos de vector icons.
   - *Recomendación*: Extraer únicamente los glifos SVG requeridos o utilizar icon sets optimizados para reducir el peso estático en la exportación web.
3. **Eficiencia en Runtime**:
   - Excelente comportamiento en memoria (~18.5 MB) gracias al motor local-first síncrono.
   - La persistencia en `localStorage` añade latencia prácticamente nula (< 2ms por transacción).

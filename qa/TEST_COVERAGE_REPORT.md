# INFORME DE COBERTURA DE PRUEBAS (TEST COVERAGE) — AI MONEY

> **Auditoría de Aseguramiento de Calidad (QA)**  
> **Fecha**: 17 de Septiembre, 2026  

---

## 1. Diagnóstico de Cobertura Inicial (Línea Base)

Antes de esta auditoría, el estado de pruebas automatizadas del proyecto era el siguiente:

| Nivel de Prueba | Herramienta Configurada | Archivos de Prueba Existentes | Cobertura Estimada | Estado |
| :--- | :--- | :---: | :---: | :---: |
| **Pruebas Unitarias** | Ninguna (Sin Jest/Vitest) | 0 | **0.0%** | **CRÍTICO** |
| **Pruebas de Integración** | Script manual Node (`test-backend.mjs`) | 1 | **< 5.0%** | **DEFICIENTE** |
| **Pruebas E2E (End-to-End)**| Ninguna | 0 | **0.0%** | **CRÍTICO** |
| **Pruebas de Accesibilidad**| Ninguna | 0 | **0.0%** | **INEXISTENTE** |
| **Pruebas Responsive** | Ninguna | 0 | **0.0%** | **INEXISTENTE** |

---

## 2. Cobertura de Pruebas Automatizadas Implementada en esta Auditoría (`qa/`)

Para ejecutar esta auditoría basada en evidencias empíricas sin alterar el código fuente de la aplicación, se construyó una suite completa de automatización con Playwright y Axe-Core:

| Script de Prueba | Objetivo | Casos / Puntos Evaluados | Cobertura Lograda |
| :--- | :--- | :---: | :---: |
| `qa/test_functional_v3.mjs` | Pruebas funcionales E2E en producción | 19 casos de prueba | 100% de flujos principales del dashboard |
| `qa/test_responsive.mjs` | Auditoría responsive y desbordamientos | 13 viewports móviles y desktop | 100% de resoluciones estándar de mercado |
| `qa/test_accessibility.mjs` | Auditoría de accesibilidad WCAG 2.2 AA | 5 vistas completas con Axe-Core | 100% de pantallas y modales principales |
| `qa/test_performance.mjs` | Métricas de rendimiento y Web Vitals | 3 corridas con CDP y Navigation Timing | Carga inicial, TTFB, FCP, consumo de memoria |
| `qa/test_security_api.mjs` | Seguridad OWASP, CORS y endpoints API | 9 endpoints, escaneo de secretos en bundle | Endpoints Express, cabeceras y bundle JS |

---

## 3. Plan para Alcanzar 80%+ de Cobertura Continua

1. **Configurar Vitest en `@ai-money/shared`**:
   - Pruebas unitarias para formateadores numéricos, funciones de cálculo de saldo, motor de ledger financiero y validaciones con Zod.
2. **Configurar React Native Testing Library en `apps/mobile`**:
   - Pruebas unitarias de componentes para `StatCards`, `SummaryCard`, `TransactionsList` y formularios.
3. **Integración en GitHub Actions (CI)**:
   - Pipeline automatizado que ejecute `npm run build`, `vitest run` y `playwright test` en cada Pull Request.

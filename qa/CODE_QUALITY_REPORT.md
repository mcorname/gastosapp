# INFORME DE CALIDAD DE CÓDIGO Y ANÁLISIS ESTÁTICO — AI MONEY

> **Herramientas**: TypeScript Compiler (`tsc 5.5.4`), NPM Audit, Análisis Estático de Dependencias  
> **Fecha**: 17 de Septiembre, 2026  

---

## 1. Estado de Compilación y Tipado TypeScript

| Paquete / Espacio de Trabajo | Comando Evaluado | Errores de Tipado | Advertencias | Estado |
| :--- | :--- | :---: | :---: | :---: |
| `packages/shared` | `tsc --build` | **0** | 0 | **PASS** |
| `apps/backend` | `tsc` | **0** | 0 | **PASS** |
| `apps/mobile` | `npx tsc --noEmit` | **0** | 0 | **PASS** |
| **Producción Global** | `npm run build` | **0** | 0 | **PASS** |

---

## 2. Inconsistencias de Nomenclatura y Deuda Técnica

### 2.1 Inconsistencia de Identidad de Marca: "Mario" vs "Denis"
- **Descripción**: En la interfaz de usuario, el botón flotante y accesos principales refieren a "Pregúntale a Mario" o "Asistente IA". Sin embargo, en el código fuente:
  - Archivo del componente: `DenisChatModal.tsx`.
  - Endpoint en Backend: `/api/ai/chat-denis`.
  - Textos de fallback generados por la IA en el cliente: `"Resumen rápido de Denis: Tienes..."`.
- **Riesgo**: Confusión para el usuario final sobre la identidad del asistente financiero y fragmentación del código.
- **Acción**: Estandarizar la nomenclatura a nivel de componente y respuesta según la definición de producto ("Mario IA").

### 2.2 Símbolo de Moneda Hardcodeado en el Asistente Local
- **Ubicación**: `apps/mobile/src/components/DenisChatModal.tsx:93, 100, 105`.
- **Problema**: El asistente local responde con el símbolo de dólar:
  ```typescript
  replyText = `Tu mayor gasto este mes es en "${top.name}" con un total de $${top.total.toLocaleString()}...`;
  ```
  mientras que la cuenta y transacciones de Mario están en Soles peruanos (`S/`).
- **Acción**: Inyectar el símbolo de moneda dinámico (`userCurrency` o `S/`) en los templates de respuesta local.

### 2.3 Ausencia de Linters y Formateadores Unificados
- El repositorio carece de configuración unificada de ESLint y Prettier a nivel de monorepo.
- Se recomienda agregar un archivo `.eslintrc.js` y script `npm run lint` en la raíz.

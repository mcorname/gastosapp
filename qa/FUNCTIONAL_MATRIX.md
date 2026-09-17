# MATRIZ DE PRUEBAS FUNCIONALES — AI MONEY

> **Entorno**: Producción (`https://backend-gold-omega-57.vercel.app/`)  
> **Herramienta de Automatización**: Playwright 1.63.0 / Chromium Headless  
> **Resultado Global**: 19 Casos Ejecutados | **17 PASS (89.5%)** | **2 FAIL (10.5%)**  

---

## 1. Resumen Ejecutivo de Pruebas Funcionales

| ID Caso | Módulo | Funcionalidad Evaluada | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Arranque | Carga inicial del SPA | URL base Vercel | HTTP 200, render sin pantallazo blanco ni errores fatales de consola | Render completo en 1.8s, 0 errores en consola | **PASS** |
| **TC-02** | Datos | Integridad de saldos de Mario | Carga de `localStorage` | Patrimonio S/ 22,931.32, BCP S/ 20,431.32, Sueldo S/ 5,000 | Valores numéricos y formateo coinciden exactamente | **PASS** |
| **TC-03** | Navegación | Tab Movimientos | Clic en tab "Movimientos" | Despliegue de tabla de transacciones | Tabla y filtros de movimientos visibles | **PASS** |
| **TC-04** | Navegación | Tab Cuentas | Clic en tab "Cuentas" | Despliegue de tarjetas de cuenta (BCP, Efectivo) | Vista de cuentas renderizada con métricas | **PASS** |
| **TC-05** | Navegación | Tab Análisis | Clic en tab "Análisis" | Gráficas de tendencias y desglose | Gráficas interactivas y métricas visibles | **PASS** |
| **TC-06** | Navegación | Tab Ajustes | Clic en tab "Ajustes" | Panel de configuración de usuario | Opciones de tema, moneda y sistema visibles | **PASS** |
| **TC-07** | Navegación | Tab Inicio | Clic en tab "Inicio" | Retorno al Dashboard principal | Dashboard restaurado con métricas principales | **PASS** |
| **TC-08** | Filtros | Selector de Mes | Selección de "Ago" / "Jul" | Recálculo dinámico de métricas del mes seleccionado | Balance y transacciones filtradas por periodo | **PASS** |
| **TC-09** | Búsqueda | Búsqueda de transacciones | Término "WIN" | Filtrar lista mostrando únicamente transacción WIN INTERNET | Lista filtrada mostrando solo registro de WIN (S/ 109.00) | **PASS** |
| **TC-10** | Tabla | Ordenación de columnas | Clic cabecera "Monto" | Alternar orden ascendente / descendente | Registros reordenados inmediatamente | **PASS** |
| **TC-11** | Transacciones| Apertura modal nuevo registro | Clic en botón "+ Nuevo" | Despliegue modal con formulario | Modal desplegado con campos de fecha, monto, cuenta | **PASS** |
| **TC-12** | Validación | Envío de formulario vacío | Clic "Guardar" sin llenar datos | Alerta o mensajes de validación requerida | Validación activa, no permite envío incompleto | **PASS** |
| **TC-13** | Transacciones| Cancelación de nuevo registro | Clic en botón "Cancelar" | Cierre del modal y retorno al estado previo | Modal desmontado limpiamente sin efectos secundarios | **PASS** |
| **TC-14** | Asistente IA | Apertura diálogo Mario IA | Clic en "Pregúntale a Mario" | Apertura del modal de chat conversacional | Modal de chat abierto con saludo inicial | **PASS** |
| **TC-15** | Asistente IA | Preguntas predefinidas | Clic en "¿En qué he gastado más?" | Generación de respuesta con contexto financiero real | Respuesta contextual con desglose por categoría | **PASS** |
| **TC-16** | Privacidad | Ocultar saldos sensibles | Clic en botón `••••••••` | Enmascaramiento de montos en toda la interfaz | Números reemplazados por puntos de privacidad | **PASS** |
| **TC-17** | Persistencia | Recarga de página (F5) | `page.reload()` | Conservación íntegra de saldos y registros | Estado idéntico persistido en `localStorage` | **PASS** |
| **TC-18** | Dashboard | Modal Desglose de Activos | Clic en tarjeta "Patrimonio Total" | Apertura de modal con desglose por institución | **No abre modal en Vercel** (Bundle desactualizado) | **FAIL** |
| **TC-19** | Cuentas | Modal Cuadre de Caja | Clic en "Ajustar saldo" | Apertura de modal de ajuste directo de saldo | **No abre modal en Vercel** (Bundle desactualizado) | **FAIL** |

---

## 2. Diagnóstico Técnico de Fallos Funcionales

### Fallo TC-18 & TC-19: Inactividad de Modales en Despliegue de Producción
- **Comportamiento Observado**: Al pulsar sobre la tarjeta de *Patrimonio Total* o sobre el botón *Ajustar saldo* en la pestaña de Cuentas en `https://backend-gold-omega-57.vercel.app/`, no se produce ninguna acción visible ni apertura de modal.
- **Causa Raíz Determinada**:
  - Inspección del bundle JS servido por Vercel (`index-c1d7d6d9cd5f1fc794c1c7bb37883462.js`).
  - Dicho bundle corresponde al commit histórico `9508657`, el cual carecía de los manejadores `setShowNetWorth(true)` y `setShowBalanceAdjust(true)`.
  - Los commits locales posteriores (`c1751ca` y `22a8648`), que incorporaron y conectaron los componentes `NetWorthBreakdownModal` y `BalanceAdjustmentModal`, no fueron desplegados con éxito en Vercel debido a un error previo de compilación TypeScript en `aiService.ts`.
  - Una vez subsanado dicho error tipográfico en local (`npm run build` compilando con hash `index-06170445d56ee13a4e9d2aa5bab6776e.js`), se evidencia que el código fuente ya posee la funcionalidad completa y sólo requiere sincronización de despliegue hacia Vercel.

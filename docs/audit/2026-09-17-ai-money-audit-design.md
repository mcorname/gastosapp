# AI Money — Auditoría y diseño de corrección

Fecha: 2026-09-17. Estado: inspección de código y comprobaciones iniciales; implementación pendiente.

## Arquitectura comprobada

Monorepo npm con apps/mobile (React Native 0.86.3, React 19.2.3, Expo ~57.0.20), apps/backend (Express y TypeScript) y packages/shared (tipos y Zod). App.tsx controla vistas con estado local; no existe router de cliente. FinanceContext carga repositorios y expone cuentas, categorías, movimientos y estadísticas. No hay hooks de negocio separados ni autenticación implementada.

Persistencia nativa: expo-sqlite, aimoney.db, tablas accounts, categories, transactions y budgets. Persistencia web: adaptador manual de SQL sobre objetos y localStorage, clave ai_money_web_db_v4. No es SQLite en web. Deudas y bolsillos existen como tipos, pero no como tablas ni flujos implementados. No existe conexión efectiva a Supabase.

API: /health, /api/ai/extract-text, /api/ai/chat-denis, /api/whatsapp/*, /api/sync/* y /api/shortcuts/ingest. Cliente con URLs localhost:3001 repetidas. WhatsApp utiliza mapas en memoria; no hay consumidor móvil de su cola. Sync devuelve resultados simulados. IA utiliza reglas y respuestas predefinidas incluso con credenciales configuradas. Recibos devuelve datos ficticios.

## Mapa funcional

| Área | Encontrado | Trabajo requerido |
|---|---|---|
| Patrimonio | Suma currentBalance de cuentas; no se edita directamente | Derivar saldos del libro de movimientos; detalle, información, fecha y conteo; evitar mezclar monedas |
| Cuentas | Listado y repositorio de creación/borrado lógico | Gestión, detalle, edición, ajustes trazables, transferencias y protección al borrar |
| Nuevo movimiento | Formulario real de gasto e ingreso | Transferencia, edición, validación estricta y errores visibles |
| Historial | Orden fecha descendente, filtros tipo/mes y búsqueda parcial | Eliminar límite silencioso de 100; cuenta/categoría/fechas/orden; detalle y búsqueda de monto |
| Buscador | Actualiza estado compartido; Home no muestra los resultados filtrados | Debounce, resultados y apertura de detalle; acceso móvil |
| Mes | Flechas y botones ejecutan cambios | Botones y formularios limitados a junio-septiembre 2026; generar períodos desde datos |
| Resumen | SUM ingresos/gastos, excluye transferencias | Conservar fórmula; moneda y privacidad coherentes |
| Categorías | Agrupación de gastos y porcentajes; top 5 | Ver todas sin evento; análisis completo y estado vacío |
| Recientes | Movimientos reales del mes, máximo 5; Ver todas navega | Conservar período y limpiar filtros incompatibles |
| Papelera | Borra inmediatamente | Confirmación, reversión correcta e idempotencia |
| Ojo | Oculta únicamente patrimonio; estado volátil | Preferencia persistente y ocultación transversal, incluido chat |
| Mario | Chat modal y widget con consultas sugeridas que sí envían | Widget breve; servicio único; errores/reintento; Enter/Shift+Enter; contexto actualizado |
| Registrar con IA | Extracción y confirmación previa existen | Parser monetario correcto, cuenta real, edición de vista previa y validación; no inventar montos |
| Campana/perfil | Touchables sin handlers | Quitar campana; perfil local y preferencias reales, sin inventar sesión |
| Ajustes | OTP y texto de almacenamiento | Secciones útiles, estado real de integraciones y persistencia |
| Diseño | Tokens Light/macOS y layouts desde 1024px | Conservar identidad; revisar tamaños y textos en 7 anchos |

## Defectos prioritarios y evidencia

1. database.web.ts trata cualquier UPDATE accounts SET current_balance como suma. seedData.ts emite restas: los gastos de ejemplo aumentan el saldo en web.
2. TransactionRepository.delete no excluye deleted_at: repetir borrado revierte el importe otra vez.
3. TransactionRepository.create trata cualquier tipo distinto de income como gasto en la cuenta origen y nunca acredita destino. El tipo transfer existe, pero su flujo no está implementado.
4. WebDatabase.withTransactionSync solo llama al callback: no hay rollback ni escritura atómica. Los fallos de localStorage solo generan warnings; la UI puede presentar cambios no persistidos como guardados.
5. initDatabase ejecuta seedRecurringExpenses al iniciar; FinanceContext vuelve a inicializar al cambiar mes. Un ejemplo borrado puede reaparecer. Conservar registros ya guardados; dejar de sembrar movimientos automáticamente.
6. initial_balance y current_balance se guardan simultáneamente; faltan reconciliación y validación de integridad. No hay comprobación central de referencias, categoría por tipo, fecha real ni monto finito.
7. NewTransactionModal elimina caracteres antes de parsear: un monto negativo puede convertirse en positivo; fechas imposibles pueden normalizarse o sustituirse por hoy silenciosamente.
8. QuickAIModal inventa monto 20 cuando no detecta monto, elige siempre primera cuenta y puede interpretar pago como ingreso. Tanto cliente como backend eliminan puntos decimales; el backend puede truncar números de cuatro cifras sin separador.
9. App.tsx muestra fecha fija y +12% fijo. MonthSelector, NewTransactionModal, QuickAIModal y aiService tienen períodos de 2026 incrustados.
10. handleGeneratePairingCode inventa OTP si falla la API y usa demo-user-123. Sync push dice aplicar datos sin guardarlos; pull siempre devuelve listas vacías.
11. Sin autenticación ni validación de firma del webhook. Cola WhatsApp se elimina al consultar, antes de confirmar persistencia en cliente. Integración no lista para uso real.
12. DenisChatModal duplica MarioChatModal y no está importado por App.tsx. Lógica de chat/parser/fechas duplicada; README describe capacidades superiores a lo implementado.
13. Importes agregados se etiquetan PEN aunque los modelos permiten otras monedas. formatMoney omite .00 en enteros.
14. Riesgo responsive por fecha, importe y papelera en una sola fila y grupos sin adaptación suficiente. Necesita verificación visual, todavía no ejecutada.

## Diseño recomendado

Conservar Expo, React Native, Express, repositorios, FinanceContext y tokens. Corregir de forma incremental por capas, sin reemplazar la aplicación.

### 1. Datos e integridad

Libro de movimientos como fuente de verdad: saldo de cuenta = saldo inicial + ingresos - gastos - transferencias salientes + transferencias entrantes + ajustes firmados. Patrimonio y estadísticas se derivan; transferencias y ajustes no cuentan como ingresos/gastos. Cálculos monetarios en unidades menores para evitar acumulación de errores.

Añadir tipo adjustment y datos de trazabilidad saldo anterior/nuevo/diferencia. Persistir transferencia con destination_account_id y categoría opcional para operaciones sin categoría. Adaptar tablas existentes mediante migración versionada y respaldo previo; preservar IDs, saldos iniciales, operaciones y borrados. Conservar valores legacy para auditoría de diferencias; no inventar ajustes para ocultar errores previos. Implementar misma semántica de commit/rollback en web y SQLite, con fallo visible ante error de almacenamiento.

No eliminar cuentas con movimientos, incluidos destino de transferencias e historial borrado. Eliminar movimientos mediante confirmación y borrado lógico idempotente. Editar operaciones recalculando ambas cuentas cuando corresponda. Respaldo del código antes de cambios, ya que todos los archivos del proyecto aparecen sin seguimiento en git.

### 2. Flujos y navegación

Pantallas existentes más gestión/detalle de cuentas y análisis de categorías. Patrimonio abre desglose y enlace a gestión. Formulario compartido para crear/editar; transferencia exige origen distinto de destino, referencias válidas y monto positivo. Ajuste dedicado muestra diferencia antes de confirmar. Navegación web sincronizada con URL/historial, manteniendo comportamiento móvil.

Búsqueda global con debounce y resultados accionables. Filtros y orden derivados del mismo conjunto completo de movimientos; período compartido. Preferencia de privacidad persistente aplicada a toda superficie sensible. Formato común de moneda con dos decimales y fechas es-PE. Fecha de actualización real, sin afirmar hoy cuando no corresponde.

### 3. Monedas, perfil e integraciones

Permitir configurar moneda, sin sumar monedas diferentes como soles. Mostrar totales por moneda mientras no exista conversión explícita; bloquear transferencias entre monedas sin tipo de cambio. Proteger cambio de moneda de cuentas con historial para no reinterpretar importes existentes.

Perfil local editable y preferencias; sin cerrar sesión porque no existe autenticación. Retirar campana. Integraciones incompletas deshabilitadas con explicación; endpoints simulados no deben afirmar éxito. No incorporar un sistema nuevo de identidad o de sincronización como parte de una corrección de UI.

### 4. Mario y registro por texto

Widget con insight calculado y apertura de chat amplio. Un servicio compartido para respuestas sobre datos reales y parser de movimientos. Modo local identificado como análisis por reglas, sin presentarlo como conexión a un proveedor IA. Responder las tres preguntas sugeridas específicamente; manejar consulta no soportada honestamente. Registro por texto genera borrador editable y nunca guarda sin confirmación. No inventar categoría/cuenta/monto ante ambigüedad: solicitar selección en la vista previa. Mantener endpoints existentes para integración futura y mostrar errores/reintento de las llamadas asíncronas.

### Alternativas consideradas

- Solo conectar botones: menor trabajo inicial, pero conserva corrupción e inconsistencias financieras; descartado.
- Corregir capas existentes con un cálculo financiero común: recomendado; conserva arquitectura y permite validar por flujo.
- Reemplazar almacenamiento y navegación de raíz: mayor riesgo de migración y regresiones; innecesario para esta solicitud.

## Orden de ejecución y aceptación

1. Respaldo, pruebas que reproduzcan errores de saldo, borrado doble, parser y persistencia.
2. Motor financiero, validaciones, migraciones y adaptadores web/nativo.
3. Contexto, cuentas, ajustes, transferencias y creación/edición/borrado.
4. Historial, búsqueda, períodos, patrimonio, análisis y privacidad.
5. Mario, registro por texto, perfil, ajustes y retiro de controles engañosos.
6. Pruebas integradas y revisión responsive; informe de cambios y pendientes.

Matriz de aceptación: crear gasto e ingreso; transferir sin cambiar patrimonio ni resumen; editar importe/cuenta/tipo/fecha; borrar y repetir borrado; ajustar hacia arriba/abajo sin afectar ingresos/gastos; comprobar cuenta/patrimonio/resumen/categorías/historial tras cada operación. Probar persistencia tras recarga, rechazo de datos inválidos y fallo de almacenamiento. Buscar/filtrar/cambiar mes/abrir detalle; ocultar importes; consultas sugeridas; parsear los tres ejemplos pedidos, decimales y sueldo 3700; confirmar/cancelar borrador. Revisar 375, 390, 430, 768, 1024, 1280 y 1440px sin overflow y con textos legibles.

## Comprobaciones ejecutadas

- npx tsc --noEmit -p apps/mobile/tsconfig.json: pasa.
- npx tsc --noEmit -p apps/backend/tsconfig.json: pasa.
- node packages/shared/test-shared.mjs: pasa sobre dist existente.
- node apps/backend/test-backend.mjs: pasa sobre dist existente.

Los scripts existentes no validan los flujos financieros solicitados. No se ha recompilado dist ni realizado todavía pruebas funcionales en navegador/dispositivo. No se modificó código de aplicación, base de datos ni información financiera. Este documento es el único archivo añadido en esta fase.

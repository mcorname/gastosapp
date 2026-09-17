# INFORME DE PRUEBAS DE API Y SERVICIOS BACKEND — AI MONEY

> **Servicio Evaluado**: Backend Express (`apps/backend`)  
> **Host Local**: `http://localhost:3001`  
> **Fecha**: 17 de Septiembre, 2026  

---

## 1. Catálogo de Endpoints y Resultados de Pruebas

| Endpoint | Método | Payload de Entrada | Código HTTP | Tiempo Respuesta | Estado Funcional |
| :--- | :---: | :--- | :---: | :---: | :---: |
| `/health` | GET | Ninguno | **200 OK** | 36 ms | **OPERATIVO** |
| `/api/ai/extract-text` | POST | `{"text": "Almuerzo 25 soles en BCP"}` | **200 OK** | 42 ms | **OPERATIVO** |
| `/api/ai/extract-text` | POST | `{}` (Payload vacío inválido) | **400 Bad Request** | 12 ms | **VALIDADO (Zod)** |
| `/api/ai/chat-denis` | POST | `{"prompt": "¿Gasto mayor?", "financialContext": {...}}` | **200 OK** | 38 ms | **OPERATIVO** |
| `/api/ai/chat-denis` | POST | `{"prompt": ""}` (Falta contexto) | **400 Bad Request** | 8 ms | **VALIDADO (Zod)** |
| `/api/ai/extract-receipt`| POST | Archivo / Imagen multipart | **503 Unavailable** | 6 ms | **STUB / INACTIVO** |
| `/api/whatsapp/status` | GET | Ninguno | **503 Unavailable** | 5 ms | **STUB / INACTIVO** |
| `/api/sync/status` | GET | Ninguno | **501 Not Impl.** | 5 ms | **STUB / INACTIVO** |
| `/api/shortcuts` | POST | Payload de atajo SMS | **503 Unavailable** | 6 ms | **STUB / INACTIVO** |

---

## 2. Análisis Detallado de Respuestas y Comportamiento

### 2.1 Endpoint `/api/ai/extract-text`
- **Respuesta Obtenida**:
  ```json
  {
    "success": true,
    "mode": "local",
    "saved": false,
    "transaction": {
      "amount": 25,
      "type": "expense",
      "merchant": "Almuerzo 25 soles en restaurante chifa con BCP",
      "date": "2026-09-17",
      "currency": "PEN",
      "notes": "Almuerzo 25 soles en restaurante chifa con BCP",
      "warnings": [
        "Selecciona la cuenta: no se identificó una cuenta única.",
        "Selecciona la categoría: no se identificó una categoría única."
      ],
      "category": "",
      "confidence": 0
    }
  }
  ```
- **Evaluación**: El servicio extrae correctamente monto (25), tipo (gasto) y moneda (PEN) a través de expresiones regulares y heurística semántica sin requerir llamada a Gemini externa cuando no hay API Key configurada.

### 2.2 Endpoint `/api/ai/chat-denis`
- **Respuesta Obtenida**:
  ```json
  {
    "success": true,
    "mode": "local",
    "reply": "La categoría con mayor gasto de este mes es Servicios: S/ 300.00."
  }
  ```
- **Evaluación**: Genera una respuesta precisa y contextualizada basada en el `financialContext` proporcionado por el frontend.

### 2.3 Desconexión de API en Vercel
- **Hallazgo Crítico**: El archivo `vercel.json` del proyecto está configurado para exportar y servir de forma estática la carpeta `apps/mobile/dist`. No existe configuración de Vercel Serverless Functions (`api/*.ts`) para ejecutar el backend Express en Vercel.
- **Consecuencia**: Todo el backend reside exclusivamente en local o en un servidor Node.js independiente, por lo que la aplicación en la nube opera al 100% en modo Local-First.

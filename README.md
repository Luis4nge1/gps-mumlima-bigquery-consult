# 🚀 GPS Query API

API REST profesional para consultar datos de ubicación GPS y Mobile almacenados en BigQuery con autenticación, validaciones y optimizaciones de rendimiento.

## ✨ Características

- ✅ **Consultas optimizadas** a BigQuery con parámetros seguros
- ✅ **Filtrado por rango de tiempo** flexible (múltiples formatos de fecha)
- ✅ **Autenticación segura** con API Key
- ✅ **Rate limiting** configurable para protección
- ✅ **Validación robusta** de parámetros y rangos
- ✅ **CORS y Helmet** para seguridad web
- ✅ **Health check** con verificación de BigQuery
- ✅ **Ordenamiento** por timestamp (más reciente primero)
- ✅ **Manejo de errores** completo y logging
- ✅ **Documentación** completa con ejemplos

## 📊 Estado del Proyecto

**✅ COMPLETAMENTE FUNCIONAL Y CONFIGURADO**

- **Conexión BigQuery**: ✅ Operativa
- **Datos GPS**: ✅ Registros para gps vehicular
- **Datos Mobile**: ✅ Registros para gps mobile
- **API Key**: ✅ Configurada y funcionando
- **Validaciones**: ✅ Todas implementadas
- **Seguridad**: ✅ Configurada correctamente

## 🚀 Inicio Rápido

### 1. Instalación
```bash
# Clonar e instalar dependencias
npm install

# Verificar configuración
node test/verify-config.js
```

### 2. Configuración
```bash
# El proyecto ya está configurado, solo ajustar si es necesario
cp .env.example .env
# Editar .env con tus configuraciones específicas
```

### 3. Ejecutar
```bash
# Desarrollo
npm run dev

# Producción  
npm start
```

### 4. Probar
```bash
# Health check
curl http://localhost:3005/api/v5/health
```

## 📡 API Endpoints

### 🏥 Health Check
```http
GET /api/v5/health
```
**Respuesta:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-12T16:22:00.000Z",
  "services": { "bigquery": "connected" }
}
```

### 📋 **Resumen de Endpoints Disponibles**

| Endpoint | Método | Descripción | Límite por defecto |
|----------|--------|-------------|-------------------|
| `/api/v5/health` | GET | Health check | - |
| `/api/v5/gps/:id` | GET | Datos GPS por rango de tiempo | 20,000 |
| `/api/v5/gps/:id/route/:date` | GET | Recorrido GPS completo por día | 50,000 |
| `/api/v5/gps/:id/latest` | GET | Último registro GPS | 1 |
| `/api/v5/mobile/:id` | GET | Datos Mobile por rango de tiempo | 20,000 |
| `/api/v5/mobile/:id/route/:date` | GET | Recorrido Mobile completo por día | 50,000 |
| `/api/v5/mobile/:id/latest` | GET | Último registro Mobile | 1 |

### 📍 GPS Data

#### Obtener último registro GPS
```http
GET /api/v5/gps/:deviceId/latest
```

**Ejemplo:**
```bash
curl -H "x-api-key: tu-api-key" \
  http://localhost:3005/api/v5/gps/device-001/latest
```

#### Obtener datos GPS por rango de tiempo
```http
GET /api/v5/gps/:deviceId?startTime=FECHA&endTime=FECHA&limit=1000&sampling=N
```

**Parámetros:**
- `deviceId` (path): ID del dispositivo GPS (ej: `device-001`)
- `startTime` (query): Fecha de inicio 
- `endTime` (query): Fecha de fin
- `limit` (query, opcional): Límite de resultados (1-50000, default: 1000)
- `sampling` (query, opcional): Muestreo cada N registros (1-100)

**Formatos de fecha aceptados:**

⚠️ **IMPORTANTE**: Los formatos ISO sin timezone se interpretan como **hora local del servidor**, NO como UTC.

```bash
# ✅ UTC con milisegundos (RECOMENDADO)
startTime=2025-07-31T22:00:00.000Z

# ✅ Con timezone específico (equivale al UTC de arriba)
startTime=2025-07-31T17:00:00-05:00

# ⚠️ ISO sin timezone (se interpreta como hora LOCAL del servidor)
startTime=2025-07-31T22:00:00  # Se convierte a 2025-08-01T03:00:00.000Z

# ⚠️ Con espacio (se interpreta como hora LOCAL del servidor)
startTime=2025-07-31 22:00:00  # Se convierte a 2025-08-01T03:00:00.000Z
```

**🎯 RECOMENDACIÓN FUERTE**: Usar SIEMPRE formato UTC con 'Z' para evitar confusiones de timezone.

**Ejemplos:**
```bash
# Consulta básica (SIEMPRE usar limit)
curl -H "x-api-key: tu-api-key" \
  "http://localhost:3005/api/v5/gps/device-001?startTime=2025-07-31T22:00:00.000Z&endTime=2025-08-01T00:00:00.000Z&limit=100"

# Consulta optimizada con muestreo (cada 5 registros)
curl -H "x-api-key: tu-api-key" \
  "http://localhost:3005/api/v5/gps/device-001?startTime=2025-07-31T22:00:00.000Z&endTime=2025-08-01T00:00:00.000Z&limit=1000&sampling=5"

# Para datasets grandes: usar sampling + limit alto
curl -H "x-api-key: tu-api-key" \
  "http://localhost:3005/api/v5/gps/device-001?startTime=2025-07-31T00:00:00.000Z&endTime=2025-07-31T23:59:59.999Z&limit=50000&sampling=10"
```

#### 🛣️ Obtener recorrido completo GPS por día
```http
GET /api/v5/gps/:deviceId/route/:date?limit=50000&sampling=N
```

**Parámetros:**
- `deviceId` (path): ID del dispositivo GPS
- `date` (path): Fecha en formato YYYY-MM-DD
- `limit` (query, opcional): Límite de resultados (default: 50000)
- `sampling` (query, opcional): Muestreo cada N registros

**Ejemplo:**
```bash
# Recorrido completo del día
curl -H "x-api-key: tu-api-key" \
  http://localhost:3005/api/v5/gps/{:deviceId}/route/2025-07-31

# Recorrido optimizado (cada 3 registros)
curl -H "x-api-key: tu-api-key" \
  "http://localhost:3005/api/v5/gps/{:deviceId}/route/2025-07-31?sampling=3"
```

**Respuesta con metadatos automáticos:**
```json
{
  "success": true,
  "data": [...],
  "count": 5,
  "metadata": {
    "totalPoints": 5,
    "totalDistance": 0.12,
    "duration": {
      "minutes": 21,
      "hours": 0.35
    },
    "timeRange": {
      "start": "2025-07-31T22:22:48.931Z",
      "end": "2025-07-31T22:44:07.336Z"
    },
    "bounds": {
      "north": -12.04514,
      "south": -12.045584,
      "east": -77.030646,
      "west": -77.031282
    }
  }
}
```

> **💡 Diferencia Clave**: Los endpoints `/route/:date` calculan automáticamente distancia total, duración y bounds. Los endpoints normales solo devuelven puntos GPS.
```json
{
  "success": true,
  "data": [...],
  "count": 5,
  "metadata": {
    "totalPoints": 5,
    "totalDistance": 0.12,
    "duration": {
      "minutes": 21,
      "hours": 0.35
    },
    "timeRange": {
      "start": "2025-07-31T22:22:48.931Z",
      "end": "2025-07-31T22:44:07.336Z"
    },
    "bounds": {
      "north": -12.04514,
      "south": -12.045584,
      "east": -77.030646,
      "west": -77.031282
    }
  }
}

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "device-001",
      "lat": -12.045584,
      "lng": -77.030912,
      "timestamp": "2025-07-31T22:44:07.336Z"
    }
  ],
  "count": 1,
  "query": {
    "id": "device-001",
    "startTime": "2025-07-31T22:00:00.000Z",
    "endTime": "2025-08-01T00:00:00.000Z",
    "limit": 100
  }
}
```

### 📱 Mobile Data

#### Obtener último registro Mobile
```http
GET /api/v5/mobile/:userId/latest
```

**Ejemplo:**
```bash
curl -H "x-api-key: tu-api-key" \
  http://localhost:3005/api/v5/mobile/{:userId}/latest
```

#### Obtener datos Mobile por rango de tiempo
```http
GET /api/v5/mobile/:userId?startTime=FECHA&endTime=FECHA&limit=1000
```

**Parámetros:**
- `userId` (path): ID del usuario móvil (ej: `BIIm73haRJWBOBzVZ7jRVJuWQp13`)
- Mismos parámetros de query que GPS

**Ejemplo:**
```bash
curl -H "x-api-key: tu-api-key" \
  "http://localhost:3005/api/v5/mobile/BIIm73haRJWBOBzVZ7jRVJuWQp13?startTime=2025-08-01T00:00:00.000Z&endTime=2025-08-01T23:59:59.999Z&limit=50"
```

## 🔐 Autenticación

La API utiliza autenticación por API Key para proteger los endpoints.

### Configurar API Key
```bash
# En .env agregar:
API_KEY=tu-api-key-segura-de-32-caracteres-minimo
```

### Usar API Key

#### Opción 1: Header (Recomendado)
```bash
curl -H "x-api-key: tu-api-key" http://localhost:3005/api/v5/gps/device-001/latest
```

#### Opción 2: Query Parameter
```bash
curl "http://localhost:3005/api/v5/gps/device-001/latest?api_key=tu-api-key"
```

#### Opción 3: JavaScript/Fetch
```javascript
fetch('http://localhost:3005/api/v5/gps/device-001/latest', {
  headers: {
    'x-api-key': 'tu-api-key'
  }
})
```

### Generar API Key Segura
```bash
# PowerShell
$apiKey = -join ((1..128) | ForEach {Get-Random -input ([char[]]([char]'a'..[char]'z') + [char[]]([char]'A'..[char]'Z') + [char[]]([char]'0'..[char]'9'))})

# Linux/Mac
openssl rand -hex 128
```

### Respuestas de Autenticación
```json
// Sin API Key
{
  "error": "API key required",
  "message": "Please provide an API key in the x-api-key header or api_key query parameter"
}

// API Key inválida
{
  "error": "Invalid API key", 
  "message": "The provided API key is not valid"
}
```

## ✅ Validaciones y Límites

### ⚠️ **IMPORTANTE: Uso del parámetro `limit`**

**El parámetro `limit` es ALTAMENTE RECOMENDADO** para todas las consultas:

- **Consultas sin `limit`**: Usan límites por defecto (20,000 para consultas normales, 50,000 para rutas)
- **Riesgo sin límite**: Consultas pueden devolver millones de registros causando timeouts y alto consumo
- **Optimización de costos**: BigQuery cobra por datos procesados, `limit` reduce costos significativamente
- **Mejor rendimiento**: Respuestas más rápidas y menor uso de memoria

**Recomendaciones de `limit`:**
- **Consultas exploratorias**: `limit=100-1000`
- **Visualización en mapas**: `limit=5000-10000` 
- **Análisis completo**: `limit=20000-50000`
- **Con `sampling`**: Permite límites más altos manteniendo rendimiento

### Validaciones de Parámetros
- **Device/User ID**: Solo caracteres alfanuméricos, puntos, guiones y guiones bajos (`/^[a-zA-Z0-9._-]+$/`)
- **Fechas**: Formato ISO válido (múltiples formatos aceptados)
- **Rango de tiempo**: Máximo 30 días entre `startTime` y `endTime`
- **Límite**: Entre 1 y 50,000 registros por consulta
- **Sampling**: Entre 1 y 100 (muestrea cada N registros)

### Límites de Rate Limiting
- **100 requests por 15 minutos** por IP
- Configurable via `RATE_LIMIT_MAX` y `RATE_LIMIT_WINDOW`

### Mensajes de Error
```json
// Formato de fecha inválido
{
  "error": "Invalid date format",
  "message": "startTime and endTime must be valid ISO date strings"
}

// Rango muy grande
{
  "error": "Time range too large",
  "message": "Maximum time range is 30 days"
}

// ID inválido
{
  "error": "Invalid ID format", 
  "message": "ID can only contain letters, numbers, dots, hyphens, and underscores"
}
```

## 💻 Ejemplos de Uso Completos

### JavaScript/Frontend
```javascript
// Configuración base
const API_BASE = 'http://localhost:3005';
const API_KEY = 'tu-api-key';

// Función helper
async function apiRequest(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'x-api-key': API_KEY }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Obtener último registro GPS
const latestGPS = await apiRequest('/api/v5/gps/{:id}/latest');
console.log('Última ubicación:', latestGPS.data);

// Obtener datos de las últimas 24 horas
const endTime = new Date().toISOString();
const startTime = new Date(Date.now() - 24*60*60*1000).toISOString();

const gpsData = await apiRequest(
  `/api/v5/gps/{:id}?startTime=${startTime}&endTime=${endTime}&limit=100`
);
console.log(`${gpsData.count} registros encontrados`);

// Obtener datos Mobile
const mobileData = await apiRequest(
  '/api/v5/mobile/{:id}/latest'
);
console.log('Usuario móvil:', mobileData.data);
```

### cURL Avanzado
```bash
# Health check
curl -s http://localhost:3005/api/v5/health | jq '.'

# Último GPS con formato bonito
curl -s -H "x-api-key: tu-api-key" \
  http://localhost:3005/api/v5/gps/:id/latest | jq '.data'

# Datos GPS de hoy con timezone de Lima
TODAY_START="$(date -d 'today 00:00:00' -u +'%Y-%m-%dT%H:%M:%S.000Z')"
TODAY_END="$(date -d 'today 23:59:59' -u +'%Y-%m-%dT%H:%M:%S.999Z')"

curl -s -H "x-api-key: tu-api-key" \
  "http://localhost:3005/api/v5/gps/:id?startTime=${TODAY_START}&endTime=${TODAY_END}&limit=50" \
  | jq '.count'

# Datos Mobile con manejo de errores
curl -s -H "x-api-key: tu-api-key" \
  "http://localhost:3005/api/v5/mobile/:id/latest" \
  | jq 'if .success then .data else .error end'
```

### Node.js/Express Integration
```javascript
const express = require('express');
const axios = require('axios');

const app = express();
const GPS_API = 'http://localhost:3005';
const API_KEY = 'tu-api-key';

// Middleware para proxy con autenticación
app.get('/location/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { startTime, endTime, limit } = req.query;
    
    const params = new URLSearchParams();
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    if (limit) params.append('limit', limit);
    
    const url = `${GPS_API}/api/v5/gps/${deviceId}${startTime ? '?' + params : '/latest'}`;
    
    const response = await axios.get(url, {
      headers: { 'x-api-key': API_KEY }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: 'GPS API Error',
      message: error.message
    });
  }
});
```

## 🏗️ Configuración del Proyecto

### Variables de Entorno

#### Archivo `.env` (Configuración actual)
```env
# Servidor
PORT=3005
HOST=localhost
NODE_ENV=development

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
GCP_PROJECT_ID=name-project

# BigQuery
BIGQUERY_DATASET_ID=id-data
BIGQUERY_GPS_TABLE_ID=gps-table
BIGQUERY_MOBILE_TABLE_ID=mobile-table
BIGQUERY_LOCATION=US

# API Configuration
API_KEY=tu-api-key-configurada
RATE_LIMIT_WINDOW=900000  # 15 minutos
RATE_LIMIT_MAX=100        # 100 requests por ventana

# Logging
LOG_LEVEL=info
```

#### Para Producción (`.env.production`)
```env
PORT=4000
HOST=0.0.0.0
NODE_ENV=production
API_KEY=api-key-segura-de-128-caracteres-minimo
LOG_LEVEL=warn | error
# ... resto igual
```

### Estructura del Proyecto
```
gps-query-api/
├── src/
│   ├── config/
│   │   └── bigquery.js         # Configuración BigQuery
│   ├── middleware/
│   │   ├── auth.js             # Autenticación API Key
│   │   └── validation.js       # Validaciones robustas
│   ├── routes/
│   │   ├── gps.js             # Endpoints GPS
│   │   ├── mobile.js          # Endpoints Mobile  
│   │   └── health.js          # Health check
│   ├── services/
│   │   └── queryService.js    # Lógica BigQuery optimizada
│   └── server.js              # Servidor Express
├── examples/
│   └── usage-examples.js      # Ejemplos de uso
├── .env                       # Configuración desarrollo
├── .env.production           # Configuración producción
├── service-account.json      # Credenciales GCP
├── verify-config.js          # Script verificación
├── TIMESTAMPS.md             # Guía timestamps
├── jsconfig.json             # Configuración IDE
├── package.json
└── README.md
```

### Esquemas de Datos BigQuery

#### Tabla GPS (`gps-data`)
```sql
CREATE TABLE id-data.gps-data (
  deviceId STRING,      -- ID del dispositivo (ej: ":id")
  lat FLOAT,           -- Latitud
  lng FLOAT,           -- Longitud  
  timestamp TIMESTAMP, -- Fecha/hora en UTC
  processed_at TIMESTAMP,
  processing_id STRING
);
```

#### Tabla Mobile (`mobile-table`)
```sql
CREATE TABLE id-data.mobile-data (
  userId STRING,       -- ID del usuario (ej: "BIIm73haRJWBOBzVZ7jRVJuWQp13")
  lat FLOAT,          -- Latitud
  lng FLOAT,          -- Longitud
  timestamp TIMESTAMP, -- Fecha/hora en UTC
  name STRING,        -- Nombre del usuario
  email STRING,       -- Email del usuario
  processed_at TIMESTAMP,
  processing_id STRING
);
```

## 🕐 Manejo de Timestamps

### Formatos Aceptados
La API es muy flexible con los formatos de fecha:

```bash
# UTC con milisegundos (Recomendado)
startTime=2025-07-31T22:00:00.000Z

# UTC sin milisegundos  
startTime=2025-07-31T22:00:00Z

# Con timezone de Lima (UTC-5)
startTime=2025-07-31T17:00:00-05:00

# ISO sin timezone (se interpreta como UTC)
startTime=2025-07-31T22:00:00

# Con espacio
startTime=2025-07-31 22:00:00
```

### ⚠️ IMPORTANTE sobre Timezones

**CUIDADO**: Los formatos sin timezone pueden causar confusión:

- **BigQuery almacena TODO en UTC** ✅
- **La API devuelve TODO en UTC** ✅  
- **Formatos con timezone explícito**: Se convierten correctamente ✅
- **Formatos SIN timezone**: Se interpretan como hora LOCAL del servidor ⚠️

### Ejemplo Práctico de Equivalencias
```bash
# ✅ Estas consultas SÍ son IDÉNTICAS (mismo momento UTC):
GET /api/v5/gps/:id?startTime=2025-07-31T22:00:00.000Z     # UTC explícito
GET /api/v5/gps/:id?startTime=2025-07-31T17:00:00-05:00    # Lima explícito

# ❌ Esta consulta es DIFERENTE (5 horas después):
GET /api/v5/gps/:id?startTime=2025-07-31T22:00:00          # Sin timezone = local
```

### 🎯 Mejor Práctica para Frontend
```javascript
// ✅ CORRECTO: Convertir fecha local del usuario a UTC
const userLocalDate = new Date('2025-07-31 17:00:00'); // Hora que ve el usuario
const utcString = userLocalDate.toISOString(); // "2025-07-31T22:00:00.000Z"

// ❌ INCORRECTO: Enviar fecha sin timezone
const badFormat = '2025-07-31T17:00:00'; // Ambiguo, depende del servidor
```

## 📊 Datos de Prueba Verificados

### GPS Data (device-001)
- **Total registros**: 80+
- **Última ubicación**: (latitud, longitud) Lima, Perú
- **Último timestamp**: 2025-07-31T22:44:07.336Z
- **Rango disponible**: Julio 2025

### Mobile Data (BIIm73haRJWBOBzVZ7jRVJuWQp13)
- **Total registros**: Múltiples disponibles
- **Última ubicación**: (latitud, longitud) Lima, Perú  
- **Último timestamp**: 2025-08-01T00:54:26.000Z
- **Rango disponible**: Agosto 2025

## 🛠️ Scripts de Utilidad

### Verificar Configuración
```bash
node verify-config.js
```
Analiza toda la configuración y reporta problemas.

### Probar Conexión BigQuery
```bash
node test-bigquery.js
```
Prueba la conexión directa a BigQuery.

### Probar API Completa
```bash
node test-direct.js
```
Prueba todos los endpoints de la API.

## 🚀 Deployment

### Desarrollo
```bash
npm run dev
# Servidor en http://localhost:3005
```

### Producción
```bash
# Configurar variables de producción
cp .env.production .env

# Generar API key segura
openssl rand -hex 128

# Iniciar servidor
npm start
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3005
CMD ["npm", "start"]
```

## 🔧 Troubleshooting

### Errores Comunes

#### Error 401: API key required
```bash
# Solución: Agregar API key
curl -H "x-api-key: tu-api-key" ...
```

#### Error 500: BigQuery connection
```bash
# Verificar credenciales
node verify-config.js

# Verificar archivo service-account.json
ls -la service-account.json
```

#### Error 400: Invalid date format
```bash
# Usar formato ISO válido
startTime=2025-07-31T22:00:00.000Z
```

#### Rate limit exceeded
```bash
# Esperar 15 minutos o ajustar RATE_LIMIT_MAX
```

### Logs y Debugging
```bash
# Ver logs detallados
LOG_LEVEL=debug npm start

# Verificar health check
curl http://localhost:3005/health
```

## 📈 Rendimiento y Optimización

- **Consultas optimizadas** con índices en BigQuery
- **Parámetros seguros** para prevenir SQL injection
- **Rate limiting** para proteger recursos
- **Validación temprana** para reducir carga
- **Respuestas en streaming** para datasets grandes
- **Caché de conexiones** BigQuery

## 🔒 Seguridad

- ✅ **API Key authentication**
- ✅ **Rate limiting por IP**
- ✅ **CORS configurado**
- ✅ **Helmet security headers**
- ✅ **Validación de parámetros**
- ✅ **SQL injection prevention**
- ✅ **Error handling seguro**

## 📞 Soporte

Para problemas o preguntas:

1. **Verificar configuración**: `node verify-config.js`
2. **Revisar logs** del servidor
3. **Probar endpoints** con los datos de ejemplo proporcionados

---

## 🎉 Estado Final

**✅ PROYECTO COMPLETAMENTE FUNCIONAL**

- Configuración verificada y optimizada
- Datos de prueba confirmados y funcionando
- API Key configurada y segura
- Documentación completa
- Scripts de utilidad incluidos
- Listo para desarrollo y producción

**¡La API está lista para usar!** 🚀
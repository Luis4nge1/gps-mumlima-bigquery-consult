# 🕐 Guía de Timestamps - GPS Query API

## 📊 **Resumen de Investigación**

He investigado exhaustivamente cómo BigQuery y la API manejan los timestamps. Aquí están los resultados:

### **🔍 Datos en BigQuery**
- **Almacenamiento**: Todos los timestamps se almacenan en **UTC** en BigQuery
- **Formato**: `TIMESTAMP` type que siempre devuelve valores como `2025-07-31T22:44:07.336Z`
- **Timezone**: BigQuery internamente maneja todo en UTC

---

## ✅ **Formatos de Fecha ACEPTADOS por la API**

La API es **muy flexible** y acepta múltiples formatos de timestamp:

### **1. UTC con milisegundos (Recomendado)**
```
startTime=2025-07-31T22:00:00.000Z
endTime=2025-08-01T00:00:00.000Z
```

### **2. UTC sin milisegundos**
```
startTime=2025-07-31T22:00:00Z
endTime=2025-08-01T00:00:00Z
```

### **3. Con Timezone específico (Lima UTC-5)**
```
startTime=2025-07-31T17:00:00-05:00
endTime=2025-07-31T19:00:00-05:00
```
**Nota**: `17:00 Lima = 22:00 UTC`

### **4. ISO sin indicador de timezone**
```
startTime=2025-07-31T22:00:00
endTime=2025-08-01T00:00:00
```
**Nota**: BigQuery lo interpreta como UTC

### **5. Formato con espacio**
```
startTime=2025-07-31 22:00:00
endTime=2025-08-01 00:00:00
```

### **6. Solo fecha**
```
startTime=2025-07-31
endTime=2025-08-01
```

---

## ❌ **Formatos NO Aceptados**

```
❌ 31-07-2025 22:00:00  (formato DD-MM-YYYY)
❌ 07/31/2025 22:00:00  (formato MM/DD/YYYY)
❌ 1722463200          (timestamp Unix)
```

---

## 🌍 **Manejo de Timezones**

### **Importante**: 
- **BigQuery almacena TODO en UTC**
- **La API devuelve TODO en UTC**
- **Puedes enviar fechas en cualquier timezone, pero se convierten a UTC**

### **Ejemplo Práctico**:
```bash
# Estas consultas son EQUIVALENTES:

# UTC
GET /api/gps/device-001?startTime=2025-07-31T22:00:00Z&endTime=2025-08-01T00:00:00Z

# Lima (UTC-5)
GET /api/gps/device-001?startTime=2025-07-31T17:00:00-05:00&endTime=2025-07-31T19:00:00-05:00

# Ambas devuelven los mismos resultados porque 17:00 Lima = 22:00 UTC
```

---

## 🛠️ **Ejemplos de Uso**

### **JavaScript/Frontend**
```javascript
// Obtener datos de las últimas 24 horas
const endTime = new Date().toISOString();  // 2025-08-04T16:22:00.000Z
const startTime = new Date(Date.now() - 24*60*60*1000).toISOString();

fetch(`/api/gps/device-001?startTime=${startTime}&endTime=${endTime}`, {
  headers: { 'x-api-key': 'tu-api-key' }
});
```

### **cURL con UTC**
```bash
curl -H "x-api-key: tu-api-key" \
  "http://localhost:3005/api/gps/device-001?startTime=2025-07-31T22:00:00.000Z&endTime=2025-08-01T00:00:00.000Z"
```

### **cURL con Lima Timezone**
```bash
curl -H "x-api-key: tu-api-key" \
  "http://localhost:3005/api/gps/device-001?startTime=2025-07-31T17:00:00-05:00&endTime=2025-07-31T19:00:00-05:00"
```

---

## 📋 **Validaciones Implementadas**

La API valida automáticamente:

1. **✅ Formato válido**: Debe ser parseable por `new Date()`
2. **✅ Rango lógico**: `startTime` debe ser menor que `endTime`
3. **✅ Rango máximo**: Máximo 30 días entre fechas
4. **✅ Límite de resultados**: Entre 1 y 10,000 registros

### **Mensajes de Error**:
```json
{
  "error": "Invalid date format",
  "message": "startTime and endTime must be valid ISO date strings"
}

{
  "error": "Time range too large", 
  "message": "Maximum time range is 30 days"
}
```

---

## 🎯 **Recomendaciones**

### **Para Desarrollo**:
- Usa **UTC con milisegundos**: `2025-07-31T22:00:00.000Z`
- Siempre incluye la `Z` para claridad
- Usa `new Date().toISOString()` en JavaScript

### **Para Usuarios Finales**:
- Puedes usar **tu timezone local**: `2025-07-31T17:00:00-05:00`
- La API se encarga de la conversión automáticamente
- Los resultados siempre vienen en UTC

### **Para Aplicaciones**:
- Convierte a UTC en el frontend antes de enviar
- Muestra al usuario en su timezone local
- Almacena logs en UTC para consistencia

---

## 🧪 **Datos de Prueba Verificados**

### **GPS (device-001)**:
- **Último registro**: `2025-07-31T22:44:07.336Z`
- **Rango disponible**: Julio 2025
- **Ubicación**: Lima, Perú

### **Mobile (BIIm73haRJWBOBzVZ7jRVJuWQp13)**:
- **Último registro**: `2025-08-01T00:54:26.000Z`
- **Rango disponible**: Agosto 2025
- **Ubicación**: Lima, Perú

---

## 🔧 **Configuración Actual**

- **Puerto**: 3005
- **API Key**: Activada y funcionando
- **Rate Limit**: 100 requests/15min
- **Rango máximo**: 30 días por consulta
- **Límite por consulta**: 10,000 registros

**¡La API está completamente funcional y maneja timestamps correctamente!** 🎉
import http from 'http';

const API_BASE_URL = 'http://localhost:4000';

// Función helper para hacer requests
async function apiRequest(endpoint) {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Probando: ${API_BASE_URL}${endpoint}`);
    
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`📊 Status: ${res.statusCode}`);
          console.log(`📋 Response:`, JSON.stringify(jsonData, null, 2));
          console.log('─'.repeat(80));
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          console.log(`📊 Status: ${res.statusCode}`);
          console.log(`📋 Raw Response:`, data);
          console.log('─'.repeat(80));
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error en ${endpoint}:`, error.message);
      console.log('─'.repeat(80));
      resolve({ error: error.message });
    });

    req.setTimeout(10000, () => {
      console.error(`❌ Timeout en ${endpoint}`);
      req.destroy();
      resolve({ error: 'Timeout' });
    });

    req.end();
  });
}

async function testAPI() {
  console.log('🚀 Iniciando pruebas de la GPS Query API\n');
  
  // Test 1: Health check
  console.log('1️⃣ Probando Health Check');
  await apiRequest('/health');
  
  // Test 2: GPS Latest - device-001
  console.log('2️⃣ Probando GPS Latest para device-001');
  await apiRequest('/api/gps/device-001/latest');
  
  // Test 3: Mobile Latest - BIIm73haRJWBOBzVZ7jRVJuWQp13
  console.log('3️⃣ Probando Mobile Latest para BIIm73haRJWBOBzVZ7jRVJuWQp13');
  await apiRequest('/api/mobile/BIIm73haRJWBOBzVZ7jRVJuWQp13/latest');
  
  // Test 4: GPS con rango de tiempo - últimas 24 horas
  console.log('4️⃣ Probando GPS con rango de tiempo (últimas 24 horas)');
  const endTime = new Date().toISOString();
  const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await apiRequest(`/api/gps/device-001?startTime=${startTime}&endTime=${endTime}&limit=10`);
  
  // Test 5: Mobile con rango de tiempo - últimas 24 horas
  console.log('5️⃣ Probando Mobile con rango de tiempo (últimas 24 horas)');
  await apiRequest(`/api/mobile/BIIm73haRJWBOBzVZ7jRVJuWQp13?startTime=${startTime}&endTime=${endTime}&limit=10`);
  
  // Test 6: Endpoint raíz
  console.log('6️⃣ Probando endpoint raíz');
  await apiRequest('/');
  
  console.log('✅ Pruebas completadas');
}

// Ejecutar pruebas
testAPI().catch(console.error);
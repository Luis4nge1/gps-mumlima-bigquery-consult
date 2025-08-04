import http from 'http';

const API_KEY = 'mumlima-FC1R6PXuRV1ULGJQIAS5tsjdAKMvj7xBoFE51nkui3WMaARPV82WSu1O13go6ngSRH2NO5XibwiucZj6qp1pgkgFG3ad9fFUumNsv4DiLU52rPDWbhwpu2Uh2';

async function testRouteFeatures() {
  console.log('🛣️ Probando nuevas funcionalidades de recorridos...\n');

  function apiRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3005,
        path: endpoint,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ status: res.statusCode, data: jsonData });
          } catch (error) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', (error) => reject(error));
      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      req.end();
    });
  }

  // Test 1: Consulta normal con límite aumentado
  console.log('1️⃣ Probando límite aumentado (5000 registros):');
  try {
    const result1 = await apiRequest('/api/mobile/BIIm73haRJWBOBzVZ7jRVJuWQp13?startTime=2025-07-31T00:00:00Z&endTime=2025-08-02T00:00:00Z&limit=5000');
    if (result1.status === 200) {
      console.log(`   ✅ Éxito: ${result1.data.count} registros obtenidos`);
      console.log(`   📊 Límite solicitado: ${result1.data.query.limit}`);
    } else {
      console.log(`   ❌ Error: Status ${result1.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 2: Consulta con muestreo
  console.log('\n2️⃣ Probando muestreo optimizado (cada 5 registros):');
  try {
    const result2 = await apiRequest('/api/mobile/BIIm73haRJWBOBzVZ7jRVJuWQp13?startTime=2025-07-31T00:00:00Z&endTime=2025-08-02T00:00:00Z&limit=1000&sampling=5');
    if (result2.status === 200) {
      console.log(`   ✅ Éxito: ${result2.data.count} registros obtenidos`);
      console.log(`   🔄 Muestreo: cada ${result2.data.query.sampling} registros`);
    } else {
      console.log(`   ❌ Error: Status ${result2.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 3: Nuevo endpoint de recorrido diario
  console.log('\n3️⃣ Probando endpoint de recorrido diario:');
  try {
    const result3 = await apiRequest('/api/mobile/BIIm73haRJWBOBzVZ7jRVJuWQp13/route/2025-08-01');
    if (result3.status === 200) {
      console.log(`   ✅ Éxito: Recorrido completo obtenido`);
      console.log(`   📍 Puntos del recorrido: ${result3.data.count}`);
      console.log(`   📊 Metadatos:`);
      if (result3.data.metadata) {
        console.log(`      🛣️ Distancia total: ${result3.data.metadata.totalDistance} km`);
        console.log(`      ⏱️ Duración: ${result3.data.metadata.duration.minutes} minutos`);
        console.log(`      🕐 Inicio: ${result3.data.metadata.timeRange.start}`);
        console.log(`      🕐 Fin: ${result3.data.metadata.timeRange.end}`);
      }
    } else {
      console.log(`   ❌ Error: Status ${result3.status}`);
      if (result3.data.message) {
        console.log(`   💬 Mensaje: ${result3.data.message}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 4: Recorrido con muestreo optimizado
  console.log('\n4️⃣ Probando recorrido con muestreo optimizado:');
  try {
    const result4 = await apiRequest('/api/mobile/BIIm73haRJWBOBzVZ7jRVJuWQp13/route/2025-08-01?sampling=3');
    if (result4.status === 200) {
      console.log(`   ✅ Éxito: Recorrido optimizado obtenido`);
      console.log(`   📍 Puntos optimizados: ${result4.data.count}`);
      console.log(`   🔄 Muestreo: cada ${result4.data.query.sampling} registros`);
      if (result4.data.metadata) {
        console.log(`   🛣️ Distancia estimada: ${result4.data.metadata.totalDistance} km`);
      }
    } else {
      console.log(`   ❌ Error: Status ${result4.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 5: GPS recorrido diario
  console.log('\n5️⃣ Probando recorrido GPS diario:');
  try {
    const result5 = await apiRequest('/api/gps/device-001/route/2025-07-31');
    if (result5.status === 200) {
      console.log(`   ✅ Éxito: Recorrido GPS obtenido`);
      console.log(`   📍 Puntos del recorrido: ${result5.data.count}`);
      if (result5.data.metadata) {
        console.log(`   🛣️ Distancia total: ${result5.data.metadata.totalDistance} km`);
        console.log(`   ⏱️ Duración: ${result5.data.metadata.duration.minutes} minutos`);
      }
    } else {
      console.log(`   ❌ Error: Status ${result5.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 6: Validación de límites
  console.log('\n6️⃣ Probando validación de límites:');
  try {
    const result6 = await apiRequest('/api/mobile/BIIm73haRJWBOBzVZ7jRVJuWQp13?startTime=2025-08-01T00:00:00Z&endTime=2025-08-01T01:00:00Z&limit=60000');
    if (result6.status === 400) {
      console.log(`   ✅ Validación correcta: Límite rechazado`);
      console.log(`   💬 Mensaje: ${result6.data.message}`);
    } else {
      console.log(`   ❌ Debería haber rechazado el límite alto`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n🎉 Pruebas de funcionalidades de recorrido completadas');
}

testRouteFeatures().catch(console.error);
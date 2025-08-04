import http from 'http';

const API_KEY = 'mumlima-FC1R6PXuRV1ULGJQIAS5tsjdAKMvj7xBoFE51nkui3WMaARPV82WSu1O13go6ngSRH2NO5XibwiucZj6qp1pgkgFG3ad9fFUumNsv4DiLU52rPDWbhwpu2Uh2';

async function testAPITimestamps() {
  console.log('🕐 Probando diferentes formatos de timestamp en la API...\n');

  // Función helper para hacer requests
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
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      req.end();
    });
  }

  // Casos de prueba con diferentes formatos de timestamp
  const testCases = [
    {
      name: 'UTC con milisegundos',
      startTime: '2025-07-31T22:00:00.000Z',
      endTime: '2025-08-01T00:00:00.000Z'
    },
    {
      name: 'UTC sin milisegundos',
      startTime: '2025-07-31T22:00:00Z',
      endTime: '2025-08-01T00:00:00Z'
    },
    {
      name: 'Lima timezone (UTC-5)',
      startTime: '2025-07-31T17:00:00-05:00',
      endTime: '2025-07-31T19:00:00-05:00'
    },
    {
      name: 'Formato ISO sin Z',
      startTime: '2025-07-31T22:00:00',
      endTime: '2025-08-01T00:00:00'
    },
    {
      name: 'Formato con espacio',
      startTime: '2025-07-31 22:00:00',
      endTime: '2025-08-01 00:00:00'
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📅 Probando: ${testCase.name}`);
      console.log(`   Start: ${testCase.startTime}`);
      console.log(`   End: ${testCase.endTime}`);
      
      const endpoint = `/api/gps/device-001?startTime=${encodeURIComponent(testCase.startTime)}&endTime=${encodeURIComponent(testCase.endTime)}&limit=3`;
      const result = await apiRequest(endpoint);
      
      if (result.status === 200 && result.data.success) {
        console.log(`   ✅ Éxito: ${result.data.count} registros encontrados`);
        if (result.data.data.length > 0) {
          console.log(`   📍 Primer registro: ${result.data.data[0].timestamp}`);
          console.log(`   📍 Último registro: ${result.data.data[result.data.data.length - 1].timestamp}`);
        }
      } else {
        console.log(`   ❌ Error: Status ${result.status}`);
        if (result.data.message) {
          console.log(`   💬 Mensaje: ${result.data.message}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error de conexión: ${error.message}`);
    }
    
    console.log('');
  }

  // Prueba con fechas inválidas
  console.log('🚫 Probando formatos inválidos:');
  
  const invalidCases = [
    {
      name: 'Formato incorrecto',
      startTime: '31-07-2025 22:00:00',
      endTime: '01-08-2025 00:00:00'
    },
    {
      name: 'Solo fecha',
      startTime: '2025-07-31',
      endTime: '2025-08-01'
    }
  ];

  for (const testCase of invalidCases) {
    try {
      console.log(`📅 Probando: ${testCase.name}`);
      console.log(`   Start: ${testCase.startTime}`);
      console.log(`   End: ${testCase.endTime}`);
      
      const endpoint = `/api/gps/device-001?startTime=${encodeURIComponent(testCase.startTime)}&endTime=${encodeURIComponent(testCase.endTime)}&limit=3`;
      const result = await apiRequest(endpoint);
      
      if (result.status === 400) {
        console.log(`   ✅ Correctamente rechazado: ${result.data.message}`);
      } else {
        console.log(`   ❌ Debería haber sido rechazado pero status: ${result.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error de conexión: ${error.message}`);
    }
    
    console.log('');
  }
}

testAPITimestamps().catch(console.error);
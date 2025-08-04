import queryService from '../src/services/queryService.js';

async function testDirect() {
  console.log('🔍 Probando consultas directas...');
  
  try {
    // Test GPS Latest
    console.log('\n1️⃣ Probando GPS Latest para device-001:');
    const gpsLatest = await queryService.getLatestGpsData('device-001');
    console.log('✅ Resultado GPS Latest:', JSON.stringify(gpsLatest, null, 2));

    // Test Mobile Latest
    console.log('\n2️⃣ Probando Mobile Latest para BIIm73haRJWBOBzVZ7jRVJuWQp13:');
    const mobileLatest = await queryService.getLatestMobileData('BIIm73haRJWBOBzVZ7jRVJuWQp13');
    console.log('✅ Resultado Mobile Latest:', JSON.stringify(mobileLatest, null, 2));

    // Test GPS con rango de tiempo
    console.log('\n3️⃣ Probando GPS con rango de tiempo:');
    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 días atrás
    const gpsRange = await queryService.getGpsData('device-001', startTime, endTime, 5);
    console.log('✅ Resultado GPS Range:', JSON.stringify(gpsRange, null, 2));

    // Test Mobile con rango de tiempo
    console.log('\n4️⃣ Probando Mobile con rango de tiempo:');
    const mobileRange = await queryService.getMobileData('BIIm73haRJWBOBzVZ7jRVJuWQp13', startTime, endTime, 5);
    console.log('✅ Resultado Mobile Range:', JSON.stringify(mobileRange, null, 2));

  } catch (error) {
    console.error('❌ Error en prueba directa:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDirect().catch(console.error);
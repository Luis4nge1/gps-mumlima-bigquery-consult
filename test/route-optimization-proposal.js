import { BigQuery } from '@google-cloud/bigquery';
import dotenv from 'dotenv';

dotenv.config();

async function analyzeRouteOptimization() {
  console.log('🛣️ Análisis de Optimización para Recorridos\n');
  
  try {
    const bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      location: process.env.BIGQUERY_LOCATION || 'US'
    });

    // 1. Analizar datos reales de recorrido
    console.log('1️⃣ Análisis de datos reales de recorrido:');
    
    const routeAnalysisQuery = `
      SELECT 
        COUNT(*) as total_points,
        MIN(timestamp) as start_time,
        MAX(timestamp) as end_time,
        TIMESTAMP_DIFF(MAX(timestamp), MIN(timestamp), MINUTE) as duration_minutes,
        COUNT(DISTINCT DATE(timestamp)) as days_with_data
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_MOBILE_TABLE_ID}\`
      WHERE userId = 'BIIm73haRJWBOBzVZ7jRVJuWQp13'
    `;
    
    const [routeJob] = await bigquery.createQueryJob({ query: routeAnalysisQuery, location: 'US' });
    const [routeRows] = await routeJob.getQueryResults();
    
    const stats = routeRows[0];
    console.log(`   📊 Total de puntos: ${stats.total_points}`);
    console.log(`   🕐 Primer registro: ${stats.start_time.value}`);
    console.log(`   🕐 Último registro: ${stats.end_time.value}`);
    console.log(`   ⏱️ Duración total: ${stats.duration_minutes} minutos`);
    console.log(`   📅 Días con datos: ${stats.days_with_data}`);

    // 2. Simular diferentes estrategias de consulta
    console.log('\n2️⃣ Comparando estrategias de consulta:');

    // Estrategia 1: Sin límite (recorrido completo)
    console.log('\n   🔄 Estrategia 1: Recorrido completo sin límite');
    const fullRouteQuery = `
      SELECT userId, lat, lng, timestamp
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_MOBILE_TABLE_ID}\`
      WHERE userId = 'BIIm73haRJWBOBzVZ7jRVJuWQp13'
        AND DATE(timestamp) = '2025-08-01'
      ORDER BY timestamp ASC
    `;
    
    const [fullRouteJob] = await bigquery.createQueryJob({ query: fullRouteQuery, location: 'US' });
    const [fullRouteRows] = await fullRouteJob.getQueryResults();
    
    console.log(`      ✅ Puntos obtenidos: ${fullRouteRows.length}`);
    console.log(`      📏 Cobertura: 100% del recorrido`);
    console.log(`      💾 Datos transferidos: ~${(fullRouteRows.length * 50 / 1024).toFixed(2)} KB`);

    // Estrategia 2: Con límite bajo (muestra)
    console.log('\n   🔄 Estrategia 2: Muestra con límite 10');
    const sampleRouteQuery = `
      SELECT userId, lat, lng, timestamp
      FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_MOBILE_TABLE_ID}\`
      WHERE userId = 'BIIm73haRJWBOBzVZ7jRVJuWQp13'
        AND DATE(timestamp) = '2025-08-01'
      ORDER BY timestamp ASC
      LIMIT 10
    `;
    
    const [sampleRouteJob] = await bigquery.createQueryJob({ query: sampleRouteQuery, location: 'US' });
    const [sampleRouteRows] = await sampleRouteJob.getQueryResults();
    
    console.log(`      ✅ Puntos obtenidos: ${sampleRouteRows.length}`);
    console.log(`      📏 Cobertura: ${((sampleRouteRows.length / fullRouteRows.length) * 100).toFixed(1)}% del recorrido`);
    console.log(`      💾 Datos transferidos: ~${(sampleRouteRows.length * 50 / 1024).toFixed(2)} KB`);

    // Estrategia 3: Optimizada (cada N minutos)
    console.log('\n   🔄 Estrategia 3: Optimizada (cada 5 minutos)');
    const optimizedRouteQuery = `
      WITH numbered_points AS (
        SELECT 
          userId, lat, lng, timestamp,
          ROW_NUMBER() OVER (ORDER BY timestamp) as row_num
        FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_DATASET_ID}.${process.env.BIGQUERY_MOBILE_TABLE_ID}\`
        WHERE userId = 'BIIm73haRJWBOBzVZ7jRVJuWQp13'
          AND DATE(timestamp) = '2025-08-01'
      )
      SELECT userId, lat, lng, timestamp
      FROM numbered_points
      WHERE MOD(row_num - 1, 5) = 0  -- Cada 5 registros
      ORDER BY timestamp ASC
    `;
    
    const [optimizedRouteJob] = await bigquery.createQueryJob({ query: optimizedRouteQuery, location: 'US' });
    const [optimizedRouteRows] = await optimizedRouteJob.getQueryResults();
    
    console.log(`      ✅ Puntos obtenidos: ${optimizedRouteRows.length}`);
    console.log(`      📏 Cobertura: ${((optimizedRouteRows.length / fullRouteRows.length) * 100).toFixed(1)}% del recorrido`);
    console.log(`      💾 Datos transferidos: ~${(optimizedRouteRows.length * 50 / 1024).toFixed(2)} KB`);

    // 3. Análisis de casos de uso
    console.log('\n3️⃣ Análisis de casos de uso:');
    
    console.log('\n   📱 Caso 1: App móvil en tiempo real');
    console.log('      🎯 Objetivo: Mostrar ubicación actual y últimas posiciones');
    console.log('      💡 Recomendación: LIMIT 50-100');
    console.log('      ⚡ Ventaja: Respuesta rápida, bajo consumo de datos');
    
    console.log('\n   🗺️ Caso 2: Visualización de recorrido completo');
    console.log('      🎯 Objetivo: Mostrar todo el trayecto del día');
    console.log('      💡 Recomendación: Sin límite o LIMIT alto (5000+)');
    console.log('      ⚡ Ventaja: Recorrido completo y preciso');
    
    console.log('\n   📊 Caso 3: Análisis de patrones');
    console.log('      🎯 Objetivo: Estudiar comportamiento de movimiento');
    console.log('      💡 Recomendación: Muestreo inteligente (cada N minutos)');
    console.log('      ⚡ Ventaja: Balance entre precisión y eficiencia');
    
    console.log('\n   🚗 Caso 4: Seguimiento de flota');
    console.log('      🎯 Objetivo: Monitorear múltiples vehículos');
    console.log('      💡 Recomendación: LIMIT moderado (500-1000) con paginación');
    console.log('      ⚡ Ventaja: Escalable para múltiples dispositivos');

    // 4. Recomendaciones finales
    console.log('\n4️⃣ Recomendaciones para la API:');
    console.log('\n   🔧 Mejoras propuestas:');
    console.log('      1. Aumentar límite máximo a 50,000 para recorridos completos');
    console.log('      2. Agregar parámetro "sampling" para optimización automática');
    console.log('      3. Implementar paginación con cursor/offset');
    console.log('      4. Agregar endpoint específico para recorridos diarios');
    console.log('      5. Incluir metadatos de distancia y duración en respuesta');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

analyzeRouteOptimization().catch(console.error);
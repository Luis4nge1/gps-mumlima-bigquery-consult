import fs from 'fs';
import path from 'path';
import { BigQuery } from '@google-cloud/bigquery';
import dotenv from 'dotenv';

dotenv.config();

class ConfigurationAnalyzer {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.recommendations = [];
  }

  log(type, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type}: ${message}`);
    
    switch(type) {
      case '❌ ERROR':
        this.issues.push(message);
        break;
      case '⚠️ WARNING':
        this.warnings.push(message);
        break;
      case '💡 RECOMMENDATION':
        this.recommendations.push(message);
        break;
    }
  }

  checkFileExists(filePath, required = true) {
    const exists = fs.existsSync(filePath);
    if (!exists && required) {
      this.log('❌ ERROR', `Archivo requerido no encontrado: ${filePath}`);
    } else if (!exists) {
      this.log('⚠️ WARNING', `Archivo opcional no encontrado: ${filePath}`);
    } else {
      this.log('✅ OK', `Archivo encontrado: ${filePath}`);
    }
    return exists;
  }

  checkEnvironmentVariables() {
    console.log('\n🔍 Verificando variables de entorno...');
    
    const requiredVars = [
      'GCP_PROJECT_ID',
      'BIGQUERY_DATASET_ID', 
      'BIGQUERY_GPS_TABLE_ID',
      'BIGQUERY_MOBILE_TABLE_ID',
      'GOOGLE_APPLICATION_CREDENTIALS'
    ];

    const optionalVars = [
      'PORT',
      'HOST',
      'NODE_ENV',
      'API_KEY',
      'RATE_LIMIT_WINDOW',
      'RATE_LIMIT_MAX',
      'BIGQUERY_LOCATION',
      'LOG_LEVEL'
    ];

    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (!value) {
        this.log('❌ ERROR', `Variable de entorno requerida no configurada: ${varName}`);
      } else {
        this.log('✅ OK', `${varName} = ${varName === 'GOOGLE_APPLICATION_CREDENTIALS' ? '[CONFIGURADO]' : value}`);
      }
    });

    optionalVars.forEach(varName => {
      const value = process.env[varName];
      if (!value) {
        this.log('⚠️ WARNING', `Variable opcional no configurada: ${varName} (usando valor por defecto)`);
      } else {
        this.log('✅ OK', `${varName} = ${value}`);
      }
    });
  }

  checkProjectStructure() {
    console.log('\n🏗️ Verificando estructura del proyecto...');
    
    const requiredFiles = [
      'package.json',
      '.env',
      'src/server.js',
      'src/config/bigquery.js',
      'src/services/queryService.js',
      'src/middleware/auth.js',
      'src/middleware/validation.js',
      'src/routes/gps.js',
      'src/routes/mobile.js',
      'src/routes/health.js'
    ];

    const optionalFiles = [
      '.env.example',
      'README.md',
      '.gitignore',
      'jsconfig.json'
    ];

    requiredFiles.forEach(file => this.checkFileExists(file, true));
    optionalFiles.forEach(file => this.checkFileExists(file, false));
  }

  async checkBigQueryConnection() {
    console.log('\n☁️ Verificando conexión a BigQuery...');
    
    try {
      const bigquery = new BigQuery({
        projectId: process.env.GCP_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        location: process.env.BIGQUERY_LOCATION || 'US'
      });

      // Test básico de conexión
      const [job] = await bigquery.createQueryJob({
        query: 'SELECT 1 as test',
        location: 'US'
      });
      await job.getQueryResults();
      this.log('✅ OK', 'Conexión a BigQuery exitosa');

      // Verificar dataset
      const dataset = bigquery.dataset(process.env.BIGQUERY_DATASET_ID);
      const [datasetExists] = await dataset.exists();
      
      if (!datasetExists) {
        this.log('❌ ERROR', `Dataset no existe: ${process.env.BIGQUERY_DATASET_ID}`);
        return;
      }
      this.log('✅ OK', `Dataset existe: ${process.env.BIGQUERY_DATASET_ID}`);

      // Verificar tablas
      const gpsTable = dataset.table(process.env.BIGQUERY_GPS_TABLE_ID);
      const [gpsExists] = await gpsTable.exists();
      
      if (!gpsExists) {
        this.log('❌ ERROR', `Tabla GPS no existe: ${process.env.BIGQUERY_GPS_TABLE_ID}`);
      } else {
        this.log('✅ OK', `Tabla GPS existe: ${process.env.BIGQUERY_GPS_TABLE_ID}`);
        
        // Verificar esquema GPS
        const [gpsMetadata] = await gpsTable.getMetadata();
        const gpsFields = gpsMetadata.schema.fields.map(f => f.name);
        const requiredGpsFields = ['deviceId', 'lat', 'lng', 'timestamp'];
        
        requiredGpsFields.forEach(field => {
          if (gpsFields.includes(field)) {
            this.log('✅ OK', `Campo GPS encontrado: ${field}`);
          } else {
            this.log('❌ ERROR', `Campo GPS faltante: ${field}`);
          }
        });
      }

      const mobileTable = dataset.table(process.env.BIGQUERY_MOBILE_TABLE_ID);
      const [mobileExists] = await mobileTable.exists();
      
      if (!mobileExists) {
        this.log('❌ ERROR', `Tabla Mobile no existe: ${process.env.BIGQUERY_MOBILE_TABLE_ID}`);
      } else {
        this.log('✅ OK', `Tabla Mobile existe: ${process.env.BIGQUERY_MOBILE_TABLE_ID}`);
        
        // Verificar esquema Mobile
        const [mobileMetadata] = await mobileTable.getMetadata();
        const mobileFields = mobileMetadata.schema.fields.map(f => f.name);
        const requiredMobileFields = ['userId', 'lat', 'lng', 'timestamp'];
        
        requiredMobileFields.forEach(field => {
          if (mobileFields.includes(field)) {
            this.log('✅ OK', `Campo Mobile encontrado: ${field}`);
          } else {
            this.log('❌ ERROR', `Campo Mobile faltante: ${field}`);
          }
        });
      }

    } catch (error) {
      this.log('❌ ERROR', `Error de conexión BigQuery: ${error.message}`);
    }
  }

  checkPackageJson() {
    console.log('\n📦 Verificando package.json...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Verificar dependencias requeridas
      const requiredDeps = [
        '@google-cloud/bigquery',
        'express',
        'cors',
        'helmet',
        'dotenv',
        'express-rate-limit'
      ];

      requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          this.log('✅ OK', `Dependencia encontrada: ${dep}@${packageJson.dependencies[dep]}`);
        } else {
          this.log('❌ ERROR', `Dependencia faltante: ${dep}`);
        }
      });

      // Verificar scripts
      const requiredScripts = ['start'];
      const recommendedScripts = ['dev', 'test'];

      requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.log('✅ OK', `Script encontrado: ${script}`);
        } else {
          this.log('❌ ERROR', `Script faltante: ${script}`);
        }
      });

      recommendedScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.log('✅ OK', `Script recomendado encontrado: ${script}`);
        } else {
          this.log('💡 RECOMMENDATION', `Agregar script recomendado: ${script}`);
        }
      });

      // Verificar configuración de módulos ES
      if (packageJson.type === 'module') {
        this.log('✅ OK', 'Configurado para módulos ES (type: "module")');
      } else {
        this.log('⚠️ WARNING', 'No configurado para módulos ES - puede causar problemas con imports');
      }

    } catch (error) {
      this.log('❌ ERROR', `Error leyendo package.json: ${error.message}`);
    }
  }

  checkSecurityConfiguration() {
    console.log('\n🔒 Verificando configuración de seguridad...');
    
    // API Key
    if (!process.env.API_KEY) {
      this.log('⚠️ WARNING', 'API_KEY no configurada - la API estará abierta sin autenticación');
      this.log('💡 RECOMMENDATION', 'Configurar API_KEY para producción');
    } else {
      this.log('✅ OK', 'API_KEY configurada');
      if (process.env.API_KEY.length < 32) {
        this.log('⚠️ WARNING', 'API_KEY parece ser muy corta - usar al menos 32 caracteres');
      }
    }

    // Rate limiting
    const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW) || 900000;
    const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX) || 100;
    
    this.log('✅ OK', `Rate limiting: ${rateLimitMax} requests per ${rateLimitWindow/1000/60} minutes`);
    
    if (rateLimitMax > 1000) {
      this.log('⚠️ WARNING', 'Rate limit muy alto - considerar reducir para producción');
    }

    // NODE_ENV
    if (process.env.NODE_ENV === 'production') {
      this.log('✅ OK', 'NODE_ENV configurado para producción');
    } else {
      this.log('⚠️ WARNING', 'NODE_ENV no está en producción - errores detallados serán visibles');
    }
  }

  checkProductionReadiness() {
    console.log('\n🚀 Verificando preparación para producción...');
    
    // Archivos sensibles
    if (fs.existsSync('service-account.json')) {
      this.log('⚠️ WARNING', 'service-account.json presente - asegurar que esté en .gitignore');
    }

    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      const sensitiveFiles = ['service-account.json', '.env', 'node_modules'];
      
      sensitiveFiles.forEach(file => {
        if (gitignore.includes(file)) {
          this.log('✅ OK', `${file} está en .gitignore`);
        } else {
          this.log('❌ ERROR', `${file} NO está en .gitignore - riesgo de seguridad`);
        }
      });
    }

    // Logging
    if (!process.env.LOG_LEVEL) {
      this.log('💡 RECOMMENDATION', 'Configurar LOG_LEVEL para mejor control de logs');
    }

    // Host configuration
    if (process.env.HOST === 'localhost') {
      this.log('⚠️ WARNING', 'HOST configurado como localhost - cambiar para producción');
    }
  }

  generateReport() {
    console.log('\n📊 RESUMEN DE CONFIGURACIÓN');
    console.log('='.repeat(50));
    
    console.log(`\n✅ Configuración correcta: ${this.issues.length === 0 ? 'SÍ' : 'NO'}`);
    console.log(`❌ Errores críticos: ${this.issues.length}`);
    console.log(`⚠️ Advertencias: ${this.warnings.length}`);
    console.log(`💡 Recomendaciones: ${this.recommendations.length}`);

    if (this.issues.length > 0) {
      console.log('\n❌ ERRORES CRÍTICOS QUE DEBEN CORREGIRSE:');
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ ADVERTENCIAS:');
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    if (this.recommendations.length > 0) {
      console.log('\n💡 RECOMENDACIONES:');
      this.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(50));
    
    if (this.issues.length === 0) {
      console.log('🎉 ¡El proyecto está correctamente configurado!');
    } else {
      console.log('🔧 Corrige los errores críticos antes de usar en producción');
    }
  }

  async analyze() {
    console.log('🔍 ANALIZANDO CONFIGURACIÓN DEL PROYECTO GPS QUERY API');
    console.log('='.repeat(60));

    this.checkProjectStructure();
    this.checkEnvironmentVariables();
    this.checkPackageJson();
    await this.checkBigQueryConnection();
    this.checkSecurityConfiguration();
    this.checkProductionReadiness();
    
    this.generateReport();
  }
}

// Ejecutar análisis
const analyzer = new ConfigurationAnalyzer();
analyzer.analyze().catch(console.error);
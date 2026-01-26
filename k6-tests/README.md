# 🧪 K6 Load Tests - ONLYDJS

Tests de carga para verificar la capacidad del sistema de storage/upload/download de ONLYDJS.

---

## 📦 Instalación de K6

### macOS
```bash
brew install k6
```

### Linux (Debian/Ubuntu)
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Windows (con Chocolatey)
```bash
choco install k6
```

### Docker
```bash
docker pull grafana/k6
```

---

## 🚀 Ejecutar Tests

### Test 1: 100 Usuarios Concurrentes (Load Test)

**Duración:** ~12 minutos  
**Objetivo:** Verificar performance normal del sistema

```bash
k6 run load-test-100-users.js
```

Con URL personalizada:
```bash
k6 run --env BASE_URL=https://onlydjs.com load-test-100-users.js
```

**Métricas esperadas:**
- P95 Response Time: < 2 segundos
- Error Rate: < 10%
- Failed Requests: < 5%

---

### Test 2: 1000 Usuarios Concurrentes (Stress Test)

**Duración:** ~21 minutos  
**Objetivo:** Encontrar límites del sistema

```bash
k6 run load-test-1000-users.js
```

Con URL personalizada:
```bash
k6 run --env BASE_URL=https://onlydjs.com load-test-1000-users.js
```

**Métricas esperadas:**
- P95 Response Time: < 5 segundos (relajado para stress test)
- Error Rate: < 20%
- Failed Requests: < 15%

---

## 📊 Interpretar Resultados

### Métricas Clave

| Métrica | Descripción | Objetivo |
|---------|-------------|----------|
| `http_req_duration` | Tiempo total de respuesta | P95 < 2s (normal), P95 < 5s (stress) |
| `http_req_failed` | Porcentaje de requests fallidos | < 5% (normal), < 15% (stress) |
| `errors` | Tasa de errores custom | < 10% (normal), < 20% (stress) |
| `http_reqs` | Requests por segundo | Cuanto más alto, mejor |

### Códigos de Estado

- **200-299:** ✅ Éxito
- **300-399:** ⚠️ Redirecciones (normal)
- **400-499:** ❌ Errores del cliente (verificar validación)
- **500-599:** 🔥 Errores del servidor (CRÍTICO)

---

## 🔍 Análisis de Resultados

### Resultado Excelente ✅
```
Total Requests:      50,000
Failed Requests:     0.5%
Error Rate:          2%
Avg Response Time:   450ms
P95 Response Time:   1,200ms
```

**Acción:** Sistema listo para producción

---

### Resultado Aceptable ⚠️
```
Total Requests:      50,000
Failed Requests:     8%
Error Rate:          12%
Avg Response Time:   1,200ms
P95 Response Time:   3,500ms
```

**Acción:** Optimizar queries lentas, revisar índices de DB

---

### Resultado Crítico ❌
```
Total Requests:      50,000
Failed Requests:     25%
Error Rate:          30%
Avg Response Time:   5,000ms
P95 Response Time:   10,000ms
```

**Acción:** Sistema sobrecargado, requiere optimización urgente

---

## 🛠️ Optimizaciones Comunes

### Si P95 > 2 segundos:
1. Agregar índices a DB (tracks, downloads, users)
2. Implementar cache de queries frecuentes
3. Optimizar queries N+1
4. Habilitar CDN para assets estáticos

### Si Error Rate > 10%:
1. Revisar logs de servidor (`server/logs/`)
2. Verificar límites de conexiones de DB
3. Aumentar timeout de requests
4. Implementar circuit breaker

### Si Failed Requests > 5%:
1. Verificar límites de rate limiting
2. Revisar manejo de errores en endpoints
3. Aumentar recursos del servidor (CPU/RAM)
4. Implementar queue para operaciones pesadas

---

## 📈 Monitoreo Continuo

### Ejecutar tests periódicamente:

```bash
# Diario (load test ligero)
k6 run --duration 5m --vus 50 load-test-100-users.js

# Semanal (stress test completo)
k6 run load-test-1000-users.js

# Antes de cada deploy
k6 run load-test-100-users.js
```

---

## 🎯 Escenarios de Test

### Test 1: 100 Usuarios
- **40%** - Navegan y exploran tracks
- **30%** - Reproducen audio (streaming)
- **30%** - Descargan tracks

### Test 2: 1000 Usuarios
- **40%** - Navegan (homepage, explore, tracks list)
- **30%** - Streaming de audio
- **30%** - Verifican límites y descargan

---

## 📝 Notas

- Los tests asumen que existen tracks en la DB (IDs 1-10)
- Para tests de upload, usar scripts separados (requiere archivos de prueba)
- Los resultados varían según hardware y red
- Ejecutar tests en horarios de bajo tráfico para resultados precisos

---

## 🔗 Referencias

- [K6 Documentation](https://k6.io/docs/)
- [K6 Best Practices](https://k6.io/docs/testing-guides/test-types/)
- [K6 Metrics Reference](https://k6.io/docs/using-k6/metrics/)

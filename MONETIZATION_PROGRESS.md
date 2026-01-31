# Sistema de Monetización Profesional - Progreso

## 📊 Resumen General

Este documento detalla el progreso de la implementación del sistema completo de monetización profesional para ONLYDJS, que incluye:

1. **Sistema de Membresía Stripe** - Suscripciones recurrentes PRO ($4.99/mes)
2. **Control de Límites de Descarga** - 20 descargas diarias, 3 por track
3. **Modelo de Ganancias Híbrido** - Split 50/50 con distribución por descargas + score
4. **Wallet para DJs** - Balance, historial, pagos automáticos
5. **Stripe Connect** - Pagos a DJs con KYC
6. **Sistema Anti-Fraude** - Detección de VPN, bots, patrones anómalos
7. **Cron Mensual** - Cálculo y distribución automática de ganancias
8. **Dashboard DJ Extendido** - Métricas financieras completas

---

## ✅ Completado (Fase 1 y parte de Fase 2)

### 1. Base de Datos (100% Completado)

**Tablas Creadas:**

- ✅ **subscriptions** - Gestión de suscripciones Stripe
  - userId, stripeSubscriptionId, stripeCustomerId, stripePriceId
  - status (active, canceled, past_due, unpaid, trialing)
  - currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd

- ✅ **download_limits** - Control diario de descargas
  - userId, date, downloadsCount
  - trackDownloads (JSON: {trackId: count})
  - Índice único por userId + date

- ✅ **monthly_revenue_pools** - Pools mensuales de ingresos
  - month, totalRevenue, platformShare (50%), djsShare (50%)
  - downloadsPool (30% of djsShare), scorePool (20% of djsShare)
  - totalDownloads, totalDJScore, valuePerDownload
  - status (calculating, completed, paid)

- ✅ **dj_scores** - Métricas mensuales de impacto por DJ
  - userId, month
  - totalDownloads, totalStreams, totalMinutesListened
  - totalFavorites, totalPlaylistAdds
  - downloadsScore (40%), streamsScore (30%), listeningTimeScore (20%), engagementScore (10%)
  - djScore (calculado), participationPercentage
  - downloadEarnings, scoreEarnings, totalEarnings

- ✅ **device_fingerprints** - Anti-fraude avanzado
  - fingerprintHash, ipAddress, userAgent
  - deviceType, browser, os, screenResolution, timezone, language
  - isVPN, isProxy, isTor, isBot, botScore
  - isSuspicious, isBlocked, blockReason
  - firstSeenAt, lastSeenAt, activityCount

- ✅ **streaming_activity** - Tracking de reproducción
  - userId, trackId, artistId
  - durationSeconds, completionPercentage
  - sessionId, ipAddress, device
  - isSuspicious

**Helpers de Base de Datos Creados:**

```typescript
// Subscriptions
- createSubscription()
- updateSubscription()
- getSubscriptionByUserId()
- getSubscriptionByStripeId()

// Download Limits
- getDownloadLimitToday()
- createOrUpdateDownloadLimit() // Con verificación de límites

// Revenue Pools
- getRevenuePoolByMonth()
- createRevenuePool()
- updateRevenuePool()

// DJ Scores
- getDJScoreByMonth()
- createOrUpdateDJScore()
- getAllDJScoresForMonth()

// Streaming Activity
- recordStreamingActivity()
- getStreamingStatsByArtist()

// Device Fingerprints
- createDeviceFingerprint()
- getDeviceFingerprintByHash()
- updateDeviceFingerprint()
```

### 2. Sistema de Membresía Stripe (70% Completado)

**Archivos Creados:**

- ✅ **server/stripe-products.ts** - Configuración de productos
  ```typescript
  STRIPE_PRODUCTS.PRO = {
    name: "ONLYDJS PRO",
    price: 4.99,
    interval: "month",
    features: [
      "Streaming ilimitado",
      "20 descargas diarias",
      "Acceso total al catálogo",
      "DJ Mode completo",
      // ... más features
    ]
  }
  
  DOWNLOAD_LIMITS = {
    FREE: { DAILY: 0, PER_TRACK_DAILY: 0 },
    PRO: { DAILY: 20, PER_TRACK_DAILY: 3 }
  }
  ```

- ✅ **server/routers/subscriptions.router.ts** - Router tRPC completo
  ```typescript
  subscriptionsRouter = {
    getStatus: protectedProcedure.query() // Estado actual
    createCheckoutSession: protectedProcedure.mutation() // Crear pago
    createPortalSession: protectedProcedure.mutation() // Portal gestión
    cancelSubscription: protectedProcedure.mutation() // Cancelar
    reactivateSubscription: protectedProcedure.mutation() // Reactivar
  }
  ```

**Procedures Implementados:**

1. ✅ **getStatus** - Obtiene estado de suscripción del usuario
   - Retorna: status, plan, currentPeriodEnd, cancelAtPeriodEnd

2. ✅ **createCheckoutSession** - Crea sesión de pago Stripe
   - Verifica si ya tiene suscripción activa
   - Crea/obtiene Stripe customer
   - Genera checkout session con metadata completa
   - Retorna URL de pago

3. ✅ **createPortalSession** - Portal de gestión de suscripción
   - Verifica suscripción existente
   - Genera portal session de Stripe
   - Retorna URL del portal

4. ✅ **cancelSubscription** - Cancela al final del período
   - Actualiza en Stripe y DB
   - Mantiene acceso hasta fin de período

5. ✅ **reactivateSubscription** - Reactiva suscripción cancelada
   - Remueve flag de cancelación
   - Usuario mantiene acceso continuo

---

## ⏳ Pendiente (Fases 2-9)

### Fase 2: Sistema de Membresía Stripe (30% restante)

- [ ] Agregar subscriptionsRouter al appRouter principal
- [ ] Implementar webhook /api/stripe/webhook
- [ ] Handlers para eventos:
  - [ ] subscription.created
  - [ ] subscription.updated
  - [ ] subscription.deleted
  - [ ] invoice.paid
  - [ ] invoice.payment_failed
- [ ] Actualizar membershipStatus automáticamente
- [ ] Crear página frontend de gestión de suscripción
- [ ] Agregar botón "Cancelar Suscripción" en dashboard
- [ ] Integrar en UI de Membership.tsx

### Fase 3: Sistema de Límites de Descarga

- [ ] Integrar createOrUpdateDownloadLimit() en downloads.router.ts
- [ ] Agregar verificación antes de cada descarga
- [ ] Implementar UI de límites en Explore
- [ ] Mostrar "X/20 descargas disponibles hoy"
- [ ] Bloquear botón de descarga al alcanzar límite
- [ ] Toast informativo al alcanzar límite
- [ ] Reset automático diario (cron o verificación en runtime)

### Fase 4: Modelo de Ganancias Híbrido

**Fórmulas a Implementar:**

```typescript
// Pool mensual
POOL_DJS = INGRESO_TOTAL × 0.50
POOL_DESCARGAS = POOL_DJS × 0.30
POOL_SCORE = POOL_DJS × 0.20

// Valor por descarga
VALOR_POR_DESCARGA = POOL_DESCARGAS / TOTAL_DESCARGAS

// DJ Score
DJ_SCORE = (DESCARGAS × 40%) + (STREAMS × 30%) + 
           (MINUTOS_ESCUCHADOS × 20%) + 
           (FAVORITOS + PLAYLISTS × 10%)

// Ganancia DJ
GANANCIA_DJ = (DESCARGAS_DJ × VALOR_POR_DESCARGA) + 
              ((DJ_SCORE / TOTAL_SCORE) × POOL_SCORE)
```

**Tareas:**

- [ ] Crear función calculateMonthlyRevenue()
- [ ] Crear función calculateDJScore()
- [ ] Crear función calculateDownloadValue()
- [ ] Crear función calculateDJEarnings()
- [ ] Implementar tracking completo de métricas
- [ ] Tests de fórmulas matemáticas

### Fase 5: Wallet para DJs y Stripe Connect

- [ ] Extender tabla wallets existente
- [ ] Implementar Stripe Connect onboarding
- [ ] KYC obligatorio para DJs
- [ ] Balance disponible vs pendiente
- [ ] Historial de transacciones
- [ ] Métodos de retiro
- [ ] Página de wallet en dashboard

### Fase 6: Sistema Anti-Fraude Avanzado

- [ ] Integrar device fingerprinting en frontend
- [ ] Implementar detección de VPN/Proxy
- [ ] Bot detection con scoring
- [ ] Análisis de patrones anómalos
- [ ] Bloqueo automático por abuso
- [ ] Dashboard de fraude para admin
- [ ] Alertas automáticas

### Fase 7: Cron Mensual Automático

- [ ] Crear script de cálculo mensual
- [ ] Implementar cron job (1ro de cada mes)
- [ ] Proceso automático:
  1. Calcular ingresos reales del mes
  2. Aplicar split financiero (50/50)
  3. Calcular DJ Scores de todos los DJs
  4. Calcular ganancias individuales
  5. Actualizar wallets
  6. Ejecutar payouts automáticos
- [ ] Logs y auditoría completa
- [ ] Notificaciones a DJs

### Fase 8: Dashboard DJ Extendido

**Métricas a Agregar:**

- [ ] Descargas mensuales
- [ ] Streams totales
- [ ] Minutos escuchados
- [ ] DJ Score actual
- [ ] % participación en pool
- [ ] Ganancia mensual
- [ ] Wallet balance
- [ ] Historial de pagos
- [ ] Gráficas de tendencias
- [ ] Proyección de ganancias

### Fase 9: Testing Completo

- [ ] Tests de suscripciones Stripe
- [ ] Tests de límites de descarga
- [ ] Tests de cálculo de ganancias
- [ ] Tests de fórmulas matemáticas
- [ ] Tests de anti-fraude
- [ ] Tests de cron mensual
- [ ] Tests de wallet
- [ ] Tests de integración end-to-end

---

## 📁 Archivos Modificados/Creados

### Nuevos Archivos:
- `drizzle/schema.ts` (extendido con 6 tablas nuevas)
- `server/stripe-products.ts` (configuración de productos)
- `server/routers/subscriptions.router.ts` (router de suscripciones)
- `server/db.ts` (extendido con helpers para nuevas tablas)

### Archivos a Modificar:
- `server/routers.ts` (agregar subscriptionsRouter)
- `server/routers/downloads.router.ts` (integrar límites)
- `client/src/pages/Membership.tsx` (integrar suscripciones)
- `client/src/pages/Dashboard.tsx` (agregar métricas financieras)
- `client/src/pages/Explore.tsx` (mostrar límites de descarga)

---

## 🎯 Próximos Pasos Recomendados

1. **Completar Fase 2** (Webhooks de Stripe)
   - Crítico para que las suscripciones funcionen correctamente
   - Implementar webhook handler completo
   - Probar con eventos de test de Stripe

2. **Implementar Fase 3** (Límites de Descarga)
   - Funcionalidad core para el modelo de negocio
   - Integrar en flujo de descarga existente
   - Agregar UI informativa

3. **Crear Productos en Stripe Dashboard**
   - Crear producto "ONLYDJS PRO" en Stripe
   - Crear precio $4.99/mes recurrente
   - Copiar IDs a variables de entorno

4. **Frontend de Suscripciones**
   - Página de gestión de suscripción
   - Botones de upgrade/cancel
   - Estado de suscripción en dashboard

5. **Testing Exhaustivo**
   - Probar flujo completo de suscripción
   - Probar límites de descarga
   - Probar webhooks con Stripe CLI

---

## 💡 Notas Técnicas

### Consideraciones de Stripe:
- API Version: `2025-12-15.clover`
- Webhooks deben verificar firma
- Test events tienen ID `evt_test_*`
- Requiere respuesta `{verified: true}` para test events

### Consideraciones de Base de Datos:
- Todas las tablas usan timestamps automáticos
- Índices optimizados para queries frecuentes
- Unique constraints para prevenir duplicados
- Decimal(12,2) para montos monetarios

### Consideraciones de Seguridad:
- Device fingerprinting para anti-fraude
- VPN/Proxy detection
- Bot scoring
- Rate limiting en descargas
- Validación de referer y tokens

---

## 📞 Contacto para Continuar

Este sistema es extenso y profesional. Se recomienda continuar la implementación en sesiones enfocadas por fase:

- **Sesión 1**: Completar webhooks y frontend de suscripciones
- **Sesión 2**: Implementar límites de descarga y UI
- **Sesión 3**: Modelo de ganancias y fórmulas
- **Sesión 4**: Wallet y Stripe Connect
- **Sesión 5**: Anti-fraude y cron mensual
- **Sesión 6**: Dashboard extendido y testing

**Estado Actual**: Base sólida completada, listo para continuar con integraciones.

# ONLYDJS - Lista de Tareas del Proyecto

## 1. Sistema de Autenticación y Usuarios
- [x] Configurar OAuth con múltiples proveedores (Google, Facebook, Apple, Twitter, Discord, TikTok)
- [x] Implementar tres roles de usuario: Free, DJ Miembro, DJ Verificado
- [x] Sistema de permisos basado en roles
- [ ] Protección 2FA opcional

## 2. Sistema de Membresías
- [x] Integrar Stripe para pagos de $4.99 USD/mes
- [x] Configurar webhooks de Stripe para renovación automática
- [x] Control de acceso dinámico según membresía activa
- [x] Página de suscripción y gestión de membresía
- [x] Cancelación automática de membresía

## 3. Base de Datos y Esquema
- [x] Tabla de usuarios con roles y membresías
- [x] Tabla de tracks con metadatos completos
- [x] Tabla de descargas para tracking y monetización
- [x] Tabla de ganancias y wallets de DJs
- [x] Tabla de playlists y favoritos
- [x] Índices y optimizaciones de rendimiento

## 4. Sistema de Subida de Tracks
- [ ] Formulario de subida con todos los metadatos
- [ ] Validación de formatos (MP3 320kbps y WAV)
- [ ] Subida de imagen cover
- [ ] Almacenamiento en S3
- [ ] Procesamiento con FFmpeg para conversión
- [ ] Generación de waveforms visuales
- [ ] Detección automática de BPM y Key con IA

## 5. Clasificación y Filtros
- [ ] Sistema de géneros (Tech House, Bass House, Afro House, etc.)
- [ ] Sistema de subgéneros
- [ ] Tipos de track (Extended Mix, Edit, Mashup, Remix, Rework)
- [ ] Filtros por BPM, Key, energía, fecha
- [ ] Filtro de trending y popularidad
- [ ] Sistema de etiquetas personalizadas

## 6. Sección MAINSTAGE EDITS
- [ ] Categorías por género (Tech House Mainstage, Bass House Mainstage, etc.)
- [ ] Etiquetas especiales (Festival Weapon, Peak Time, Massive Drop, etc.)
- [ ] Vista exclusiva para miembros premium
- [ ] Sistema de curación y destacados

## 7. Reproductor Profesional
- [ ] Preview de 90 segundos
- [ ] Visualización de waveform
- [ ] Display de BPM y Key
- [ ] Controles de reproducción
- [ ] Sistema de playlist
- [ ] Botón de descarga (solo para miembros)

## 8. Sistema de Descargas
- [ ] API centralizada de descargas
- [ ] Registro de cada descarga con metadatos
- [ ] Tracking de IP, país, dispositivo
- [ ] Generación de eventos analíticos
- [ ] Watermark inaudible en archivos descargados
- [ ] Control de acceso según membresía

## 9. Sistema de Monetización
- [ ] Cálculo de revenue pool mensual (60% DJs / 40% plataforma)
- [ ] Fórmula de distribución basada en descargas
- [ ] Wallet DJ con balance disponible y pendiente
- [ ] Historial de pagos y descargas
- [ ] Métodos de retiro (PayPal, Stripe, transferencia)
- [ ] Dashboard de ganancias en tiempo real

## 10. Dashboard DJ
- [ ] Estadísticas de descargas diarias
- [ ] Gráficos de ganancias
- [ ] Ranking personal
- [ ] Tracks más descargados
- [ ] Estadísticas mensuales y anuales
- [ ] Gestión de tracks subidos

## 11. Sistema de Rankings
- [ ] Top 100 DJs por descargas
- [ ] Top 50 Mainstage Edits
- [ ] Trending tracks (últimas 24h/7d/30d)
- [ ] Festival Weapons destacados
- [ ] Actualización en tiempo real

## 12. IA Musical
- [ ] Detección automática de BPM
- [ ] Detección automática de Key
- [ ] Análisis de drops y builds
- [ ] Análisis de energía
- [ ] Recomendaciones de tracks compatibles
- [ ] Generación automática de playlists

## 13. Sistema Antifraude
- [ ] Detección de bots
- [ ] Límites por IP
- [ ] Análisis de comportamiento
- [ ] Bloqueo automático de cuentas sospechosas
- [ ] Sistema de reportes de abuso

## 14. Diseño UX/UI
- [x] Configurar dark mode como tema principal
- [x] Paleta de colores neon (inspirado en club/festival)
- [x] Tipografía moderna y legible
- [x] Animaciones y transiciones fluidas
- [x] Diseño responsive para móviles
- [x] Inspiración visual de DJcity + Beatport + Tomorrowland

## 15. Páginas y Navegación
- [x] Landing page con hero y features
- [x] Página de exploración de tracks
- [x] Página de MAINSTAGE EDITS
- [x] Página de rankings
- [ ] Perfil de DJ
- [x] Dashboard de usuario
- [x] Página de suscripción
- [ ] Página de términos y privacidad

## 16. Testing y Optimización
- [ ] Tests unitarios con Vitest
- [ ] Tests de integración de pagos
- [ ] Tests de sistema de descargas
- [ ] Optimización de rendimiento
- [ ] Seguridad y validación de datos

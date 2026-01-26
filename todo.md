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


## 17. Sistema de Análisis Musical con IA (NUEVO)
- [x] Investigar y seleccionar API de análisis musical (usando LLM con structured output)
- [x] Implementar servicio backend para análisis de audio
- [x] Detección automática de BPM
- [x] Detección automática de clave musical (Key)
- [x] Análisis de estructura de canción (intro, build, drop, breakdown, outro)
- [x] Detección de energía y mood
- [x] Integrar análisis en flujo de subida de tracks
- [x] Actualizar UI para mostrar resultados del análisis
- [ ] Crear tests de integración para análisis musical


## 18. Sistema de Almacenamiento S3 para Archivos de Música (NUEVO)
- [x] Implementar endpoint de subida de archivos de audio
- [x] Validación de formato (MP3 320kbps, WAV)
- [x] Validación de tamaño de archivo (máximo 100MB)
- [x] Integrar storagePut para subida a S3
- [x] Generar nombres únicos de archivo con sufijos aleatorios
- [x] Implementar subida de imágenes cover
- [x] Actualizar frontend Upload con subida real de archivos
- [x] Mostrar progreso de subida
- [x] Manejo de errores de subida
- [ ] Crear tests de integración para subida de archivos


## 19. Mejoras de UI Home (NUEVO)
- [x] Agregar botón "Upload Your Files" extendido en hero de Home
- [x] Posicionar al lado del botón de suscribirse
- [x] Diseño consistente con tema neon


## 20. Sistema de Perfiles Públicos para DJs (NUEVO)
- [x] Extender tabla users con campos de perfil (bio, profileImage, username único)
- [x] Crear router tRPC para obtener perfil público por username
- [x] Crear router tRPC para editar perfil propio
- [x] Implementar subida de foto de perfil a S3
- [x] Página de perfil público /dj/[username]
- [x] Mostrar biografía, foto de perfil, estadísticas
- [x] Galería de tracks subidos por el DJ
- [x] Estadísticas: total descargas, ganancias, ranking
- [x] Géneros principales del DJ
- [x] Página de edición de perfil /profile/edit
- [x] Integrar enlaces a perfiles en Navbar con dropdown menu
- [x] Crear tests de perfiles públicos


## 21. Sistema de Búsqueda Avanzada con Filtros (NUEVO)
- [x] Crear router tRPC para búsqueda avanzada con filtros múltiples
- [x] Implementar filtro de BPM con rango (min/max)
- [x] Implementar filtro de clave musical (Key) con todas las opciones
- [x] Implementar filtro de género (selección múltiple)
- [x] Implementar filtro de tipo de pista (Extended Mix, Edit, Mashup, etc.)
- [x] Implementar filtro de energía (rango 0-100)
- [x] Búsqueda por texto (título, artista)
- [x] Componente AdvancedFilters con sliders y selects
- [x] Integrar filtros en página Explore
- [ ] Persistencia de filtros en URL query params
- [x] Crear tests de búsqueda avanzada


## 22. Sistema de Preview de Audio y Descargas (NUEVO)
- [x] Crear router tRPC para descargas con verificación de membresía
- [x] Implementar descarga en formato MP3 320kbps
- [x] Implementar descarga en formato WAV
- [x] Registrar descargas en base de datos para monetización
- [x] Componente AudioPlayer para preview de 1 minuto
- [x] Controles de reproducción (play/pause/seek/volumen)
- [x] Límite de 1 minuto para usuarios Free
- [x] Acceso completo para miembros
- [x] Componente DownloadButton con selector de formato
- [x] Dropdown con opciones MP3/WAV
- [x] Verificación de membresía antes de descargar
- [x] Mensaje de upgrade para usuarios Free
- [x] Integrar player en tarjetas de tracks
- [x] Integrar botón de descarga en todas las páginas
- [x] Crear tests de preview y descargas

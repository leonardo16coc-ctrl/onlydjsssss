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


## 23. Mejoras de Página Upload (NUEVO)
- [x] Implementar subida funcional de archivos de audio
- [x] Pre-escucha de audios antes de subir
- [x] Reproductor integrado para archivos cargados
- [x] Botón de Upload con verificación de membresía
- [x] Redirección a página de membresía para usuarios Free
- [x] Mensaje claro de que se requiere membresía para subir


## 24. Arreglos Críticos de Funcionalidad Core (URGENTE)
- [x] Arreglar botón de subir archivo que no avanza
- [x] Verificar endpoints de subida /api/upload/audio y /api/upload/cover
- [x] Agregar visualización de forma de onda (waveform) del audio subido
- [x] Implementar análisis automático de BPM al terminar subida
- [x] Auto-completar etiquetas y metadatos después del análisis
- [x] Verificar que preview de 1 minuto funcione correctamente
- [x] Verificar que descargas MP3/WAV funcionen correctamente
- [x] Probar flujo completo: subir → ver waveform → analizar → publicar → descargar


## 25. Mejora de Conversión en Upload (NUEVO)
- [x] Permitir subida de archivos a todos los usuarios (Free y miembros)
- [x] Permitir ver forma de onda a todos
- [x] Permitir reproducir y revisar audio a todos
- [x] Permitir análisis con IA a todos
- [x] Mover verificación de membresía solo al botón final "Publicar Track"
- [x] Mostrar mensaje de upgrade solo al intentar publicar
- [x] Eliminar restricciones en campos del formulario para usuarios Free


## 26. Modificar Preview en Upload (NUEVO)
- [ ] Modificar WaveformPlayer para reproducir track completo sin límite
- [ ] Eliminar restricción de 1 minuto en página Upload
- [ ] Mantener límite de 1 minuto solo en AudioPlayer de Explore


## 27. Notificación de Límite de Preview (NUEVO)
- [x] Agregar toast visual cuando se alcance el límite de 1 minuto
- [x] Agregar sonido de notificación al alcanzar el límite
- [x] Incluir botón de suscripción en el toast
- [x] Prevenir múltiples notificaciones en la misma sesión de reproducción


## 28. Mejora de Precisión de Análisis Musical con IA (NUEVO)
- [x] Mejorar prompts de IA para máxima precisión en BPM y Key
- [x] Agregar validación de rangos de BPM (60-200)
- [ ] Agregar soporte para formato FLAC de alta calidad
- [ ] Actualizar validación de archivos en frontend y backend
- [ ] Optimizar análisis para archivos WAV sin pérdida
- [ ] Crear tests de precisión de análisis


## 29. Eliminar Restricción de Membresía en Análisis IA (NUEVO)
- [x] Verificar router de análisis musical (musicAnalysis.analyze)
- [x] Cambiar de protectedProcedure a publicProcedure si está restringido
- [x] Asegurar que análisis funcione para todos los usuarios
- [x] Mantener restricción solo en publicación de tracks


## 30. DJ MODE - DJ Intelligence Platform (NUEVO - PREMIUM) ✅

### Módulo 1: DJ PROFILE ENGINE (Perfil Inteligente)
- [x] Crear tabla `dj_profiles` en base de datos
- [x] Crear tabla `dj_activity` para tracking de comportamiento
- [x] Análisis automático de tracks descargados
- [x] Análisis automático de tracks reproducidos
- [x] Detección de géneros más usados
- [x] Cálculo de BPM promedio y rango favorito
- [x] Análisis de tonalidades preferidas (Camelot Wheel)
- [x] Cálculo de nivel energético promedio
- [x] Historial de actividad con timestamps
- [x] Perfil dinámico que se actualiza en tiempo real
- [x] Router tRPC para DJ Profile Engine

### Módulo 2: SMART DJ SUGGESTIONS (Recomendaciones Inteligentes)
- [x] Sistema de recomendaciones basado en perfil DJ
- [x] Algoritmo de compatibilidad BPM + Key + Energía
- [x] Sugerencias de edits ideales por momento:
  - [x] Warmup (energía baja, BPM progresivo)
  - [x] Peak Time (energía alta, drops masivos)
  - [x] Closing (energía descendente, emocional)
  - [x] Festival / Mainstage (anthems, crowd control)
- [x] Sistema de trending + predicción de próximas bombas
- [x] Secciones UI:
  - [x] "🔥 Recomendado para ti"
  - [x] "🎯 Sets sugeridos"
  - [x] "🚀 Próximas bombas"
- [x] Router tRPC para Smart Suggestions

### Módulo 3: AUTO SET BUILDER PRO (Generador Automático de Sets)
- [x] Interfaz para subir hasta 10 tracks
- [x] Análisis completo con IA:
  - [x] BPM de cada track
  - [x] Key y compatibilidad armónica (Camelot)
  - [x] Energía de cada track
  - [x] Flow y transiciones
  - [x] Curva emocional del set
- [x] Algoritmo de ordenamiento óptimo de tracks
- [x] Generación de curva energética profesional
- [x] Sugerencias de transiciones entre tracks
- [x] Timing sugerido para cada track
- [x] Visualización de resultados:
  - [x] Playlist ordenada con información completa
  - [x] Estadísticas de set (BPM promedio, compatibilidad)
  - [x] Sugerencias de mezcla por track
  - [x] Compatibilidad armónica calculada
- [x] Almacenamiento de sets generados en base de datos
- [x] Router tRPC para Auto Set Builder

### UI y Navegación
- [x] Agregar botón "🎛 DJ MODE" en navegación principal
- [x] Diseño futurista del dashboard DJ MODE
- [x] Panel de inteligencia DJ con métricas
- [x] Tabs para 3 módulos principales
- [x] Visualización de compatibilidad armónica
- [x] Cards de recomendaciones dinámicas
- [x] Interfaz de Auto Set Builder
- [x] Animaciones y efectos neon premium
- [x] Responsive design para móviles

### Testing
- [x] Tests de DJ Profile Engine (20 tests pasando)
- [x] Tests de Smart Suggestions
- [x] Tests de Auto Set Builder
- [x] Tests de integración completa


## 31. Mejoras Premium de DJ MODE (GAME CHANGERS) 🚀

### 1. Visualización de Curva Energética (ULTRA PRO)
- [ ] Instalar Recharts para gráficas interactivas
- [ ] Crear componente EnergyFlowChart
- [ ] Mostrar curva energética en sets generados
- [ ] Puntos por track con tooltips informativos
- [ ] Visualización de fases: Warmup → Build → Peak → Sustain → Closing
- [ ] Colores neon consistentes con tema (cyan/purple/pink)
- [ ] Animaciones suaves al cargar gráfica

### 2. Sugerencias de Transiciones DJ (DIFERENCIADOR TOTAL)
- [ ] Extender schema de auto_sets con campo transitions
- [ ] Generar sugerencias de transición con IA por cada par de tracks
- [ ] Tipos de transiciones: Loop 8 beats, Echo out, Backspin, Reverb tail, Filter sweep, Drop mix
- [ ] Mostrar transiciones en UI de sets generados
- [ ] Iconos visuales para cada tipo de transición
- [ ] Tooltips explicativos para cada técnica

### 3. DJ DNA Profile (IDENTIDAD MUSICAL)
- [ ] Crear componente DJDNABadge
- [ ] Calcular DNA basado en perfil: BPM dominante, género principal, key favorita, momento preferido, nivel energético
- [ ] Formato: "Tu ADN DJ: 128 BPM · Tech House · Am · Peak Time · Festival Energy"
- [ ] Mostrar en header de DJ MODE
- [ ] Mostrar en perfiles públicos de DJs
- [ ] Animación de "descubriendo tu ADN" al actualizar perfil
- [ ] Compartir DNA en redes sociales

### 4. Sistema de Badges y Gamificación (VIRALIZACIÓN)
- [ ] Crear tabla dj_badges en base de datos
- [ ] Definir 10+ badges con criterios de desbloqueo:
  - [ ] 🎧 Club Killer (100+ descargas)
  - [ ] 🚀 Festival Weapon (track en Top 10 Mainstage)
  - [ ] 🔥 Peak Time Master (50+ tracks peak time)
  - [ ] 🧠 AI Power DJ (10+ sets generados)
  - [ ] 💎 Verified DJ (membresía verificada)
  - [ ] 🎯 Precision Master (profile score 90+)
  - [ ] 🌟 Rising Star (100+ seguidores)
  - [ ] 🏆 Top 10 DJ (ranking global)
  - [ ] 🎨 Sound Designer (20+ tracks subidos)
  - [ ] 🔊 Bass Lord (especialista en Bass House)
- [ ] Sistema de notificaciones al desbloquear badge
- [ ] Mostrar badges en perfil DJ
- [ ] Progreso hacia próximo badge
- [ ] Badges compartibles en redes sociales

### 5. Bloqueo Inteligente para Upsell (MONETIZACIÓN)
- [ ] Definir 3 planes: Free, Pro ($4.99/mes), Studio ($9.99/mes)
- [ ] Plan Free: Vista demo de DJ MODE (solo estadísticas básicas)
- [ ] Plan Pro: Recomendaciones completas + 5 sets/mes
- [ ] Plan Studio: Todo ilimitado + batch processing + exportación
- [ ] Crear tabla user_plan_limits para tracking de uso
- [ ] Implementar verificación de límites en routers
- [ ] Modals de upgrade estratégicos
- [ ] Mensajes de "Desbloquea con Pro/Studio"
- [ ] Comparación visual de planes en DJ MODE

### 6. Texto de Posicionamiento Estratégico (BRANDING)
- [ ] Actualizar hero de Home con nuevo copy
- [ ] Headline principal: "ONLYDJS no es un pool. Es el cerebro del DJ moderno."
- [ ] Subheadline: "IA + Música + Sets + Inteligencia = DJ MODE"
- [ ] Sección de features destacando DJ MODE
- [ ] Video/GIF demo de curva energética
- [ ] Testimonios de DJs usando DJ MODE
- [ ] CTA específico para DJ MODE

### Testing y Optimización
- [ ] Tests de componente EnergyFlowChart
- [ ] Tests de sistema de badges
- [ ] Tests de límites de planes
- [ ] Tests de cálculo de DJ DNA
- [ ] Optimización de queries de badges
- [ ] Tests de integración completa


## 32. Ajustes Finos de Top 1% (DIFERENCIACIÓN ABSOLUTA) 🎯 ✅

### 1. Visualización de Curva en Auto Set Builder (MUY IMPORTANTE)
- [x] Integrar EnergyFlowChart en vista de sets generados
- [x] Mostrar curva energética cuando se abre un set desde "Mis Sets"
- [x] Timeline visual con barras de energía por track (▂▃▅▆█▆▅▃)
- [x] Hacer la IA tangible y visible
- [x] Animación de carga de curva
- [x] Tooltip con detalles por punto
- [x] Modal SetDetailsModal con curva completa
- [x] Endpoint getSetDetails para obtener tracks con energía

### 2. Sugerencias de Mezcla Entre Tracks (ENTRENADOR DJ + IA)
- [x] Parsear campo transitions de sets generados
- [x] Mostrar transiciones entre cada par de tracks
- [ ] Iconos visuales por técnica:
  - [x] 🔁 Loop 8 beats
  - [x] 🔊 Echo Out
  - [x] ⏪ Backspin
  - [x] 🌊 Reverb Tail
  - [x] 🎚️ Filter Sweep
  - [x] 💥 Drop Mix
  - [x] 🎛️ EQ Blend
  - [x] ⚡ Quick Cut
- [x] Iconos visuales integrados en SetDetailsModal
- [x] Badges de compatibilidad (Perfecta/Buena/Moderada)
- [x] Sección "Guía de Mezcla" con resumen de técnicas

### 3. DJ DNA Más Visual (FIRMA VISUAL DE ONLYDJS)
- [x] Crear componente DJDNARadarChart con Recharts
- [x] Radar chart con 5 dimensiones:
  - [x] BPM Range (0-200)
  - [x] Energy Level (0-100)
  - [x] Genre Diversity (0-100)
  - [x] Key Mastery (0-100)
  - [x] Activity Score (0-100)
- [x] Colores neon por dimensión (cyan/purple/pink/yellow/green)
- [x] Animación de carga del radar
- [x] Cards de dimensiones con detalles
- [x] Mostrar en DJ Profile de DJ MODE
- [ ] Comparación con promedio de plataforma
- [ ] Exportar como imagen (DJ Fingerprint)
- [ ] Wheel chart alternativo para móviles

### 4. Sistema de Logros Semanales (GAMIFICACIÓN PRO)
- [x] Crear tabla weekly_challenges en base de datos
- [x] Definir 10 tipos de retos semanales:
  - [x] 🎯 Genera X sets
  - [x] ⬇️ Descarga X tracks
  - [x] ▶️ Reproduce X tracks
  - [x] ⬆️ Sube X tracks originales
  - [x] 🧠 Usa DJ MODE X días seguidos
  - [x] 🎵 Descarga X tracks del mismo género
- [x] Router weeklyChallengesRouter con generación automática
- [x] Sistema de progreso semanal con barra
- [x] Badge exclusivo por reto completado
- [x] Reset automático cada lunes (weekStart)
- [x] Componente WeeklyChallengesCard en Dashboard
- [x] Progreso visual con Progress bars
- [x] Cálculo automático de progreso por tipo de reto
- [ ] Notificación al completar reto
- [ ] Leaderboard de retos completados
- [ ] Animación de confetti al completar

### Testing
- [ ] Tests de EnergyFlowChart integrado
- [ ] Tests de parseo de transitions
- [ ] Tests de DJDNARadarChart
- [ ] Tests de weekly_challenges
- [ ] Tests de progreso de retos


## 33. Sistema de Notificaciones Push de Badges (NUEVO) ✅

### Componentes y UI
- [x] Instalar canvas-confetti para animaciones
- [x] Crear componente BadgeUnlockedNotification con:
  - [x] Modal/Toast animado con badge desbloqueado
  - [x] Animación de confetti al aparecer
  - [x] Icono y nombre del badge
  - [x] Descripción del logro
  - [x] Botón "Compartir en Redes Sociales"
  - [x] Botón "Cerrar"
  - [x] Animación de entrada/salida suave

### Sistema de Detección
- [x] Crear hook useNewBadges para detectar badges nuevos
- [x] Comparar badges actuales con badges previos
- [x] Almacenar badges vistos en localStorage
- [x] Trigger de notificación cuando se detecta badge nuevo
- [x] Sistema de un badge a la vez (no queue múltiple)

### Funcionalidad de Compartir
- [x] Generar texto dinámico para compartir: "¡Acabo de desbloquear el badge [NOMBRE] en ONLYDJS! 🎉"
- [x] Botones de compartir para:
  - [x] Twitter/X
  - [x] Facebook
  - [x] WhatsApp
  - [x] Copiar al portapapeles
- [x] Incluir URL de la plataforma en el mensaje
- [ ] Tracking de shares (opcional)

### Integración
- [x] Integrar en DJ MODE (cuando se actualiza perfil)
- [x] Hook useNewBadges detecta automáticamente badges nuevos
- [x] Notificación persistente hasta que el usuario la cierre
- [ ] Integrar en Dashboard (cuando se completan retos)

### Testing
- [ ] Tests de detección de badges nuevos
- [ ] Tests de animación de confetti
- [ ] Tests de funcionalidad de compartir
- [ ] Tests de integración completa


## 34. Mejoras Visuales de Auto Set Builder (COACH DJ INTELIGENTE) ✅

### 1. Energy Curve Timeline en Resultado
- [x] Mostrar EnergyFlowChart inmediatamente después de generar set
- [x] Timeline visual con barras de energía por track (▂▃▅▆█▆▅▃)
- [x] Hacer la IA tangible y visible en tiempo real
- [x] Estadísticas de energía (inicial, pico, final)
- [x] Animación de carga de curva
- [x] Responsive design para móviles
- [x] Card con gradiente cyan/purple y animación fade-in

### 2. Sugerencias de Transición Visibles
- [x] Mostrar "🎛 Mixing Tip" entre cada par de tracks
- [x] Técnica recomendada con descripción clara
- [x] Ejemplo: "Loop 8 → Echo Out → Drop limpio"
- [x] Iconos visuales por técnica
- [x] Badges de compatibilidad (Perfecta/Buena/Moderada)
- [x] Sección "Mixing Guide" con todas las transiciones
- [x] Cards de tracks con energía y metadata

### 3. DJ DNA Shareable (Viralidad)
- [x] Botón "📤 Compartir mi ADN DJ" en perfil
- [x] Generar imagen automática con:
  - [x] Texto: "Mi ADN DJ: [BPM] · [Género] · [Key] · [Energía]"
  - [x] Logo/icono de ONLYDJS (🎧)
  - [x] URL: onlydjs.com
  - [x] Diseño atractivo para redes sociales
  - [x] Gradiente purple/cyan con border
- [x] Usar html2canvas para generar imagen
- [x] Botón de descarga directa
- [x] Botones de compartir en redes sociales (Twitter, Facebook, WhatsApp)
- [x] Botón copiar texto al portapapeles
- [ ] Tracking de shares (opcional)

### Integración en Auto Set Builder
- [x] Reorganizar UI para mostrar timeline inmediatamente
- [x] Sección de transiciones expandida por defecto
- [x] Botón de compartir DNA prominente en DJ Profile
- [x] Animaciones suaves entre secciones (fade-in, slide-in)
- [x] Loading states profesionales
- [x] Card de resultado con gradiente y animación
- [x] Botón "Cerrar Vista" para ocultar resultado

### Testing
- [ ] Tests de visualización de energy curve
- [ ] Tests de generación de imagen de DNA
- [ ] Tests de integración completa


## 35. Sistema de Feedback de Sets Generados (MEJORA CONTINUA DE IA) ✅

### Base de Datos
- [x] Crear tabla `set_feedback` con campos:
  - [x] id (autoincremental)
  - [x] setId (FK a auto_sets)
  - [x] userId (FK a users)
  - [x] rating (1-5 estrellas)
  - [x] comment (texto libre)
  - [x] workedWell (tags JSON array)
  - [x] needsImprovement (tags JSON array)
  - [x] usedInLive (boolean)
  - [x] venueType (enum: club, festival, bar, radio, stream, other)
  - [x] createdAt, updatedAt

### Router tRPC
- [x] Endpoint `submitSetFeedback` (protegido)
  - [x] Validar que el set pertenezca al usuario
  - [x] Guardar rating y comentario
  - [x] Actualizar o crear feedback
- [x] Endpoint `getSetFeedback` (protegido)
  - [x] Obtener feedback de un set específico
- [x] Endpoint `getMyFeedbackHistory` (protegido)
  - [x] Listar todos los feedbacks del usuario con nombre de set
  - [x] Ordenar por fecha descendente
- [x] Endpoint `getMyFeedbackStats` (protegido)
  - [x] Total de feedbacks, rating promedio, sets usados en vivo

### Componentes UI
- [x] Crear `SetFeedbackForm` con:
  - [x] Rating con estrellas (1-5) interactivo con hover
  - [x] Campo de comentario (textarea)
  - [x] Checkboxes "¿Qué funcionó bien?" (5 opciones)
  - [x] Checkboxes "¿Qué mejorar?" (5 opciones)
  - [x] Toggle "¿Lo usaste en vivo?"
  - [x] Radio buttons tipo de venue (6 opciones)
  - [x] Botón "Enviar Feedback" con loading state
  - [x] Soporte para actualizar feedback existente
- [x] Agregar sección de feedback en `SetDetailsModal`
  - [x] Botón "Calificar este set" si no hay feedback
  - [x] Badge de rating si ya existe feedback
  - [x] Formulario integrado en modal
- [ ] Agregar indicador de rating en lista de "Mis Sets"

### Integración
- [x] Mostrar formulario de feedback en SetDetailsModal
- [x] Notificación de agradecimiento al enviar feedback (toast)
- [x] Invalidar queries al enviar feedback
- [ ] Mostrar rating promedio en cards de sets
- [ ] Badge "Feedback enviado" en sets calificados

### Analytics (Futuro)
- [ ] Dashboard de feedback para análisis de IA
- [ ] Identificar patrones en sets mejor calificados
- [ ] Ajustar algoritmo basado en feedback

### Testing
- [ ] Tests de endpoint submitSetFeedback
- [ ] Tests de endpoint getSetFeedback
- [ ] Tests de validación de ratings
- [ ] Tests de integración completa


## 36. Ajustes Finos Nivel Diamante 💎 (VIRALIDAD MÁXIMA) ✅

### 1. Exportación Multi-Formato de DJ DNA
- [x] Crear componente ExportDJDNA con 3 formatos:
  - [x] 📸 Instagram Story (1080x1920 - 9:16)
  - [x] 🟦 Post Cuadrado (1080x1080 - 1:1)
  - [x] 🖥 Banner Horizontal (1920x1080 - 16:9)
- [x] Botones de selección de formato en ShareDJDNA (RadioGroup)
- [x] Generar canvas con dimensiones específicas por formato
- [x] Ajustar layout de contenido según aspect ratio (escala automática)
- [x] Optimizar tipografía y espaciado por formato
- [x] Mostrar dimensiones del formato seleccionado

### 2. Watermark Automático con Branding
- [x] Agregar watermark sutil en todas las exportaciones:
  - [x] Logo/texto "onlydjs.com" en parte inferior centrada
  - [x] Hashtag "#MyDJDNA" visible debajo del logo
  - [x] Opacidad ajustada (50% blanco, 70% purple) para no ser intrusivo
  - [x] Posición estratégica adaptada según formato
- [x] Diseño consistente con identidad de marca
- [x] Fuente legible en todos los tamaños (escala dinámica)
- [x] Contraste adecuado con fondo degradado

### Beneficios
- ✅ Multiplica viralidad en redes sociales
- ✅ Branding automático en cada share
- ✅ Tracking orgánico vía hashtag
- ✅ Viral loop: usuarios ven ONLYDJS → visitan → crean DNA → comparten
- ✅ Optimización para cada plataforma social

### Testing
- [ ] Tests de generación de imágenes en 3 formatos
- [ ] Validación de dimensiones exactas
- [ ] Verificación de watermark visible
- [ ] Tests de calidad de imagen exportada


## 37. Sistema de Analíticas de DNA Shares 📊 (OPTIMIZACIÓN DE VIRALIDAD) ✅

### Base de Datos
- [x] Crear tabla `dna_share_analytics` con campos:
  - [x] id (autoincremental)
  - [x] userId (FK a users)
  - [x] format (enum: story, square, banner)
  - [x] platform (enum: download, twitter, facebook, whatsapp, copy)
  - [x] createdAt
  - [x] Índices en userId, format, platform, createdAt

### Router tRPC
- [x] Endpoint `trackDNAShare` (protegido)
  - [x] Registrar evento de share con formato y plataforma
  - [x] Validar formato y plataforma con Zod
  - [x] Timestamp automático
- [x] Endpoint `getDNAShareStats` (público)
  - [x] Total de shares por formato
  - [x] Total de shares por plataforma
  - [x] Shares por día (últimos 7 días)
  - [x] Total de shares global
- [x] Endpoint `getMyDNAShareHistory` (protegido)
  - [x] Historial de shares del usuario (últimos 50)
  - [x] Estadísticas personales (formato/plataforma)

### Integración en ShareDJDNA
- [x] Llamar trackDNAShare al descargar imagen
- [x] Llamar trackDNAShare al compartir en redes sociales
- [x] Llamar trackDNAShare al copiar texto
- [x] No bloquear UI si tracking falla (onError silenciado)

### Dashboard de Analíticas
- [ ] Crear página `/analytics/dna-shares` (admin only)
- [ ] Gráfica de shares por formato (pie chart)
- [ ] Gráfica de shares por plataforma (bar chart)
- [ ] Timeline de shares (line chart)
- [ ] Tabla de top DJs compartidores
- [ ] Filtros por fecha
- [ ] Exportar datos como CSV

### Beneficios
- ✅ Identificar formato más viral
- ✅ Optimizar diseño según datos reales
- ✅ Entender qué plataformas generan más tráfico
- ✅ Gamificar con leaderboard de compartidores
- ✅ Tomar decisiones basadas en datos

### Testing
- [ ] Tests de endpoint trackDNAShare
- [ ] Tests de endpoint getDNAShareStats
- [ ] Tests de validación de formato/plataforma
- [ ] Tests de integración completa

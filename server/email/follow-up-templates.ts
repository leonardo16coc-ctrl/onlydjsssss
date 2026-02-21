/**
 * Follow-up email templates personalized by music genre
 */

export const followUpTemplates: Record<string, {
  subject: string;
  message: string;
}> = {
  // Electronic genres
  "tech house": {
    subject: "¿Listo para llevar tus Tech House tracks al siguiente nivel?",
    message: `Hola de nuevo,

Vi que eres un productor de Tech House con gran talento y quería asegurarme de que no te perdieras esta oportunidad.

ONLYDJS está revolucionando cómo los DJs de Tech House monetizan su música:
• Sube tus extended mixes y remixes sin restricciones
• Conecta con otros productores de Tech House de todo el mundo
• Usa IA para analizar el BPM perfecto y crear transiciones impecables
• Gana dinero real con cada descarga

Muchos DJs de Tech House ya están ganando con sus tracks. ¿Te unes?`,
  },
  
  "techno": {
    subject: "La comunidad Techno te está esperando en ONLYDJS",
    message: `Hey,

Como productor de Techno, sabes que la escena underground necesita plataformas que realmente entiendan nuestra música.

ONLYDJS fue creada POR DJs PARA DJs:
• Sin algoritmos que favorezcan el mainstream
• Monetización justa para productores de Techno
• Herramientas de IA entrenadas específicamente para música electrónica
• Comunidad global de DJs de Techno

Dale una oportunidad a tu música. Únete hoy.`,
  },
  
  "house": {
    subject: "Tu música House merece una mejor plataforma",
    message: `Hola,

Te contacté hace unos días porque creo que tu música House tiene potencial increíble.

ONLYDJS ofrece lo que otras plataformas no:
• Control total sobre tu contenido y precios
• Sin comisiones abusivas (tú te quedas con el 80%)
• Análisis de audio con IA para mejorar tus mezclas
• Red de DJs profesionales que comparten tu pasión

¿Listo para monetizar tu talento? Únete ahora.`,
  },

  "trance": {
    subject: "Lleva tus Trance sets a miles de DJs worldwide",
    message: `Hey,

La escena Trance está creciendo en ONLYDJS y necesitamos productores con tu nivel.

Por qué los DJs de Trance nos eligen:
• Plataforma diseñada para tracks largos y progresivos
• Comunidad apasionada por el Trance clásico y moderno
• Herramientas de IA que entienden la estructura de Trance
• Monetización real por tu trabajo

No dejes pasar esta oportunidad. Únete a la familia Trance de ONLYDJS.`,
  },

  "bass house": {
    subject: "Bass House DJs están ganando en ONLYDJS",
    message: `Qué onda,

Vi tus tracks de Bass House y están brutales. Deberías estar monetizándolos.

ONLYDJS es perfecta para Bass House:
• Sube tus drops más pesados sin compresión
• Conecta con DJs que buscan exactamente tu estilo
• IA que analiza frecuencias bajas para mezclas perfectas
• Gana dinero con cada descarga

Dale, únete y empieza a ganar con tu música.`,
  },

  "dubstep": {
    subject: "Tu Dubstep merece una plataforma que pague bien",
    message: `Hey,

Como productor de Dubstep sabes cuánto trabajo lleva crear esos drops perfectos.

ONLYDJS te da lo que mereces:
• Monetiza tus remixes y mashups sin copyright strikes
• Comunidad de DJs que valoran el Dubstep de calidad
• Herramientas de IA para analizar dinámicas y frecuencias
• 80% de las ganancias van directo a ti

Deja de regalar tu música. Únete y empieza a cobrar.`,
  },

  // Default template for other genres
  "default": {
    subject: "Segunda oportunidad: Únete a ONLYDJS",
    message: `Hola de nuevo,

Te contacté hace unos días sobre ONLYDJS y quería asegurarme de que viste el mensaje.

Como DJ profesional, ONLYDJS te ofrece:
• Monetización real de tus extended mixes y remixes
• Herramientas de IA para crear sets perfectos
• Comunidad global de DJs y productores
• Control total sobre tu contenido y precios

Muchos DJs ya están creciendo con nosotros. ¿Te unes?`,
  },
};

/**
 * Get follow-up template for a specific genre
 */
export function getFollowUpTemplate(genre: string | null): { subject: string; message: string } {
  if (!genre) return followUpTemplates.default;
  
  const normalizedGenre = genre.toLowerCase().trim();
  
  // Try exact match first
  if (followUpTemplates[normalizedGenre]) {
    return followUpTemplates[normalizedGenre];
  }
  
  // Try partial match
  for (const [key, template] of Object.entries(followUpTemplates)) {
    if (normalizedGenre.includes(key) || key.includes(normalizedGenre)) {
      return template;
    }
  }
  
  // Return default if no match
  return followUpTemplates.default;
}

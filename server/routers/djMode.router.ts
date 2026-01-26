import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { djProfiles, djActivity, tracks, downloads, likes, playlistTracks, autoSets } from "../../drizzle/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

/**
 * DJ MODE - DJ Intelligence Platform
 * Módulo 1: DJ Profile Engine
 * Módulo 2: Smart DJ Suggestions  
 * Módulo 3: Auto Set Builder Pro
 */

export const djModeRouter = router({
  // ============================================================
  // MÓDULO 1: DJ PROFILE ENGINE
  // ============================================================
  
  /**
   * Obtener perfil DJ del usuario autenticado
   */
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Buscar perfil existente
    let profile = await db
      .select()
      .from(djProfiles)
      .where(eq(djProfiles.userId, ctx.user.id))
      .limit(1)
      .then(rows => rows[0]);

    // Si no existe, crear perfil inicial
    if (!profile) {
      await db.insert(djProfiles).values({
        userId: ctx.user.id,
        profileScore: 0,
      });
      
      profile = await db
        .select()
        .from(djProfiles)
        .where(eq(djProfiles.userId, ctx.user.id))
        .limit(1)
        .then(rows => rows[0]);
    }

    return profile;
  }),

  /**
   * Actualizar perfil DJ automáticamente basado en actividad
   */
  updateProfile: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Obtener actividad reciente del usuario
    const recentActivity = await db
      .select()
      .from(djActivity)
      .where(eq(djActivity.userId, ctx.user.id))
      .orderBy(desc(djActivity.createdAt))
      .limit(100);

    // Analizar géneros favoritos
    const genreCount: Record<string, number> = {};
    const keyCount: Record<string, number> = {};
    const moodCount: Record<string, number> = {};
    let totalBpm = 0;
    let bpmCount = 0;
    let totalEnergy = 0;
    let energyCount = 0;
    let minBpm = 999;
    let maxBpm = 0;

    for (const activity of recentActivity) {
      if (activity.trackGenre) {
        genreCount[activity.trackGenre] = (genreCount[activity.trackGenre] || 0) + 1;
      }
      if (activity.trackKey) {
        keyCount[activity.trackKey] = (keyCount[activity.trackKey] || 0) + 1;
      }
      if (activity.trackMood) {
        moodCount[activity.trackMood] = (moodCount[activity.trackMood] || 0) + 1;
      }
      if (activity.trackBpm) {
        totalBpm += activity.trackBpm;
        bpmCount++;
        if (activity.trackBpm < minBpm) minBpm = activity.trackBpm;
        if (activity.trackBpm > maxBpm) maxBpm = activity.trackBpm;
      }
      if (activity.trackEnergy) {
        totalEnergy += activity.trackEnergy;
        energyCount++;
      }
    }

    // Calcular promedios
    const avgBpm = bpmCount > 0 ? Math.round(totalBpm / bpmCount) : null;
    const avgEnergy = energyCount > 0 ? Math.round(totalEnergy / energyCount) : null;

    // Convertir a arrays ordenados
    const favoriteGenres = Object.entries(genreCount)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const favoriteKeys = Object.entries(keyCount)
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const favoriteMoods = Object.entries(moodCount)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Contar totales
    const totalDownloads = await db
      .select({ count: sql<number>`count(*)` })
      .from(downloads)
      .where(eq(downloads.userId, ctx.user.id))
      .then(rows => rows[0]?.count || 0);

    const totalPlays = await db
      .select({ count: sql<number>`count(*)` })
      .from(djActivity)
      .where(and(
        eq(djActivity.userId, ctx.user.id),
        eq(djActivity.activityType, "play")
      ))
      .then(rows => rows[0]?.count || 0);

    // Calcular score del perfil (0-100)
    let profileScore = 0;
    if (totalDownloads > 0) profileScore += 20;
    if (totalPlays > 0) profileScore += 20;
    if (favoriteGenres.length > 0) profileScore += 20;
    if (avgBpm) profileScore += 20;
    if (favoriteKeys.length > 0) profileScore += 20;

    // Actualizar perfil
    await db
      .update(djProfiles)
      .set({
        totalTracksDownloaded: totalDownloads,
        totalTracksPlayed: totalPlays,
        favoriteGenres: JSON.stringify(favoriteGenres),
        avgBpm: avgBpm,
        minBpm: bpmCount > 0 ? minBpm : null,
        maxBpm: bpmCount > 0 ? maxBpm : null,
        favoriteKeys: JSON.stringify(favoriteKeys),
        avgEnergy: avgEnergy,
        favoriteMoods: JSON.stringify(favoriteMoods),
        lastActivityAt: new Date(),
        profileScore: profileScore,
        updatedAt: new Date(),
      })
      .where(eq(djProfiles.userId, ctx.user.id));

    // Retornar perfil actualizado
    return await db
      .select()
      .from(djProfiles)
      .where(eq(djProfiles.userId, ctx.user.id))
      .limit(1)
      .then(rows => rows[0]);
  }),

  /**
   * Registrar actividad del DJ (download, play, like, etc.)
   */
  trackActivity: protectedProcedure
    .input(z.object({
      trackId: z.number(),
      activityType: z.enum(["download", "play", "like", "add_to_playlist"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Obtener metadatos del track
      const track = await db
        .select()
        .from(tracks)
        .where(eq(tracks.id, input.trackId))
        .limit(1)
        .then(rows => rows[0]);

      if (!track) {
        throw new Error("Track not found");
      }

      // Registrar actividad
      await db.insert(djActivity).values({
        userId: ctx.user.id,
        trackId: input.trackId,
        activityType: input.activityType,
        trackBpm: track.bpm,
        trackKey: track.musicalKey,
        trackGenre: track.genre,
        trackEnergy: track.energy,
        trackMood: track.mood,
      });

      return { success: true };
    }),

  // ============================================================
  // MÓDULO 2: SMART DJ SUGGESTIONS
  // ============================================================

  /**
   * Obtener recomendaciones inteligentes basadas en perfil DJ
   */
  getSmartSuggestions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Obtener perfil del DJ
    const profile = await db
      .select()
      .from(djProfiles)
      .where(eq(djProfiles.userId, ctx.user.id))
      .limit(1)
      .then(rows => rows[0]);

    if (!profile || !profile.favoriteGenres) {
      // Perfil no completo, retornar tracks populares
      const popularTracks = await db
        .select()
        .from(tracks)
        .orderBy(desc(tracks.downloadCount))
        .limit(10);

      return {
        recommendedForYou: popularTracks,
        warmupTracks: [],
        peakTimeTracks: [],
        closingTracks: [],
        festivalTracks: [],
        trendingTracks: popularTracks.slice(0, 5),
      };
    }

    // Parsear géneros favoritos
    const favoriteGenres = JSON.parse(profile.favoriteGenres) as Array<{ genre: string; count: number }>;
    const topGenres = favoriteGenres.map(g => g.genre);

    // Recomendados para ti (basado en géneros y BPM favoritos)
    const recommendedForYou = await db
      .select()
      .from(tracks)
      .where(
        and(
          sql`${tracks.genre} IN (${topGenres.join(',')})`,
          profile.avgBpm ? sql`ABS(${tracks.bpm} - ${profile.avgBpm}) <= 5` : undefined
        )
      )
      .orderBy(desc(tracks.downloadCount))
      .limit(10);

    // Warmup tracks (energía baja, BPM progresivo)
    const warmupTracks = await db
      .select()
      .from(tracks)
      .where(
        and(
          sql`${tracks.energy} BETWEEN 30 AND 60`,
          profile.minBpm ? sql`${tracks.bpm} BETWEEN ${profile.minBpm} AND ${profile.minBpm + 10}` : undefined
        )
      )
      .orderBy(desc(tracks.downloadCount))
      .limit(5);

    // Peak Time tracks (energía alta, drops masivos)
    const peakTimeTracks = await db
      .select()
      .from(tracks)
      .where(
        and(
          sql`${tracks.energy} >= 80`,
          sql`${tracks.genre} IN (${topGenres.join(',')})`
        )
      )
      .orderBy(desc(tracks.downloadCount))
      .limit(5);

    // Closing tracks (energía descendente, emocional)
    const closingTracks = await db
      .select()
      .from(tracks)
      .where(
        and(
          sql`${tracks.energy} BETWEEN 40 AND 70`,
          sql`${tracks.mood} IN ('Emotional', 'Melodic', 'Uplifting')`
        )
      )
      .orderBy(desc(tracks.downloadCount))
      .limit(5);

    // Festival/Mainstage tracks (anthems, crowd control)
    const festivalTracks = await db
      .select()
      .from(tracks)
      .where(
        and(
          sql`${tracks.trackType} IN ('Extended Mix')`,
          sql`${tracks.energy} >= 85`
        )
      )
      .orderBy(desc(tracks.downloadCount))
      .limit(5);

    // Trending tracks (últimos 7 días con más descargas)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const trendingTracks = await db
      .select()
      .from(tracks)
      .where(gte(tracks.createdAt, sevenDaysAgo))
      .orderBy(desc(tracks.downloadCount))
      .limit(5);

    return {
      recommendedForYou,
      warmupTracks,
      peakTimeTracks,
      closingTracks,
      festivalTracks,
      trendingTracks,
    };
  }),

  // ============================================================
  // MÓDULO 3: AUTO SET BUILDER PRO
  // ============================================================

  /**
   * Analizar tracks y generar set automático con IA
   */
  buildAutoSet: protectedProcedure
    .input(z.object({
      trackIds: z.array(z.number()).min(2).max(10),
      setType: z.enum(["warmup", "peak_time", "closing", "festival"]),
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Obtener tracks
      const tracksList = await db
        .select()
        .from(tracks)
        .where(sql`${tracks.id} IN (${input.trackIds.join(',')})`);

      if (tracksList.length < 2) {
        throw new Error("Need at least 2 tracks to build a set");
      }

      // Preparar datos para IA
      const tracksData = tracksList.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        bpm: t.bpm,
        key: t.musicalKey,
        energy: t.energy,
        mood: t.mood,
        genre: t.genre,
      }));

      // Usar IA para generar el orden óptimo del set
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Eres un DJ profesional experto en crear sets perfectos. Analiza los tracks proporcionados y genera el orden óptimo basándote en:
- Compatibilidad de BPM (transiciones suaves ±5 BPM)
- Compatibilidad armónica (Camelot Wheel)
- Curva energética profesional según el tipo de set
- Flow y transiciones naturales

Tipo de set: ${input.setType}
- warmup: Energía ascendente gradual (40 → 70)
- peak_time: Energía alta sostenida (80 → 95)
- closing: Energía descendente emocional (70 → 50)
- festival: Energía explosiva con peaks (85 → 100)`,
          },
          {
            role: "user",
            content: `Analiza estos ${tracksData.length} tracks y genera el orden óptimo:\n\n${JSON.stringify(tracksData, null, 2)}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "auto_set_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                orderedTrackIds: {
                  type: "array",
                  items: { type: "number" },
                  description: "IDs de tracks en orden óptimo",
                },
                avgBpm: {
                  type: "number",
                  description: "BPM promedio del set",
                },
                keyCompatibility: {
                  type: "number",
                  description: "Score de compatibilidad armónica 0-100",
                },
                energyCurve: {
                  type: "array",
                  items: { type: "number" },
                  description: "Energía de cada track en orden (0-100)",
                },
                transitions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      fromTrackId: { type: "number" },
                      toTrackId: { type: "number" },
                      suggestion: { type: "string" },
                      compatibility: { type: "string" },
                    },
                    required: ["fromTrackId", "toTrackId", "suggestion", "compatibility"],
                    additionalProperties: false,
                  },
                  description: "Sugerencias de transición entre tracks",
                },
                analysis: {
                  type: "string",
                  description: "Análisis general del set",
                },
              },
              required: ["orderedTrackIds", "avgBpm", "keyCompatibility", "energyCurve", "transitions", "analysis"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      const analysis = JSON.parse(typeof content === 'string' ? content : "{}");

      // Guardar set en base de datos
      const setName = input.name || `${input.setType.replace('_', ' ')} Set - ${new Date().toLocaleDateString()}`;
      
      await db.insert(autoSets).values({
        userId: ctx.user.id,
        name: setName,
        setType: input.setType,
        avgBpm: analysis.avgBpm,
        keyCompatibility: analysis.keyCompatibility,
        energyCurve: JSON.stringify(analysis.energyCurve),
        trackIds: JSON.stringify(analysis.orderedTrackIds),
        trackCount: analysis.orderedTrackIds.length,
        transitions: JSON.stringify(analysis.transitions),
      });

      // Obtener tracks ordenados
      const orderedTracks = analysis.orderedTrackIds.map((id: number) => 
        tracksList.find(t => t.id === id)
      ).filter(Boolean);

      return {
        ...analysis,
        tracks: orderedTracks,
        setName,
      };
    }),

  /**
   * Obtener sets guardados del usuario
   */
  getMySets: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const sets = await db
      .select()
      .from(autoSets)
      .where(eq(autoSets.userId, ctx.user.id))
      .orderBy(desc(autoSets.createdAt));

    return sets;
  }),
});

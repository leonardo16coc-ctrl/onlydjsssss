import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { tracks, users } from "../../drizzle/schema";
import { and, or, gte, lte, eq, like, inArray, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const searchRouter = router({
  /**
   * Advanced search with multiple filters
   */
  advancedSearch: publicProcedure
    .input(z.object({
      // Text search
      query: z.string().optional(),
      
      // BPM range
      bpmMin: z.number().min(60).max(200).optional(),
      bpmMax: z.number().min(60).max(200).optional(),
      
      // Musical key
      musicalKey: z.array(z.string()).optional(),
      
      // Genre (multiple selection)
      genres: z.array(z.string()).optional(),
      
      // Track type
      trackTypes: z.array(z.enum(["Extended Mix", "Edit", "Mashup", "Remix", "Rework"])).optional(),
      
      // Energy range
      energyMin: z.number().min(0).max(100).optional(),
      energyMax: z.number().min(0).max(100).optional(),
      
      // Mood
      moods: z.array(z.string()).optional(),
      
      // Pagination
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      
      // Sorting
      sortBy: z.enum(["recent", "popular", "bpm", "downloads"]).default("recent"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Build WHERE conditions
      const conditions: any[] = [];

      // Text search (title or artist)
      if (input.query && input.query.trim()) {
        const searchTerm = `%${input.query.trim()}%`;
        conditions.push(
          or(
            like(tracks.title, searchTerm),
            like(tracks.artist, searchTerm)
          )
        );
      }

      // BPM range
      if (input.bpmMin !== undefined) {
        conditions.push(gte(tracks.bpm, input.bpmMin));
      }
      if (input.bpmMax !== undefined) {
        conditions.push(lte(tracks.bpm, input.bpmMax));
      }

      // Musical key
      if (input.musicalKey && input.musicalKey.length > 0) {
        conditions.push(inArray(tracks.musicalKey, input.musicalKey));
      }

      // Genres
      if (input.genres && input.genres.length > 0) {
        conditions.push(inArray(tracks.genre, input.genres as any));
      }

      // Track types
      if (input.trackTypes && input.trackTypes.length > 0) {
        conditions.push(inArray(tracks.trackType, input.trackTypes as any));
      }

      // Energy range
      if (input.energyMin !== undefined) {
        conditions.push(gte(tracks.energy, input.energyMin));
      }
      if (input.energyMax !== undefined) {
        conditions.push(lte(tracks.energy, input.energyMax));
      }

      // Mood
      if (input.moods && input.moods.length > 0) {
        conditions.push(inArray(tracks.mood, input.moods));
      }

      // Build ORDER BY
      let orderBy;
      switch (input.sortBy) {
        case "popular":
          orderBy = desc(tracks.downloadCount);
          break;
        case "bpm":
          orderBy = tracks.bpm;
          break;
        case "downloads":
          orderBy = desc(tracks.downloadCount);
          break;
        case "recent":
        default:
          orderBy = desc(tracks.createdAt);
          break;
      }

      // Execute query
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const results = await db
        .select({
          track: tracks,
          artist: {
            id: users.id,
            name: users.name,
            djName: users.djName,
            username: users.username,
            isVerified: users.isVerified,
          },
        })
        .from(tracks)
        .leftJoin(users, eq(tracks.userId, users.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(input.offset);

      // Get total count for pagination
      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(tracks)
        .where(whereClause);

      const total = countResult[0]?.count || 0;

      return {
        tracks: results.map(r => ({
          ...r.track,
          artistInfo: r.artist,
        })),
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  /**
   * Get compatible tracks based on BPM and Key
   */
  getCompatibleTracks: publicProcedure
    .input(z.object({
      trackId: z.number(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get the reference track
      const refTrack = await db
        .select()
        .from(tracks)
        .where(eq(tracks.id, input.trackId))
        .limit(1);

      if (refTrack.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Track no encontrado" });
      }

      const track = refTrack[0];

      // Define compatible BPM range (±5 BPM)
      const bpmMin = track.bpm ? track.bpm - 5 : undefined;
      const bpmMax = track.bpm ? track.bpm + 5 : undefined;

      // Define compatible keys (Camelot wheel)
      const compatibleKeys = getCompatibleKeys(track.musicalKey);

      // Build conditions
      const conditions: any[] = [
        // Exclude the same track
        sql`${tracks.id} != ${input.trackId}`,
      ];

      if (bpmMin !== undefined && bpmMax !== undefined) {
        conditions.push(
          and(
            gte(tracks.bpm, bpmMin),
            lte(tracks.bpm, bpmMax)
          )
        );
      }

      if (compatibleKeys.length > 0) {
        conditions.push(inArray(tracks.musicalKey, compatibleKeys));
      }

      // Same genre preference
      if (track.genre) {
        conditions.push(eq(tracks.genre, track.genre));
      }

      // Execute query
      const results = await db
        .select()
        .from(tracks)
        .where(and(...conditions))
        .orderBy(desc(tracks.downloadCount))
        .limit(input.limit);

      return results;
    }),

  /**
   * Get filter options (for dropdowns)
   */
  getFilterOptions: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get unique genres
      const genresResult = await db
        .select({ genre: tracks.genre })
        .from(tracks)
        .groupBy(tracks.genre);

      // Get unique track types
      const typesResult = await db
        .select({ trackType: tracks.trackType })
        .from(tracks)
        .groupBy(tracks.trackType);

      // Get unique moods
      const moodsResult = await db
        .select({ mood: tracks.mood })
        .from(tracks)
        .groupBy(tracks.mood);

      return {
        genres: genresResult.map(r => r.genre).filter(Boolean) as string[],
        trackTypes: typesResult.map(r => r.trackType).filter(Boolean) as ("Extended Mix" | "Edit" | "Mashup" | "Remix" | "Rework")[],
        moods: moodsResult.map(r => r.mood).filter(Boolean) as string[],
        musicalKeys: getAllMusicalKeys(),
      };
    }),
});

/**
 * Get compatible keys based on Camelot wheel
 */
function getCompatibleKeys(key: string | null): string[] {
  if (!key) return [];

  // Camelot wheel compatibility
  const camelotWheel: Record<string, string[]> = {
    // Major keys (B)
    "1B": ["1B", "2B", "12B", "1A"], // C Major
    "2B": ["2B", "3B", "1B", "2A"],  // Db Major
    "3B": ["3B", "4B", "2B", "3A"],  // D Major
    "4B": ["4B", "5B", "3B", "4A"],  // Eb Major
    "5B": ["5B", "6B", "4B", "5A"],  // E Major
    "6B": ["6B", "7B", "5B", "6A"],  // F Major
    "7B": ["7B", "8B", "6B", "7A"],  // Gb Major
    "8B": ["8B", "9B", "7B", "8A"],  // G Major
    "9B": ["9B", "10B", "8B", "9A"], // Ab Major
    "10B": ["10B", "11B", "9B", "10A"], // A Major
    "11B": ["11B", "12B", "10B", "11A"], // Bb Major
    "12B": ["12B", "1B", "11B", "12A"], // B Major
    
    // Minor keys (A)
    "1A": ["1A", "2A", "12A", "1B"],  // Am
    "2A": ["2A", "3A", "1A", "2B"],   // Bbm
    "3A": ["3A", "4A", "2A", "3B"],   // Bm
    "4A": ["4A", "5A", "3A", "4B"],   // Cm
    "5A": ["5A", "6A", "4A", "5B"],   // C#m
    "6A": ["6A", "7A", "5A", "6B"],   // Dm
    "7A": ["7A", "8A", "6A", "7B"],   // Ebm
    "8A": ["8A", "9A", "7A", "8B"],   // Em
    "9A": ["9A", "10A", "8A", "9B"],  // Fm
    "10A": ["10A", "11A", "9A", "10B"], // F#m
    "11A": ["11A", "12A", "10A", "11B"], // Gm
    "12A": ["12A", "1A", "11A", "12B"],  // G#m
  };

  return camelotWheel[key] || [key];
}

/**
 * Get all musical keys
 */
function getAllMusicalKeys(): string[] {
  return [
    // Major keys
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
    // Minor keys
    "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm",
    // Camelot notation
    "1A", "2A", "3A", "4A", "5A", "6A", "7A", "8A", "9A", "10A", "11A", "12A",
    "1B", "2B", "3B", "4B", "5B", "6B", "7B", "8B", "9B", "10B", "11B", "12B",
  ];
}

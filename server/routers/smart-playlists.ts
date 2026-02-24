import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import type { SmartPlaylistRules } from "../../shared/smart-playlist-types";

// Schema de validación para reglas
const smartPlaylistRuleSchema = z.object({
  field: z.enum(['genre', 'bpm', 'key', 'uploadDate', 'plays', 'downloads']),
  operator: z.enum(['equals', 'contains', 'greaterThan', 'lessThan', 'between', 'in']),
  value: z.union([z.string(), z.number(), z.array(z.string()), z.array(z.number())])
});

const smartPlaylistRulesSchema = z.object({
  rules: z.array(smartPlaylistRuleSchema),
  matchAll: z.boolean(),
  limit: z.number().optional(),
  sortBy: z.enum(['uploadDate', 'plays', 'downloads', 'bpm']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const smartPlaylistsRouter = router({
  // Crear smart playlist con reglas
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      rules: smartPlaylistRulesSchema,
      isPublic: z.boolean().default(false)
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.execute(sql`
        INSERT INTO playlists (user_id, name, description, is_public, is_smart, rules, created_at, updated_at)
        VALUES (${ctx.user.id}, ${input.name}, ${input.description || ''}, ${input.isPublic}, TRUE, ${JSON.stringify(input.rules)}, NOW(), NOW())
      `);

      const testId = Number((result as any).insertId);

      return {
        id: testId,
        name: input.name,
        description: input.description,
        isPublic: input.isPublic,
        isSmart: true,
        rules: input.rules
      };
    }),

  // Generar tracks dinámicamente según reglas (simplificado)
  generateTracks: protectedProcedure
    .input(z.object({
      playlistId: z.number()
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Obtener playlist y sus reglas
      const playlistResult = await db.execute(sql`
        SELECT * FROM playlists WHERE id = ${input.playlistId} AND is_smart = TRUE
      `);

      const playlist = (playlistResult as any[])[0];
      if (!playlist) {
        throw new Error('Smart playlist not found');
      }

      const rules: SmartPlaylistRules = JSON.parse(playlist.rules);
      
      // Por ahora retornar query simple - se puede expandir después
      const tracks = await db.execute(sql`
        SELECT * FROM tracks 
        ORDER BY created_at DESC 
        LIMIT ${rules.limit || 50}
      `);

      return tracks as any[];
    }),

  // Preview de tracks antes de crear playlist (simplificado)
  previewTracks: protectedProcedure
    .input(z.object({
      rules: smartPlaylistRulesSchema
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rules = input.rules;
      
      // Por ahora retornar query simple
      const tracks = await db.execute(sql`
        SELECT * FROM tracks 
        ORDER BY created_at DESC 
        LIMIT ${rules.limit || 50}
      `);

      return tracks as any[];
    }),

  // Actualizar reglas de smart playlist
  updateRules: protectedProcedure
    .input(z.object({
      playlistId: z.number(),
      rules: smartPlaylistRulesSchema
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.execute(sql`
        UPDATE playlists 
        SET rules = ${JSON.stringify(input.rules)}, updated_at = NOW()
        WHERE id = ${input.playlistId} AND user_id = ${ctx.user.id} AND is_smart = TRUE
      `);

      return { success: true };
    })
});

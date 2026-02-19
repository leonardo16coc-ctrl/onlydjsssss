/**
 * tRPC Router for Agent System
 * Provides API endpoints to control and monitor autonomous agents
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { discoverDJsByGenre, runFullDiscovery } from '../agents/scout';
import { 
  createCampaign, 
  startCampaign, 
  getCampaignStats, 
  getAllCampaigns,
  pauseCampaign,
  resumeCampaign,
  runAgentCloserCycle
} from '../agents/closer';
import { db } from '../agents/db-helper';
import {
  getScraperHealthReport,
  getAllAccounts,
  addScraperAccount,
  updateAccountStatus,
  deleteAccount,
  getAccountStats,
  cleanupOldLogs
} from '../agents/scrapers/account-manager';

export const agentsRouter = router({
  /**
   * Get Agent Scout configuration
   */
  getScoutConfig: protectedProcedure
    .query(async ({ ctx }) => {
      // Only admins can access agent system
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can access agent system'
        });
      }
      
      const config = await db.queryOne<any>(
        'SELECT * FROM agent_config WHERE agentName = ?',
        ['scout']
      );
      
      return config || {
        agentName: 'scout',
        enabled: false,
        config: {},
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0
      };
    }),
  
  /**
   * Run Agent Scout for a specific genre
   */
  runScout: protectedProcedure
    .input(z.object({
      genre: z.string(),
      platform: z.enum(['instagram', 'soundcloud', 'both']).default('both'),
      limit: z.number().min(1).max(100).default(50)
    }))
    .mutation(async ({ ctx, input }) => {
      // Only admins can run agents
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can run agents'
        });
      }
      
      try {
        // Update agent status to running
        await db.query(
          `INSERT INTO agent_config (agentName, lastRunStatus, lastRunAt)
           VALUES ('scout', 'running', NOW())
           ON DUPLICATE KEY UPDATE lastRunStatus = 'running', lastRunAt = NOW()`,
          []
        );
        
        // Run discovery
        const result = await discoverDJsByGenre(
          input.genre,
          input.platform,
          input.limit
        );
        
        // Update agent status to success
        await db.query(
          `UPDATE agent_config SET
            lastRunStatus = 'success',
            totalRuns = totalRuns + 1,
            successfulRuns = successfulRuns + 1
           WHERE agentName = 'scout'`,
          []
        );
        
        return {
          success: true,
          result
        };
        
      } catch (error: any) {
        // Update agent status to failed
        await db.query(
          `UPDATE agent_config SET
            lastRunStatus = 'failed',
            lastRunError = ?,
            totalRuns = totalRuns + 1,
            failedRuns = failedRuns + 1
           WHERE agentName = 'scout'`,
          [error.message]
        );
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Agent Scout failed: ${error.message}`
        });
      }
    }),
  
  /**
   * Run full discovery across all genres
   */
  runFullDiscovery: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Only admins can run agents
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can run agents'
        });
      }
      
      try {
        await db.query(
          `INSERT INTO agent_config (agentName, lastRunStatus, lastRunAt)
           VALUES ('scout', 'running', NOW())
           ON DUPLICATE KEY UPDATE lastRunStatus = 'running', lastRunAt = NOW()`,
          []
        );
        
        await runFullDiscovery();
        
        await db.query(
          `UPDATE agent_config SET
            lastRunStatus = 'success',
            totalRuns = totalRuns + 1,
            successfulRuns = successfulRuns + 1
           WHERE agentName = 'scout'`,
          []
        );
        
        return { success: true };
        
      } catch (error: any) {
        await db.query(
          `UPDATE agent_config SET
            lastRunStatus = 'failed',
            lastRunError = ?,
            totalRuns = totalRuns + 1,
            failedRuns = failedRuns + 1
           WHERE agentName = 'scout'`,
          [error.message]
        );
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Full discovery failed: ${error.message}`
        });
      }
    }),
  
  /**
   * Get discovered DJs with pagination and filters
   */
  getDiscoveredDJs: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z.enum(['discovered', 'qualified', 'contacted', 'responded', 'converted', 'rejected', 'dormant']).optional(),
      minScore: z.number().min(0).max(100).optional(),
      genre: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      // Only admins can view discovered DJs
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view discovered DJs'
        });
      }
      
      const offset = (input.page - 1) * input.limit;
      
      let whereClause = '1=1';
      const params: any[] = [];
      
      if (input.status) {
        whereClause += ' AND discoveryStatus = ?';
        params.push(input.status);
      }
      
      if (input.minScore !== undefined) {
        whereClause += ' AND talentScore >= ?';
        params.push(input.minScore);
      }
      
      if (input.genre) {
        whereClause += ' AND primaryGenre = ?';
        params.push(input.genre);
      }
      
      const djs = await db.query(
        `SELECT * FROM discovered_djs 
         WHERE ${whereClause}
         ORDER BY talentScore DESC, discoveryDate DESC
         LIMIT ? OFFSET ?`,
        [...params, input.limit, offset]
      );
      
      const [{ total }] = await db.query<{ total: number }>(
        `SELECT COUNT(*) as total FROM discovered_djs WHERE ${whereClause}`,
        params
      );
      
      return {
        djs,
        total,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(total / input.limit)
      };
    }),
  
  /**
   * Get Agent Scout statistics
   */
  getScoutStats: protectedProcedure
    .query(async ({ ctx }) => {
      // Only admins can view stats
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view agent stats'
        });
      }
      
      const [totalDiscovered] = await db.query<{ count: number }>(
        'SELECT COUNT(*) as count FROM discovered_djs'
      );
      
      const [qualified] = await db.query<{ count: number }>(
        'SELECT COUNT(*) as count FROM discovered_djs WHERE talentScore >= 60'
      );
      
      const [highPriority] = await db.query<{ count: number }>(
        'SELECT COUNT(*) as count FROM discovered_djs WHERE talentScore >= 80'
      );
      
      const [byStatus] = await db.query<any>(
        'SELECT discoveryStatus, COUNT(*) as count FROM discovered_djs GROUP BY discoveryStatus'
      );
      
      const [byGenre] = await db.query<any>(
        'SELECT primaryGenre, COUNT(*) as count FROM discovered_djs GROUP BY primaryGenre ORDER BY count DESC LIMIT 10'
      );
      
      const [avgScore] = await db.query<{ avg: number }>(
        'SELECT AVG(talentScore) as avg FROM discovered_djs'
      );
      
      return {
        totalDiscovered: totalDiscovered.count,
        qualified: qualified.count,
        highPriority: highPriority.count,
        byStatus,
        byGenre,
        avgScore: avgScore.avg
      };
    }),
  
  /**
   * Update DJ status manually
   */
  updateDJStatus: protectedProcedure
    .input(z.object({
      djId: z.number(),
      status: z.enum(['discovered', 'qualified', 'contacted', 'responded', 'converted', 'rejected', 'dormant'])
    }))
    .mutation(async ({ ctx, input }) => {
      // Only admins can update status
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can update DJ status'
        });
      }
      
      await db.query(
        'UPDATE discovered_djs SET discoveryStatus = ?, lastUpdated = NOW() WHERE id = ?',
        [input.status, input.djId]
      );
      
      return { success: true };
    }),
  
  /**
   * Create outreach campaign
   */
  createCampaign: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      platform: z.enum(['instagram', 'soundcloud', 'both']),
      targetGenre: z.string().optional(),
      minTalentScore: z.number().min(0).max(100).default(60)
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can create campaigns'
        });
      }
      
      const campaignId = await createCampaign(input);
      
      return { success: true, campaignId };
    }),
  
  /**
   * Start campaign
   */
  startCampaign: protectedProcedure
    .input(z.object({
      campaignId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can start campaigns'
        });
      }
      
      const result = await startCampaign(input.campaignId);
      
      return result;
    }),
  
  /**
   * Get all campaigns
   */
  getCampaigns: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view campaigns'
        });
      }
      
      const campaigns = await getAllCampaigns();
      
      return campaigns;
    }),
  
  /**
   * Get campaign statistics
   */
  getCampaignStats: protectedProcedure
    .input(z.object({
      campaignId: z.number()
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view campaign stats'
        });
      }
      
      const stats = await getCampaignStats(input.campaignId);
      
      return stats;
    }),
  
  /**
   * Pause campaign
   */
  pauseCampaign: protectedProcedure
    .input(z.object({
      campaignId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can pause campaigns'
        });
      }
      
      await pauseCampaign(input.campaignId);
      
      return { success: true };
    }),
  
  /**
   * Resume campaign
   */
  resumeCampaign: protectedProcedure
    .input(z.object({
      campaignId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can resume campaigns'
        });
      }
      
      await resumeCampaign(input.campaignId);
      
      return { success: true };
    }),
  
  /**
   * Run Agent Closer cycle manually
   */
  runCloserCycle: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can run Agent Closer'
        });
      }
      
      try {
        await runAgentCloserCycle();
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Agent Closer failed: ${error.message}`
        });
      }
    }),
  
  // ========================================
  // SCRAPER MONITORING ENDPOINTS
  // ========================================
  
  /**
   * Get scraper health report
   */
  getScraperHealth: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can access scraper monitoring'
        });
      }
      
      const health = await getScraperHealthReport();
      return health;
    }),
  
  /**
   * Get all scraper accounts
   */
  getScraperAccounts: protectedProcedure
    .input(z.object({
      platform: z.enum(['instagram', 'soundcloud']).optional()
    }).optional())
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can access scraper accounts'
        });
      }
      
      const accounts = await getAllAccounts(input?.platform);
      return accounts;
    }),
  
  /**
   * Add new scraper account
   */
  addScraperAccount: protectedProcedure
    .input(z.object({
      platform: z.enum(['instagram', 'soundcloud']),
      username: z.string().min(1),
      password: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can add scraper accounts'
        });
      }
      
      const accountId = await addScraperAccount(
        input.platform,
        input.username,
        input.password
      );
      
      return { accountId, success: true };
    }),
  
  /**
   * Update scraper account status
   */
  updateScraperAccountStatus: protectedProcedure
    .input(z.object({
      accountId: z.number(),
      status: z.enum(['active', 'banned', 'suspended', 'rate_limited'])
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can update scraper accounts'
        });
      }
      
      await updateAccountStatus(input.accountId, input.status);
      
      return { success: true };
    }),
  
  /**
   * Delete scraper account
   */
  deleteScraperAccount: protectedProcedure
    .input(z.object({
      accountId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can delete scraper accounts'
        });
      }
      
      await deleteAccount(input.accountId);
      
      return { success: true };
    }),
  
  /**
   * Get scraper logs
   */
  getScraperLogs: protectedProcedure
    .input(z.object({
      platform: z.enum(['instagram', 'soundcloud']).optional(),
      status: z.enum(['success', 'error', 'banned', 'rate_limited']).optional(),
      limit: z.number().min(1).max(500).default(100)
    }).optional())
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can access scraper logs'
        });
      }
      
      let query = 'SELECT * FROM scraper_logs WHERE 1=1';
      const params: any[] = [];
      
      if (input?.platform) {
        query += ' AND platform = ?';
        params.push(input.platform);
      }
      
      if (input?.status) {
        query += ' AND status = ?';
        params.push(input.status);
      }
      
      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(input?.limit || 100);
      
      const logs = await db.query(query, params);
      
      return logs;
    }),
  
  /**
   * Get account statistics
   */
  getAccountStats: protectedProcedure
    .input(z.object({
      platform: z.enum(['instagram', 'soundcloud']).optional()
    }).optional())
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can access account stats'
        });
      }
      
      const stats = await getAccountStats(input?.platform);
      return stats;
    }),
  
  /**
   * Cleanup old logs
   */
  cleanupScraperLogs: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can cleanup logs'
        });
      }
      
      const deleted = await cleanupOldLogs();
      
      return { deleted, success: true };
    })
});

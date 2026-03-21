import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const messagingRouter = router({
  /**
   * Get all conversations for the current user, with the other participant's info
   */
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
      if (!db) throw new Error("Database not available");

    const convRows = await db.execute(sql`
      SELECT 
        c.id, c.user1Id, c.user2Id, c.lastMessageAt, c.lastMessagePreview,
        c.user1UnreadCount, c.user2UnreadCount, c.createdAt,
        u.id as otherId, u.username, u.djName, u.name, u.avatarUrl, u.profileImageUrl, u.isVerified,
        CASE WHEN c.user1Id = ${userId} THEN c.user1UnreadCount ELSE c.user2UnreadCount END as unreadCount
      FROM conversations c
      JOIN users u ON u.id = CASE WHEN c.user1Id = ${userId} THEN c.user2Id ELSE c.user1Id END
      WHERE c.user1Id = ${userId} OR c.user2Id = ${userId}
      ORDER BY c.lastMessageAt DESC
    `);

    return (convRows as any[]).map((row: any) => ({
      id: row.id,
      user1Id: row.user1Id,
      user2Id: row.user2Id,
      lastMessageAt: row.lastMessageAt,
      lastMessagePreview: row.lastMessagePreview,
      unreadCount: Number(row.unreadCount),
      createdAt: row.createdAt,
      otherUser: {
        id: row.otherId,
        username: row.username,
        djName: row.djName,
        name: row.name,
        avatarUrl: row.avatarUrl,
        profileImageUrl: row.profileImageUrl,
        isVerified: Boolean(row.isVerified),
      },
    }));
  }),

  /**
   * Get total unread message count for the current user
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
      if (!db) throw new Error("Database not available");

    const [row] = await db.execute(sql`
      SELECT COALESCE(SUM(
        CASE WHEN user1Id = ${userId} THEN user1UnreadCount ELSE user2UnreadCount END
      ), 0) as total
      FROM conversations
      WHERE user1Id = ${userId} OR user2Id = ${userId}
    `) as any[];

    return { count: Number((row as any)?.total ?? 0) };
  }),

  /**
   * Get messages for a specific conversation
   */
  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify user is part of this conversation
      const [conv] = await db.execute(sql`
        SELECT id FROM conversations
        WHERE id = ${input.conversationId}
          AND (user1Id = ${userId} OR user2Id = ${userId})
      `) as any[];

      if (!conv) throw new Error("Conversation not found or access denied");

      const msgs = await db.execute(sql`
        SELECT id, conversationId, senderId, receiverId, content, isRead, readAt, attachedTrackId, createdAt
        FROM messages
        WHERE conversationId = ${input.conversationId}
        ORDER BY createdAt ASC
      `);

      return (msgs as any[]).map((m: any) => ({
        ...m,
        isRead: Boolean(m.isRead),
      }));
    }),

  /**
   * Send a message to another user
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        receiverId: z.number(),
        content: z.string().min(1).max(2000),
        attachedTrackId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const senderId = ctx.user.id;
      const { receiverId, content, attachedTrackId } = input;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (senderId === receiverId) throw new Error("Cannot send message to yourself");

      // Ensure receiver exists
      const [receiver] = await db.execute(sql`SELECT id FROM users WHERE id = ${receiverId}`) as any[];
      if (!receiver) throw new Error("Receiver not found");

      // Find or create conversation (user1Id always < user2Id)
      const user1Id = Math.min(senderId, receiverId);
      const user2Id = Math.max(senderId, receiverId);

      let [conv] = await db.execute(sql`
        SELECT id, user1Id, user2Id FROM conversations
        WHERE user1Id = ${user1Id} AND user2Id = ${user2Id}
      `) as any[];

      if (!conv) {
        await db.execute(sql`
          INSERT INTO conversations (user1Id, user2Id, lastMessagePreview, lastMessageAt)
          VALUES (${user1Id}, ${user2Id}, ${content.slice(0, 100)}, NOW())
        `);
        [conv] = await db.execute(sql`
          SELECT id, user1Id, user2Id FROM conversations
          WHERE user1Id = ${user1Id} AND user2Id = ${user2Id}
        `) as any[];
      }

      // Insert the message
      await db.execute(sql`
        INSERT INTO messages (conversationId, senderId, receiverId, content, attachedTrackId)
        VALUES (${conv.id}, ${senderId}, ${receiverId}, ${content}, ${attachedTrackId ?? null})
      `);

      // Update conversation: last message preview + increment unread for receiver
      const isUser1Receiver = receiverId === conv.user1Id;
      if (isUser1Receiver) {
        await db.execute(sql`
          UPDATE conversations
          SET lastMessageAt = NOW(), lastMessagePreview = ${content.slice(0, 100)},
              user1UnreadCount = user1UnreadCount + 1
          WHERE id = ${conv.id}
        `);
      } else {
        await db.execute(sql`
          UPDATE conversations
          SET lastMessageAt = NOW(), lastMessagePreview = ${content.slice(0, 100)},
              user2UnreadCount = user2UnreadCount + 1
          WHERE id = ${conv.id}
        `);
      }

      const [newMsg] = await db.execute(sql`
        SELECT * FROM messages WHERE conversationId = ${conv.id} ORDER BY createdAt DESC LIMIT 1
      `) as any[];

      return { message: newMsg, conversationId: conv.id };
    }),

  /**
   * Mark all messages in a conversation as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [conv] = await db.execute(sql`
        SELECT id, user1Id, user2Id FROM conversations
        WHERE id = ${input.conversationId}
          AND (user1Id = ${userId} OR user2Id = ${userId})
      `) as any[];

      if (!conv) throw new Error("Conversation not found");

      // Mark messages as read
      await db.execute(sql`
        UPDATE messages
        SET isRead = true, readAt = NOW()
        WHERE conversationId = ${input.conversationId}
          AND receiverId = ${userId}
          AND isRead = false
      `);

      // Reset unread count for current user
      if (conv.user1Id === userId) {
        await db.execute(sql`UPDATE conversations SET user1UnreadCount = 0 WHERE id = ${input.conversationId}`);
      } else {
        await db.execute(sql`UPDATE conversations SET user2UnreadCount = 0 WHERE id = ${input.conversationId}`);
      }

      return { success: true };
    }),

  /**
   * Get or create a conversation with a specific user
   */
  getOrCreateConversation: protectedProcedure
    .input(z.object({ otherUserId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { otherUserId } = input;
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (userId === otherUserId) throw new Error("Cannot message yourself");

      const user1Id = Math.min(userId, otherUserId);
      const user2Id = Math.max(userId, otherUserId);

      let [conv] = await db.execute(sql`
        SELECT id FROM conversations WHERE user1Id = ${user1Id} AND user2Id = ${user2Id}
      `) as any[];

      if (!conv) {
        await db.execute(sql`
          INSERT INTO conversations (user1Id, user2Id, lastMessageAt) VALUES (${user1Id}, ${user2Id}, NOW())
        `);
        [conv] = await db.execute(sql`
          SELECT id FROM conversations WHERE user1Id = ${user1Id} AND user2Id = ${user2Id}
        `) as any[];
      }

      return { conversationId: conv.id };
    }),

  /**
   * Search users to start a new conversation
   */
  searchUsers: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const searchTerm = `%${input.query}%`;

      const results = await db.execute(sql`
        SELECT id, username, djName, name, avatarUrl, profileImageUrl, isVerified
        FROM users
        WHERE id != ${userId}
          AND (username LIKE ${searchTerm} OR djName LIKE ${searchTerm} OR name LIKE ${searchTerm})
        LIMIT 10
      `);

      return (results as any[]).map((u: any) => ({
        ...u,
        isVerified: Boolean(u.isVerified),
      }));
    }),
});

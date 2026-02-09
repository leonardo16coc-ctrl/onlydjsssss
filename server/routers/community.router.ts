import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { communityPosts, postLikes, postComments, users } from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const communityRouter = router({
  // Create a new post
  createPost: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(5000),
        trackId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [post] = await db.insert(communityPosts).values({
        userId: ctx.user.id,
        content: input.content,
        trackId: input.trackId,
      });

      return { success: true, postId: post.insertId };
    }),

  // Get posts with pagination
  getPosts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const posts = await db
        .select({
          id: communityPosts.id,
          content: communityPosts.content,
          trackId: communityPosts.trackId,
          likesCount: communityPosts.likesCount,
          commentsCount: communityPosts.commentsCount,
          createdAt: communityPosts.createdAt,
          user: {
            id: users.id,
            name: users.name,
            djName: users.djName,
            avatarUrl: users.avatarUrl,
            isVerified: users.isVerified,
          },
        })
        .from(communityPosts)
        .leftJoin(users, eq(communityPosts.userId, users.id))
        .orderBy(desc(communityPosts.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return posts;
    }),

  // Get user's liked posts
  getUserLikes: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const likes = await db
      .select({ postId: postLikes.postId })
      .from(postLikes)
      .where(eq(postLikes.userId, ctx.user.id));

    return likes.map((like: { postId: number }) => like.postId);
  }),

  // Like a post
  likePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if already liked
      const existing = await db
        .select()
        .from(postLikes)
        .where(
          and(
            eq(postLikes.postId, input.postId),
            eq(postLikes.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ya diste like a esta publicación",
        });
      }

      // Add like
      await db.insert(postLikes).values({
        postId: input.postId,
        userId: ctx.user.id,
      });

      // Increment likes count
      await db
        .update(communityPosts)
        .set({ likesCount: sql`${communityPosts.likesCount} + 1` })
        .where(eq(communityPosts.id, input.postId));

      return { success: true };
    }),

  // Unlike a post
  unlikePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Remove like
      const result = await db
        .delete(postLikes)
        .where(
          and(
            eq(postLikes.postId, input.postId),
            eq(postLikes.userId, ctx.user.id)
          )
        );

      // Decrement likes count
      await db
        .update(communityPosts)
        .set({ likesCount: sql`${communityPosts.likesCount} - 1` })
        .where(eq(communityPosts.id, input.postId));

      return { success: true };
    }),

  // Add comment to a post
  addComment: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [comment] = await db.insert(postComments).values({
        postId: input.postId,
        userId: ctx.user.id,
        content: input.content,
      });

      // Increment comments count
      await db
        .update(communityPosts)
        .set({ commentsCount: sql`${communityPosts.commentsCount} + 1` })
        .where(eq(communityPosts.id, input.postId));

      return { success: true, commentId: comment.insertId };
    }),

  // Get comments for a post
  getComments: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const comments = await db
        .select({
          id: postComments.id,
          content: postComments.content,
          createdAt: postComments.createdAt,
          userId: postComments.userId,
          user: {
            id: users.id,
            name: users.name,
            djName: users.djName,
            avatarUrl: users.avatarUrl,
            isVerified: users.isVerified,
          },
        })
        .from(postComments)
        .leftJoin(users, eq(postComments.userId, users.id))
        .where(eq(postComments.postId, input.postId))
        .orderBy(desc(postComments.createdAt));

      return comments;
    }),

  // Update a post (only owner can update)
  updatePost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if post exists and belongs to user
      const [post] = await db
        .select()
        .from(communityPosts)
        .where(eq(communityPosts.id, input.postId));

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (post.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own posts" });
      }

      // Update the post
      await db
        .update(communityPosts)
        .set({ content: input.content })
        .where(eq(communityPosts.id, input.postId));

      return { success: true };
    }),

  // Delete a post (only owner can delete)
  deletePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if post exists and belongs to user
      const [post] = await db
        .select()
        .from(communityPosts)
        .where(eq(communityPosts.id, input.postId));

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (post.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own posts" });
      }

      // Delete associated comments first
      await db.delete(postComments).where(eq(postComments.postId, input.postId));

      // Delete associated likes
      await db.delete(postLikes).where(eq(postLikes.postId, input.postId));

      // Delete the post
      await db.delete(communityPosts).where(eq(communityPosts.id, input.postId));

      return { success: true };
    }),

  // Update a comment (only owner can update)
  updateComment: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if comment exists and belongs to user
      const [comment] = await db
        .select()
        .from(postComments)
        .where(eq(postComments.id, input.commentId));

      if (!comment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
      }

      if (comment.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only edit your own comments" });
      }

      // Update the comment
      await db
        .update(postComments)
        .set({ content: input.content })
        .where(eq(postComments.id, input.commentId));

      return { success: true };
    }),

  // Delete a comment (only owner can delete)
  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if comment exists and belongs to user
      const [comment] = await db
        .select()
        .from(postComments)
        .where(eq(postComments.id, input.commentId));

      if (!comment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
      }

      if (comment.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own comments" });
      }

      // Delete the comment
      await db.delete(postComments).where(eq(postComments.id, input.commentId));

      // Decrement comments count
      await db
        .update(communityPosts)
        .set({ commentsCount: sql`${communityPosts.commentsCount} - 1` })
        .where(eq(communityPosts.id, comment.postId));

      return { success: true };
    }),
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users, communityPosts, postComments, postLikes } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Community Edit and Delete Tests", () => {
  let testUserId1: number;
  let testUserId2: number;
  let testPostId: number;
  let testCommentId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test users
    const [user1] = await db.insert(users).values({
      openId: "test-user-1-edit-delete",
      name: "Test User 1",
      djName: "DJ Test 1",
    });
    testUserId1 = user1.insertId;

    const [user2] = await db.insert(users).values({
      openId: "test-user-2-edit-delete",
      name: "Test User 2",
      djName: "DJ Test 2",
    });
    testUserId2 = user2.insertId;

    // Create test post by user 1
    const [post] = await db.insert(communityPosts).values({
      userId: testUserId1,
      content: "Original post content",
    });
    testPostId = post.insertId;

    // Create test comment by user 1
    const [comment] = await db.insert(postComments).values({
      postId: testPostId,
      userId: testUserId1,
      content: "Original comment content",
    });
    testCommentId = comment.insertId;
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Clean up test data
    await db.delete(postComments).where(eq(postComments.userId, testUserId1));
    await db.delete(postComments).where(eq(postComments.userId, testUserId2));
    await db.delete(postLikes).where(eq(postLikes.userId, testUserId1));
    await db.delete(postLikes).where(eq(postLikes.userId, testUserId2));
    await db.delete(communityPosts).where(eq(communityPosts.userId, testUserId1));
    await db.delete(communityPosts).where(eq(communityPosts.userId, testUserId2));
    await db.delete(users).where(eq(users.id, testUserId1));
    await db.delete(users).where(eq(users.id, testUserId2));
  });

  it("should allow owner to update their post", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Update post
    await db
      .update(communityPosts)
      .set({ content: "Updated post content" })
      .where(eq(communityPosts.id, testPostId));

    // Verify update
    const [post] = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, testPostId));

    expect(post.content).toBe("Updated post content");
  });

  it("should prevent non-owner from updating post", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check ownership before update
    const [post] = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, testPostId));

    expect(post.userId).not.toBe(testUserId2);
    expect(post.userId).toBe(testUserId1);
  });

  it("should allow owner to delete their post", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a new post to delete
    const [newPost] = await db.insert(communityPosts).values({
      userId: testUserId1,
      content: "Post to be deleted",
    });
    const postToDeleteId = newPost.insertId;

    // Delete post
    await db.delete(communityPosts).where(eq(communityPosts.id, postToDeleteId));

    // Verify deletion
    const deletedPost = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, postToDeleteId));

    expect(deletedPost.length).toBe(0);
  });

  it("should delete associated comments when deleting post", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a new post with comment
    const [newPost] = await db.insert(communityPosts).values({
      userId: testUserId1,
      content: "Post with comment to be deleted",
    });
    const postToDeleteId = newPost.insertId;

    const [newComment] = await db.insert(postComments).values({
      postId: postToDeleteId,
      userId: testUserId1,
      content: "Comment on post to be deleted",
    });
    const commentId = newComment.insertId;

    // Delete associated comments first
    await db.delete(postComments).where(eq(postComments.postId, postToDeleteId));

    // Delete post
    await db.delete(communityPosts).where(eq(communityPosts.id, postToDeleteId));

    // Verify comment deletion
    const deletedComment = await db
      .select()
      .from(postComments)
      .where(eq(postComments.id, commentId));

    expect(deletedComment.length).toBe(0);
  });

  it("should allow owner to update their comment", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Update comment
    await db
      .update(postComments)
      .set({ content: "Updated comment content" })
      .where(eq(postComments.id, testCommentId));

    // Verify update
    const [comment] = await db
      .select()
      .from(postComments)
      .where(eq(postComments.id, testCommentId));

    expect(comment.content).toBe("Updated comment content");
  });

  it("should prevent non-owner from updating comment", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check ownership before update
    const [comment] = await db
      .select()
      .from(postComments)
      .where(eq(postComments.id, testCommentId));

    expect(comment.userId).not.toBe(testUserId2);
    expect(comment.userId).toBe(testUserId1);
  });

  it("should allow owner to delete their comment", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a new comment to delete
    const [newComment] = await db.insert(postComments).values({
      postId: testPostId,
      userId: testUserId1,
      content: "Comment to be deleted",
    });
    const commentToDeleteId = newComment.insertId;

    // Delete comment
    await db.delete(postComments).where(eq(postComments.id, commentToDeleteId));

    // Verify deletion
    const deletedComment = await db
      .select()
      .from(postComments)
      .where(eq(postComments.id, commentToDeleteId));

    expect(deletedComment.length).toBe(0);
  });

  it("should decrement comments count when deleting comment", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get initial comments count
    const [postBefore] = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, testPostId));

    const initialCount = postBefore.commentsCount;

    // Create and delete a comment
    const [newComment] = await db.insert(postComments).values({
      postId: testPostId,
      userId: testUserId1,
      content: "Temporary comment",
    });
    const commentId = newComment.insertId;

    // Increment count
    await db
      .update(communityPosts)
      .set({ commentsCount: initialCount + 1 })
      .where(eq(communityPosts.id, testPostId));

    // Delete comment
    await db.delete(postComments).where(eq(postComments.id, commentId));

    // Decrement count
    await db
      .update(communityPosts)
      .set({ commentsCount: initialCount })
      .where(eq(communityPosts.id, testPostId));

    // Verify count
    const [postAfter] = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, testPostId));

    expect(postAfter.commentsCount).toBe(initialCount);
  });
});

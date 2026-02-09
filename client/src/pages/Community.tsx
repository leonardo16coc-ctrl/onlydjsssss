import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Heart, MessageCircle, Send, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../_core/hooks/useAuth";
import { getLoginUrl } from "../const";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { toast } from "sonner";

export default function Community() {
  const { user } = useAuth();

  const [newPostContent, setNewPostContent] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingPostContent, setEditingPostContent] = useState("");
  const [deletePostId, setDeletePostId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: posts, isLoading } = trpc.community.getPosts.useQuery({ limit: 20, offset: 0 });
  const { data: userLikes = [] } = trpc.community.getUserLikes.useQuery(undefined, {
    enabled: !!user,
  });

  const createPost = trpc.community.createPost.useMutation({
    onSuccess: () => {
      setNewPostContent("");
      utils.community.getPosts.invalidate();
      toast.success("Post created successfully");
    },
  });

  const updatePost = trpc.community.updatePost.useMutation({
    onSuccess: () => {
      setEditingPostId(null);
      setEditingPostContent("");
      utils.community.getPosts.invalidate();
      toast.success("Post updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating post: ${error.message}`);
    },
  });

  const deletePost = trpc.community.deletePost.useMutation({
    onSuccess: () => {
      setDeletePostId(null);
      utils.community.getPosts.invalidate();
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting post: ${error.message}`);
    },
  });

  const likePost = trpc.community.likePost.useMutation({
    onSuccess: (_, variables) => {
      utils.community.getPosts.invalidate();
      utils.community.getUserLikes.invalidate();
    },
  });

  const unlikePost = trpc.community.unlikePost.useMutation({
    onSuccess: () => {
      utils.community.getPosts.invalidate();
      utils.community.getUserLikes.invalidate();
    },
  });

  const addComment = trpc.community.addComment.useMutation({
    onSuccess: (_, variables) => {
      setCommentInputs((prev) => ({ ...prev, [variables.postId]: "" }));
      utils.community.getPosts.invalidate();
      utils.community.getComments.invalidate({ postId: variables.postId });
      toast.success("Comment added successfully");
    },
  });

  const handleCreatePost = () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    if (newPostContent.trim()) {
      createPost.mutate({ content: newPostContent });
    }
  };

  const handleEditPost = (postId: number, currentContent: string) => {
    setEditingPostId(postId);
    setEditingPostContent(currentContent);
  };

  const handleSaveEdit = (postId: number) => {
    if (editingPostContent.trim()) {
      updatePost.mutate({ postId, content: editingPostContent });
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditingPostContent("");
  };

  const handleDeletePost = (postId: number) => {
    setDeletePostId(postId);
  };

  const confirmDeletePost = () => {
    if (deletePostId) {
      deletePost.mutate({ postId: deletePostId });
    }
  };

  const handleLike = (postId: number) => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    if (userLikes.includes(postId)) {
      unlikePost.mutate({ postId });
    } else {
      likePost.mutate({ postId });
    }
  };

  const handleAddComment = (postId: number) => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    const content = commentInputs[postId]?.trim();
    if (content) {
      addComment.mutate({ postId, content });
    }
  };

  const toggleComments = (postId: number) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Community</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Community</h1>

        {/* Create Post */}
        <Card className="p-4 mb-6">
          <Textarea
            placeholder="Share something with the community..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="mb-3 min-h-[100px]"
          />
          <Button
            onClick={handleCreatePost}
            disabled={!newPostContent.trim() || createPost.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            Post
          </Button>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts?.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={userLikes.includes(post.id)}
              onLike={() => handleLike(post.id)}
              onToggleComments={() => toggleComments(post.id)}
              showComments={showComments[post.id]}
              commentInput={commentInputs[post.id] || ""}
              onCommentChange={(value) =>
                setCommentInputs((prev) => ({ ...prev, [post.id]: value }))
              }
              onAddComment={() => handleAddComment(post.id)}
              isAddingComment={addComment.isPending}
              currentUserId={user?.id}
              isEditing={editingPostId === post.id}
              editingContent={editingPostContent}
              onEditingContentChange={setEditingPostContent}
              onEdit={() => handleEditPost(post.id, post.content)}
              onSaveEdit={() => handleSaveEdit(post.id)}
              onCancelEdit={handleCancelEdit}
              onDelete={() => handleDeletePost(post.id)}
              isSaving={updatePost.isPending}
            />
          ))}
        </div>

        {posts?.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No posts yet. Be the first to share something!</p>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletePostId !== null} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone and will also
              delete all comments and likes associated with this post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface PostCardProps {
  post: {
    id: number;
    content: string;
    likesCount: number;
    commentsCount: number;
    createdAt: Date;
    user: {
      id: number;
      name: string | null;
      djName: string | null;
      avatarUrl: string | null;
      isVerified: boolean | null;
    } | null;
  };
  isLiked: boolean;
  onLike: () => void;
  onToggleComments: () => void;
  showComments: boolean;
  commentInput: string;
  onCommentChange: (value: string) => void;
  onAddComment: () => void;
  isAddingComment: boolean;
  currentUserId?: number;
  isEditing: boolean;
  editingContent: string;
  onEditingContentChange: (value: string) => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  isSaving: boolean;
}

function PostCard({
  post,
  isLiked,
  onLike,
  onToggleComments,
  showComments,
  commentInput,
  onCommentChange,
  onAddComment,
  isAddingComment,
  currentUserId,
  isEditing,
  editingContent,
  onEditingContentChange,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  isSaving,
}: PostCardProps) {
  const { data: comments } = trpc.community.getComments.useQuery(
    { postId: post.id },
    { enabled: showComments }
  );

  const displayName = post.user?.djName || post.user?.name || "Anonymous";
  const timeAgo = getTimeAgo(post.createdAt);
  const isOwner = currentUserId === post.user?.id;

  return (
    <Card className="p-4">
      {/* Post Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
          {displayName[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{displayName}</div>
          <div className="text-sm text-muted-foreground">{timeAgo}</div>
        </div>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Post Content */}
      {isEditing ? (
        <div className="mb-4">
          <Textarea
            value={editingContent}
            onChange={(e) => onEditingContentChange(e.target.value)}
            className="mb-2 min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button onClick={onSaveEdit} disabled={!editingContent.trim() || isSaving} size="sm">
              Save
            </Button>
            <Button onClick={onCancelEdit} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-4 mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={isLiked ? "text-red-500" : ""}
        >
          <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
          {post.likesCount}
        </Button>
        <Button variant="ghost" size="sm" onClick={onToggleComments}>
          <MessageCircle className="w-4 h-4 mr-1" />
          {post.commentsCount}
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t pt-3 mt-3">
          {/* Add Comment */}
          <div className="flex gap-2 mb-3">
            <Textarea
              placeholder="Write a comment..."
              value={commentInput}
              onChange={(e) => onCommentChange(e.target.value)}
              className="min-h-[60px]"
            />
            <Button
              onClick={onAddComment}
              disabled={!commentInput.trim() || isAddingComment}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments?.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

interface CommentItemProps {
  comment: {
    id: number;
    content: string;
    createdAt: Date;
    userId: number;
    user: {
      id: number;
      name: string | null;
      djName: string | null;
      avatarUrl: string | null;
      isVerified: boolean | null;
    } | null;
  };
  currentUserId?: number;
}

function CommentItem({ comment, currentUserId }: CommentItemProps) {

  const utils = trpc.useUtils();
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState(comment.content);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);

  const updateComment = trpc.community.updateComment.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      utils.community.getComments.invalidate();
      toast.success("Comment updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating comment: ${error.message}`);
    },
  });

  const deleteComment = trpc.community.deleteComment.useMutation({
    onSuccess: () => {
      setDeleteCommentId(null);
      utils.community.getComments.invalidate();
      utils.community.getPosts.invalidate();
      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting comment: ${error.message}`);
    },
  });

  const handleSaveEdit = () => {
    if (editingContent.trim()) {
      updateComment.mutate({ commentId: comment.id, content: editingContent });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingContent(comment.content);
  };

  const confirmDeleteComment = () => {
    if (deleteCommentId) {
      deleteComment.mutate({ commentId: deleteCommentId });
    }
  };

  const displayName = comment.user?.djName || comment.user?.name || "Anonymous";
  const isOwner = currentUserId === comment.userId;

  return (
    <>
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {displayName[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="bg-muted rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold text-sm">{displayName}</div>
              {isOwner && !isEditing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="w-3 h-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteCommentId(comment.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {isEditing ? (
              <div>
                <Textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="mb-2 min-h-[60px] text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={!editingContent.trim() || updateComment.isPending}
                    size="sm"
                  >
                    Save
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm">{comment.content}</p>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {getTimeAgo(comment.createdAt)}
          </div>
        </div>
      </div>

      {/* Delete Comment Confirmation Dialog */}
      <AlertDialog open={deleteCommentId !== null} onOpenChange={() => setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteComment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

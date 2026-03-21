import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Search, MessageCircle, ArrowLeft, CheckCheck, Check, Plus, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

function getDisplayName(user: { djName?: string | null; name?: string | null; username?: string | null }) {
  return user.djName || user.name || user.username || "Usuario";
}

function getAvatarUrl(user: { avatarUrl?: string | null; profileImageUrl?: string | null }) {
  return user.avatarUrl || user.profileImageUrl || "";
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function Messages() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatQuery, setNewChatQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: conversations, refetch: refetchConversations } = trpc.messaging.getConversations.useQuery(
    undefined,
    { enabled: !!user, refetchInterval: 5000 }
  );

  const { data: messages, refetch: refetchMessages } = trpc.messaging.getMessages.useQuery(
    { conversationId: selectedConvId! },
    { enabled: !!selectedConvId, refetchInterval: 3000 }
  );

  const { data: userSearch } = trpc.messaging.searchUsers.useQuery(
    { query: newChatQuery },
    { enabled: newChatQuery.length >= 1 }
  );

  // Mutations
  const sendMessage = trpc.messaging.sendMessage.useMutation({
    onSuccess: () => {
      setMessageInput("");
      refetchMessages();
      refetchConversations();
    },
    onError: (err) => toast.error(err.message),
  });

  const markAsRead = trpc.messaging.markAsRead.useMutation();

  const getOrCreate = trpc.messaging.getOrCreateConversation.useMutation({
    onSuccess: (data) => {
      setSelectedConvId(data.conversationId);
      setShowNewChat(false);
      setNewChatQuery("");
      refetchConversations();
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (selectedConvId) {
      markAsRead.mutate({ conversationId: selectedConvId });
    }
  }, [selectedConvId]);

  // Focus input when conversation selected
  useEffect(() => {
    if (selectedConvId) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedConvId]);

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConvId) return;
    const conv = conversations?.find((c) => c.id === selectedConvId);
    if (!conv || !user) return;

    const receiverId = conv.otherUser.id;
    sendMessage.mutate({ receiverId, content: messageInput.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedConv = conversations?.find((c) => c.id === selectedConvId);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
        <MessageCircle className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Inicia sesión para ver tus mensajes</h2>
        <Button onClick={() => navigate("/")}>Ir al inicio</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar: Conversation List */}
      <div
        className={`flex flex-col border-r border-border bg-card w-full md:w-80 flex-shrink-0 ${
          selectedConvId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-bold">Mensajes</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNewChat(!showNewChat)}
              className="text-primary hover:text-primary"
            >
              {showNewChat ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </Button>
          </div>

          {/* New Chat Search */}
          {showNewChat && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar DJ o usuario..."
                  value={newChatQuery}
                  onChange={(e) => setNewChatQuery(e.target.value)}
                  className="pl-9 bg-muted/50"
                  autoFocus
                />
              </div>
              {userSearch && userSearch.length > 0 && (
                <div className="rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                  {userSearch.map((u) => (
                    <button
                      key={u.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => getOrCreate.mutate({ otherUserId: u.id })}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getAvatarUrl(u)} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {getInitials(getDisplayName(u))}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{getDisplayName(u)}</p>
                        {u.username && <p className="text-xs text-muted-foreground">@{u.username}</p>}
                      </div>
                      {u.isVerified && (
                        <Badge variant="secondary" className="ml-auto text-xs">✓</Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {userSearch && userSearch.length === 0 && newChatQuery.length >= 1 && (
                <p className="text-sm text-muted-foreground text-center py-2">No se encontraron usuarios</p>
              )}
            </div>
          )}

          {/* Search existing conversations */}
          {!showNewChat && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50"
              />
            </div>
          )}
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          {!conversations || conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
              <MessageCircle className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No tienes conversaciones aún</p>
              <p className="text-xs text-muted-foreground">
                Haz clic en <strong>+</strong> para empezar a chatear con otros DJs
              </p>
            </div>
          ) : (
            conversations
              .filter((conv) => {
                if (!searchQuery) return true;
                const name = getDisplayName(conv.otherUser).toLowerCase();
                return name.includes(searchQuery.toLowerCase());
              })
              .map((conv) => (
                <button
                  key={conv.id}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border/50 ${
                    selectedConvId === conv.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
                  }`}
                  onClick={() => setSelectedConvId(conv.id)}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={getAvatarUrl(conv.otherUser)} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/30 to-purple-500/30 text-sm font-semibold">
                        {getInitials(getDisplayName(conv.otherUser))}
                      </AvatarFallback>
                    </Avatar>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium truncate ${conv.unreadCount > 0 ? "font-bold" : ""}`}>
                        {getDisplayName(conv.otherUser)}
                      </p>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {conv.lastMessageAt
                          ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false, locale: es })
                          : ""}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {conv.lastMessagePreview || "Sin mensajes"}
                    </p>
                  </div>
                </button>
              ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedConvId ? "hidden md:flex" : "flex"}`}>
        {!selectedConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Tus mensajes</h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                Conecta con otros DJs, comparte tracks y colabora en proyectos
              </p>
            </div>
            <Button onClick={() => setShowNewChat(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo mensaje
            </Button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedConvId(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              {selectedConv && (
                <>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={getAvatarUrl(selectedConv.otherUser)} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-purple-500/30 text-sm font-semibold">
                      {getInitials(getDisplayName(selectedConv.otherUser))}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{getDisplayName(selectedConv.otherUser)}</p>
                    {selectedConv.otherUser.username && (
                      <p className="text-xs text-muted-foreground">@{selectedConv.otherUser.username}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-xs text-muted-foreground"
                    onClick={() => navigate(`/dj/${selectedConv.otherUser.username}`)}
                  >
                    Ver perfil
                  </Button>
                </>
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3 max-w-2xl mx-auto">
                {!messages || messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2 text-center">
                    <p className="text-muted-foreground text-sm">
                      Sé el primero en enviar un mensaje
                    </p>
                  </div>
                ) : (
                  messages.map((msg: any, idx: number) => {
                    const isOwn = msg.senderId === user.id;
                    const showDate =
                      idx === 0 ||
                      new Date(msg.createdAt).toDateString() !==
                        new Date(messages[idx - 1].createdAt).toDateString();

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex items-center gap-2 my-4">
                            <Separator className="flex-1" />
                            <span className="text-xs text-muted-foreground px-2">
                              {new Date(msg.createdAt).toLocaleDateString("es", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              })}
                            </span>
                            <Separator className="flex-1" />
                          </div>
                        )}
                        <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                              <span className={`text-xs ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {new Date(msg.createdAt).toLocaleTimeString("es", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isOwn && (
                                msg.isRead
                                  ? <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                                  : <Check className="h-3 w-3 text-primary-foreground/50" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2 max-w-2xl mx-auto">
                <Input
                  ref={inputRef}
                  placeholder="Escribe un mensaje..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-muted/50 border-muted"
                  maxLength={2000}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!messageInput.trim() || sendMessage.isPending}
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Presiona Enter para enviar
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

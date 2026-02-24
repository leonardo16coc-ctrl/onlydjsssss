import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ListPlus, Plus, Check } from "lucide-react";
import { toast } from "sonner";

interface AddToPlaylistButtonProps {
  trackId: number;
  trackTitle: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function AddToPlaylistButton({
  trackId,
  trackTitle,
  variant = "outline",
  size = "sm",
}: AddToPlaylistButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const { data: playlists, refetch } = trpc.playlists.getMyPlaylists.useQuery(
    undefined,
    { enabled: isOpen }
  );

  const createPlaylistMutation = trpc.playlists.create.useMutation({
    onSuccess: async (newPlaylist: any) => {
      toast.success("Playlist created!");
      await refetch();
      setNewPlaylistName("");
      setIsCreatingNew(false);
      // Automatically add track to new playlist
      if (newPlaylist?.id) {
        addTrackMutation.mutate({ playlistId: newPlaylist.id, trackId });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create playlist");
    },
  });

  const addTrackMutation = trpc.playlists.addTrack.useMutation({
    onSuccess: () => {
      toast.success(`Added "${trackTitle}" to playlist`);
      setIsOpen(false);
    },
    onError: (error) => {
      if (error.message.includes("already in playlist")) {
        toast.info("Track is already in this playlist");
      } else {
        toast.error(error.message || "Failed to add track");
      }
    },
  });

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    createPlaylistMutation.mutate({
      name: newPlaylistName,
      isPublic: true,
    });
  };

  const handleAddToPlaylist = (playlistId: number) => {
    addTrackMutation.mutate({ playlistId, trackId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <ListPlus className="h-4 w-4 mr-1" />
          Add to Playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription>
            Choose a playlist or create a new one
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Create New Playlist */}
          {isCreatingNew ? (
            <div className="space-y-3 p-4 border border-border rounded-lg bg-card/50">
              <Input
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreatePlaylist();
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setNewPlaylistName("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreatePlaylist}
                  disabled={createPlaylistMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500"
                >
                  {createPlaylistMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsCreatingNew(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Playlist
            </Button>
          )}

          {/* Existing Playlists */}
          {playlists && playlists.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <p className="text-sm text-muted-foreground px-1">
                Your playlists:
              </p>
              {playlists.map((playlist: any) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  disabled={addTrackMutation.isPending}
                  className="w-full p-3 text-left border border-border rounded-lg hover:border-cyan-500/50 hover:bg-card/80 transition-all flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate group-hover:text-cyan-400 transition-colors">
                      {playlist.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {playlist.trackCount || 0} tracks
                    </p>
                  </div>
                  <ListPlus className="h-5 w-5 text-muted-foreground group-hover:text-cyan-400 transition-colors flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          {playlists && playlists.length === 0 && !isCreatingNew && (
            <p className="text-center text-muted-foreground py-8">
              You don't have any playlists yet. Create one to get started!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

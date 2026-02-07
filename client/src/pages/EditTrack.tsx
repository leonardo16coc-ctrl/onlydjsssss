import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { Image as ImageIcon, Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";

export default function EditTrack() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const trackId = parseInt(params.id || "0");

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState<string>("");
  const [trackType, setTrackType] = useState<string>("");
  const [bpm, setBpm] = useState("");
  const [musicalKey, setMusicalKey] = useState("");
  
  // Cover image states
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploaded, setCoverUploaded] = useState(false);
  const [uploadedCover, setUploadedCover] = useState<{
    fileKey: string;
    fileUrl: string;
  } | null>(null);

  // Fetch track data
  const { data: track, isLoading } = trpc.tracks.getById.useQuery({ id: trackId });
  const updateTrack = trpc.tracks.update.useMutation();

  // Load track data into form
  useEffect(() => {
    if (track) {
      setTitle(track.title);
      setArtist(track.artist);
      setGenre(track.genre);
      setTrackType(track.trackType);
      setBpm(track.bpm?.toString() || "");
      setMusicalKey(track.musicalKey || "");
      if (track.coverImageUrl) {
        setCoverPreview(track.coverImageUrl);
      }
    }
  }, [track]);

  // Verify ownership
  useEffect(() => {
    if (track && user && track.userId !== user.id) {
      toast.error("No tienes permiso para editar este track");
      setLocation("/dashboard");
    }
  }, [track, user]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(t('upload.imageOnly'));
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('upload.imageTooLarge'));
        return;
      }
      
      setCoverImage(file);
      setCoverUploaded(false);
      setUploadedCover(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadCover = async () => {
    if (!coverImage) {
      toast.error("Selecciona una imagen primero");
      return;
    }

    setIsUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append("file", coverImage);

      const response = await fetch("/api/upload/cover", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al subir la imagen");
      }

      const data = await response.json();
      setUploadedCover({
        fileKey: data.fileKey,
        fileUrl: data.fileUrl,
      });
      setCoverUploaded(true);
      toast.success("Imagen subida correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al subir la portada");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !artist || !genre || !trackType) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    try {
      const updateData: any = {
        id: trackId,
        title,
        artist,
        genre: genre as any,
        trackType: trackType as any,
      };

      if (bpm) updateData.bpm = parseInt(bpm);
      if (musicalKey) updateData.musicalKey = musicalKey;
      
      // Only update cover if a new one was uploaded
      if (uploadedCover) {
        updateData.coverImageKey = uploadedCover.fileKey;
        updateData.coverImageUrl = uploadedCover.fileUrl;
      }

      await updateTrack.mutateAsync(updateData);

      toast.success("Track actualizado correctamente");
      
      // Redirect to explore or dashboard
      setTimeout(() => setLocation("/explore"), 1500);
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el track");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Debes iniciar sesión para editar tracks</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Cargando track...</p>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Track no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-gradient">
              Editar Track
            </h1>
            <p className="text-muted-foreground">
              Actualiza la información de tu track
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Cover Image */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Imagen de Portada</h3>
                
                <div className="space-y-4">
                  {/* Preview */}
                  {coverPreview && (
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={coverPreview} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Upload */}
                  <div>
                    <Label htmlFor="cover-image">
                      Nueva imagen (opcional)
                    </Label>
                    <Input
                      id="cover-image"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="mt-2"
                    />
                  </div>

                  {coverImage && !coverUploaded && (
                    <Button 
                      onClick={handleUploadCover}
                      disabled={isUploadingCover}
                      className="w-full"
                    >
                      {isUploadingCover ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Subir Nueva Imagen
                        </>
                      )}
                    </Button>
                  )}

                  {coverUploaded && (
                    <div className="flex items-center gap-2 text-green-500">
                      <Save className="w-4 h-4" />
                      <span className="text-sm">Imagen lista para guardar</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - Track Info */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Información del Track</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Track name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="artist">Artista *</Label>
                    <Input
                      id="artist"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder="Your artist name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="genre">Género *</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tech House">Tech House</SelectItem>
                        <SelectItem value="Bass House">Bass House</SelectItem>
                        <SelectItem value="Afro House">Afro House</SelectItem>
                        <SelectItem value="Techno">Techno</SelectItem>
                        <SelectItem value="Melodic Techno">Melodic Techno</SelectItem>
                        <SelectItem value="Big Room">Big Room</SelectItem>
                        <SelectItem value="EDM">EDM</SelectItem>
                        <SelectItem value="Hard Techno">Hard Techno</SelectItem>
                        <SelectItem value="Latin">Latin</SelectItem>
                        <SelectItem value="Reggaeton">Reggaeton</SelectItem>
                        <SelectItem value="Hip-Hop">Hip-Hop</SelectItem>
                        <SelectItem value="Open Format">Open Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="trackType">Tipo *</Label>
                    <Select value={trackType} onValueChange={setTrackType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Extended Mix">Extended Mix</SelectItem>
                        <SelectItem value="Edit">Edit</SelectItem>
                        <SelectItem value="Mashup">Mashup</SelectItem>
                        <SelectItem value="Remix">Remix</SelectItem>
                        <SelectItem value="Rework">Rework</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bpm">BPM</Label>
                      <Input
                        id="bpm"
                        type="number"
                        value={bpm}
                        onChange={(e) => setBpm(e.target.value)}
                        placeholder="128"
                      />
                    </div>

                    <div>
                      <Label htmlFor="key">Clave Musical</Label>
                      <Input
                        id="key"
                        value={musicalKey}
                        onChange={(e) => setMusicalKey(e.target.value)}
                        placeholder="Am"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Save Button */}
              <Button 
                onClick={handleSubmit}
                disabled={updateTrack.isPending}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                size="lg"
              >
                {updateTrack.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

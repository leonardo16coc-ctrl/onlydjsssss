import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect } from "wouter";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { User, Loader2, Upload as UploadIcon, Save, Image as ImageIcon } from "lucide-react";

export default function ProfileEdit() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [djName, setDjName] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  
  // Profile image states
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: profile, isLoading } = trpc.profile.getOwnProfile.useQuery();
  const updateProfile = trpc.profile.updateProfile.useMutation();
  const uploadProfileImage = trpc.profile.uploadProfileImage.useMutation();

  // Load profile data
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setDjName(profile.djName || "");
      setBio(profile.bio || "");
      setCountry(profile.country || "");
      setProfilePreview(profile.profileImageUrl || null);
      
      const social = profile.socialLinks || {};
      setInstagram(social.instagram || "");
      setTwitter(social.twitter || "");
      setWebsite(social.website || "");
      setContactEmail((profile as any).contactEmail || "");
    }
  }, [profile]);

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error(t("profile.invalidFormat"));
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("profile.imageTooLarge"));
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!profileImage) return;

    setIsUploadingImage(true);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(",")[1];
        if (!base64) {
          toast.error(t("profile.errorReadingImage"));
          setIsUploadingImage(false);
          return;
        }

        try {
          await uploadProfileImage.mutateAsync({
            file: base64,
            mimeType: profileImage.type,
            fileName: profileImage.name,
          });

          toast.success(t("profile.profileImageUpdated"));
          setProfileImage(null);
        } catch (error) {
          toast.error(t("profile.errorUploadingImage"));
          console.error(error);
        } finally {
          setIsUploadingImage(false);
        }
      };

      reader.onerror = () => {
        toast.error(t("profile.errorReadingImage"));
        setIsUploadingImage(false);
      };

      reader.readAsDataURL(profileImage);
    } catch (error) {
      toast.error(t("profile.errorUploadingImage"));
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const socialLinks: Record<string, string> = {};
      if (instagram) socialLinks.instagram = instagram;
      if (twitter) socialLinks.twitter = twitter;
      if (website) socialLinks.website = website;

      await updateProfile.mutateAsync({
        username: username || undefined,
        djName: djName || undefined,
        bio: bio || undefined,
        country: country || undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        contactEmail: contactEmail.trim() || null,
      });

      toast.success(t("profile.profileUpdated"));
    } catch (error: any) {
      toast.error(error.message || t("profile.errorUpdatingProfile"));
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-glow-cyan">
          <User className="inline h-10 w-10 mr-2" />
          Editar Perfil
        </h1>

        {/* Profile Image Upload */}
        <Card className="card-neon p-8 bg-card mb-6">
          <h2 className="text-2xl font-bold mb-6 text-glow-purple">Imagen de Perfil</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Preview */}
            <div className="relative">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary glow-cyan"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-card border-4 border-primary glow-cyan flex items-center justify-center">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Upload */}
            <div className="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
                id="profile-image-upload"
                disabled={isUploadingImage}
              />
              <label htmlFor="profile-image-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full md:w-auto mb-3"
                  onClick={() => document.getElementById("profile-image-upload")?.click()}
                  disabled={isUploadingImage}
                >
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Seleccionar Imagen
                </Button>
              </label>
              
              {profileImage && (
                <Button
                  onClick={handleUploadImage}
                  disabled={isUploadingImage}
                  className="w-full md:w-auto bg-primary hover:bg-primary/90"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-5 w-5 mr-2" />
                      Subir Imagen
                    </>
                  )}
                </Button>
              )}
              
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG o WebP. Máximo 10MB. Recomendado: 400x400px
              </p>
            </div>
          </div>
        </Card>

        {/* Profile Form */}
        <Card className="card-neon p-8 bg-card">
          <h2 className="text-2xl font-bold mb-6 text-glow-purple">Información del Perfil</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Username (único) *</Label>
                <Input
                  placeholder="tu_username"
                  className="bg-background"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tu perfil será: /dj/{username || "username"}
                </p>
              </div>

              <div>
                <Label>Nombre de DJ</Label>
                <Input
                  placeholder="DJ Name"
                  className="bg-background"
                  value={djName}
                  onChange={(e) => setDjName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Biografía</Label>
              <Textarea
                placeholder="Cuéntanos sobre ti, tu estilo musical, experiencia..."
                className="bg-background min-h-[120px]"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {bio.length}/1000 caracteres
              </p>
            </div>

            <div>
              <Label>País</Label>
              <Input
                placeholder="México"
                className="bg-background"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

            <Separator />

            <h3 className="text-xl font-bold text-glow-cyan">Redes Sociales</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Instagram</Label>
                <Input
                  placeholder="https://instagram.com/tu_usuario"
                  className="bg-background"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  type="url"
                />
              </div>

              <div>
                <Label>Twitter / X</Label>
                <Input
                  placeholder="https://twitter.com/tu_usuario"
                  className="bg-background"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  type="url"
                />
              </div>
            </div>

            <div>
              <Label>Sitio Web</Label>
              <Input
                placeholder="https://tu-sitio.com"
                className="bg-background"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                type="url"
              />
            </div>

            <Separator />

            <div>
              <Label className="flex items-center gap-2">
                Email de Contacto Público
                <span className="text-xs text-muted-foreground font-normal">(visible para sellos y promotores)</span>
              </Label>
              <Input
                placeholder="booking@tuemail.com"
                className="bg-background"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                type="email"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este email será visible en tu perfil público. Déjalo vacío si prefieres no mostrarlo.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full btn-neon bg-primary hover:bg-primary/90 glow-cyan"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

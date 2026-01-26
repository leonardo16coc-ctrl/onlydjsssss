import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect } from "wouter";
import { Upload as UploadIcon } from "lucide-react";

export default function Upload() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.membershipStatus === "free") {
    return <Redirect to="/membership" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-glow-cyan">
          <UploadIcon className="inline h-10 w-10 mr-2" />
          Subir Track
        </h1>

        <Card className="card-neon p-8 bg-card">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Título</Label>
                <Input placeholder="Nombre del track" className="bg-background" />
              </div>
              <div>
                <Label>Artista</Label>
                <Input placeholder="Tu nombre de DJ" className="bg-background" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>BPM</Label>
                <Input type="number" placeholder="128" className="bg-background" />
              </div>
              <div>
                <Label>Key</Label>
                <Input placeholder="Am" className="bg-background" />
              </div>
              <div>
                <Label>Género</Label>
                <Input placeholder="Tech House" className="bg-background" />
              </div>
            </div>

            <div>
              <Label>Archivo de Audio</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                <p className="text-xs text-muted-foreground mt-2">MP3 320kbps o WAV</p>
              </div>
            </div>

            <Button className="w-full btn-neon bg-primary hover:bg-primary/90 glow-cyan">
              Subir Track
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
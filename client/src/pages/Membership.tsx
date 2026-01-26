import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Membership() {
  const { user, isAuthenticated } = useAuth();
  const createCheckout = trpc.membership.createCheckout.useMutation();

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión primero");
      return;
    }

    try {
      const { checkoutUrl } = await createCheckout.mutateAsync();
      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank");
        toast.info("Redirigiendo a Stripe...");
      }
    } catch (error) {
      toast.error("Error al crear sesión de pago");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-glow-pink">
            <Sparkles className="inline h-12 w-12 mr-2" />
            Membresía DJ
          </h1>
          <p className="text-2xl text-muted-foreground">
            Acceso completo por solo <span className="text-accent font-bold">$4.99 USD/mes</span>
          </p>
        </div>

        <Card className="card-neon p-8 bg-gradient-neon">
          <div className="text-center mb-8">
            <p className="text-6xl font-bold text-background mb-2">$4.99</p>
            <p className="text-xl text-background/80">USD por mes</p>
          </div>

          <div className="space-y-4 mb-8">
            {[
              "Subir tracks ilimitados",
              "Descargar música sin límites",
              "Acceso a MAINSTAGE EDITS",
              "Análisis con IA (BPM, Key, Drops)",
              "Monetización automática (60% para ti)",
              "Dashboard de estadísticas en tiempo real",
              "Sistema de rankings y trending",
              "Protección antifraude",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-background">
                <Check className="h-6 w-6 flex-shrink-0" />
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full bg-background text-primary hover:bg-background/90 text-xl py-6"
            onClick={handleSubscribe}
            disabled={user?.membershipStatus !== "free"}
          >
            {user?.membershipStatus === "free" ? "Suscribirse Ahora" : "Ya eres miembro"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
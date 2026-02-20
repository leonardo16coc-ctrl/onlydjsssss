import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Check, X, Crown, Sparkles, Zap, TrendingUp, Music, Download, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function Membership() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const createCheckout = trpc.membership.createCheckout.useMutation();

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      toast.error(t('membership.mustLoginFirst'));
      return;
    }

    // Open Sellfy subscription page
    const sellfyUrl = "https://onlydjs.sellfy.store/p/subscription/";
    window.open(sellfyUrl, "_blank");
    toast.info("Redirigiendo a la página de suscripción...");
  };

  const features = [
    {
      category: "Uploads",
      icon: Music,
      items: [
        { name: "Tracks por mes", free: "1 track", pro: "Ilimitado" },
        { name: "Formatos soportados", free: "MP3, WAV", pro: "MP3, WAV" },
        { name: "Tamaño máximo", free: "100 MB", pro: "100 MB" },
      ],
    },
    {
      category: "Descargas",
      icon: Download,
      items: [
        { name: "Descargas por mes", free: "1 descarga", pro: "Ilimitadas" },
        { name: "Formatos", free: "MP3, WAV", pro: "MP3, WAV" },
        { name: "Preview", free: "1 minuto", pro: "Completo" },
      ],
    },
    {
      category: "Monetización",
      icon: DollarSign,
      items: [
        { name: "Gana por descarga", free: false, pro: true },
        { name: "Dashboard financiero", free: false, pro: true },
        { name: "Retiros disponibles", free: false, pro: true },
      ],
    },
    {
      category: "DJ MODE",
      icon: Zap,
      items: [
        { name: "ADN DJ", free: "Vista demo", pro: "Completo" },
        { name: "Smart Suggestions", free: false, pro: true },
        { name: "Auto Set Builder", free: false, pro: true },
      ],
    },
    {
      category: "MAINSTAGE MODE",
      icon: TrendingUp,
      items: [
        { name: "AI Festival Engine", free: "Vista demo", pro: "Completo" },
        { name: "Rankings globales", free: "Parcial", pro: "Completo" },
        { name: "Festival Weapons", free: false, pro: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full mb-6">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-purple-300">{t('membership.simplePlans')}</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            {t('membership.title')}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('membership.subtitle')} <span className="text-green-500 font-bold">$4.99{t('membership.perMonth')}</span>
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* FREE Plan */}
          <Card className="p-8 border-border/50 bg-card/50 backdrop-blur">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{t('membership.free')}</h3>
              <div className="text-4xl font-bold mb-2">$0</div>
              <p className="text-sm text-muted-foreground">{t('membership.freeForever')}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">{t('membership.features.oneTrack')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">{t('membership.features.oneDownload')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">{t('membership.features.preview')}: {t('membership.features.oneMinute')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">{t('explore.title')}</span>
              </div>
              <div className="flex items-center gap-3">
                <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{t('membership.features.no')} {t('membership.features.monetization')}</span>
              </div>
              <div className="flex items-center gap-3">
                <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{t('membership.features.djMode')} {t('membership.features.demoView')}</span>
              </div>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="w-full"
              disabled
            >
              {t('membership.currentPlan')}
            </Button>
          </Card>

          {/* PRO Plan */}
          <Card className="p-8 border-purple-500/50 bg-gradient-to-br from-purple-950/30 via-background to-pink-950/30 backdrop-blur-xl relative overflow-hidden">
            {/* Popular Badge */}
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
                {t('membership.popular')}
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                <h3 className="text-2xl font-bold">{t('membership.pro')}</h3>
              </div>
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                $4.99
              </div>
              <p className="text-sm text-muted-foreground">USD{t('membership.perMonth')}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">{t('membership.features.uploads')} {t('membership.features.unlimited')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">{t('membership.features.downloads')} {t('membership.features.unlimited')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">{t('membership.features.complete')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">Monetización activa</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">DJ MODE completo</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">MAINSTAGE MODE completo</span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleSubscribe}
              disabled={user?.membershipStatus !== "free"}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white font-bold shadow-lg shadow-purple-500/50"
            >
              {user?.membershipStatus === "free" ? (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Actualizar a PRO
                </>
              ) : (
                "Ya eres PRO"
              )}
            </Button>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Comparación Detallada</h2>
          
          <div className="space-y-8">
            {features.map((category, idx) => (
              <Card key={idx} className="p-6 bg-card/50 border-border/50 backdrop-blur">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <category.icon className="h-5 w-5 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold">{category.category}</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Característica</th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">FREE</th>
                        <th className="text-center py-3 px-4 font-medium text-purple-500">PRO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="border-b border-border/50">
                          <td className="py-3 px-4">{item.name}</td>
                          <td className="py-3 px-4 text-center">
                            {typeof item.free === "boolean" ? (
                              item.free ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-muted-foreground">{item.free}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {typeof item.pro === "boolean" ? (
                              item.pro ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm font-medium text-green-500">{item.pro}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            ¿Preguntas? Contáctanos en support@onlydjs.com
          </p>
          <p className="text-xs text-muted-foreground">
            Cancela cuando quieras · Sin compromisos · Pago seguro con Sellfy
          </p>
        </div>
      </div>
    </div>
  );
}

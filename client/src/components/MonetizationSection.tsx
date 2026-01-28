import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Users, Sparkles, Crown, Music, Download } from "lucide-react";
import { useLocation } from "wouter";

/**
 * MonetizationSection - Explains how DJs can earn money on ONLYDJS
 * Shows benefits of PRO membership for monetization
 */
export default function MonetizationSection() {
  const [, setLocation] = useLocation();

  const benefits = [
    {
      icon: DollarSign,
      title: "Gana por Descarga",
      description: "Cada vez que alguien descarga tu track, ganas dinero. Simple y directo.",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: TrendingUp,
      title: "Tracking en Tiempo Real",
      description: "Dashboard completo con estadísticas de descargas y ganancias actualizadas.",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      icon: Users,
      title: "Audiencia Global",
      description: "Miles de DJs buscando tracks profesionales. Tu música, su próximo set.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const stats = [
    { label: "Promedio por Track", value: "$50-200", sublabel: "mensual" },
    { label: "Top DJs Ganan", value: "$500+", sublabel: "por mes" },
    { label: "Pago Mínimo", value: "$25", sublabel: "retiro" },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-purple-950/10 to-background">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full mb-6">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-purple-300">Solo para Miembros PRO</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Monetiza Tu Música
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ONLYDJS no es solo un pool de música. Es tu plataforma para{" "}
            <span className="text-green-500 font-semibold">ganar dinero</span> con cada track que subes.
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-purple-950/30 via-background to-pink-950/30 border-purple-500/30 backdrop-blur-xl mb-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: How it works */}
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Music className="h-6 w-6 text-purple-500" />
                ¿Cómo Funciona?
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Sube tus Tracks</h4>
                    <p className="text-sm text-muted-foreground">
                      Uploads ilimitados con membresía PRO ($4.99/mes)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">DJs Descargan</h4>
                    <p className="text-sm text-muted-foreground">
                      Cada descarga genera revenue automáticamente
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Recibe tu Pago</h4>
                    <p className="text-sm text-muted-foreground">
                      Retira tus ganancias cuando alcances $25 USD
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-500 mb-1">
                      Ejemplo Real
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Un track con 100 descargas mensuales puede generar entre $50-200 USD dependiendo del plan de los usuarios que lo descarguen.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Stats */}
            <div>
              <div className="grid gap-4">
                {stats.map((stat, index) => (
                  <Card
                    key={index}
                    className="p-6 bg-gradient-to-br from-purple-950/50 to-pink-950/50 border-purple-500/20"
                  >
                    <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                    <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-500">
                    Requisito: Membresía PRO
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Solo usuarios PRO pueden monetizar sus tracks. Usuarios FREE pueden subir 1 track/mes pero sin monetización.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="p-6 bg-card/50 border-border/50 backdrop-blur hover:border-purple-500/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg ${benefit.bgColor} flex items-center justify-center mb-4`}>
                <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
              </div>
              <h4 className="font-bold text-lg mb-2">{benefit.title}</h4>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => setLocation("/membership")}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white font-bold px-8 py-6 text-lg shadow-lg shadow-purple-500/50"
          >
            <Crown className="h-5 w-5 mr-2" />
            Empieza a Ganar con PRO
            <Sparkles className="h-5 w-5 ml-2" />
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            Solo $4.99/mes · Cancela cuando quieras · Primeros 30 días con garantía
          </p>
        </div>
      </div>
    </section>
  );
}

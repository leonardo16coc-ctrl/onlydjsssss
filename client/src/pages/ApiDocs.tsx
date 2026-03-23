import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Copy, Check, Code2, Globe, Zap, BookOpen, Terminal } from "lucide-react";

const BASE_URL = "https://www.onlydjss.com/api/v1";

interface Endpoint {
  method: "GET";
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  example: string;
  sampleResponse: object;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/tracks",
    description: "Lista paginada de tracks aprobados. Ideal para mostrar el catálogo completo o filtrado por género.",
    params: [
      { name: "page",      type: "number",  required: false, description: "Número de página (default: 1)" },
      { name: "limit",     type: "number",  required: false, description: "Resultados por página, máx 100 (default: 20)" },
      { name: "genre",     type: "string",  required: false, description: "Filtrar por género: Tech House, Techno, etc." },
      { name: "trackType", type: "string",  required: false, description: "Filtrar por tipo: Edit, Remix, Mashup, etc." },
      { name: "sort",      type: "string",  required: false, description: "Ordenar por: newest | popular | trending" },
    ],
    example: `${BASE_URL}/tracks?genre=Tech+House&sort=popular&limit=10`,
    sampleResponse: {
      data: [{ id: 1, title: "Summer Groove", artist: "DJ Manu", genre: "Tech House", bpm: 128, musicalKey: "Am", trackType: "Edit", coverImageUrl: "https://...", previewUrl: "https://...", stats: { downloads: 420, streams: 1200, likes: 89 }, dj: { id: 5, username: "djmanu", djName: "DJ Manu", avatarUrl: "https://..." }, url: "https://www.onlydjss.com/dj/djmanu/track/1", createdAt: "2025-01-15T12:00:00Z" }],
      pagination: { page: 1, limit: 10, total: 3400, totalPages: 340 },
    },
  },
  {
    method: "GET",
    path: "/tracks/:id",
    description: "Detalle completo de un track por su ID.",
    params: [
      { name: "id", type: "number", required: true, description: "ID numérico del track" },
    ],
    example: `${BASE_URL}/tracks/1`,
    sampleResponse: {
      data: { id: 1, title: "Summer Groove", artist: "DJ Manu", genre: "Tech House", bpm: 128, musicalKey: "Am", trackType: "Edit", durationSeconds: 360, coverImageUrl: "https://...", previewUrl: "https://...", stats: { downloads: 420, streams: 1200, likes: 89 }, dj: { id: 5, username: "djmanu", djName: "DJ Manu", avatarUrl: "https://..." }, url: "https://www.onlydjss.com/dj/djmanu/track/1", createdAt: "2025-01-15T12:00:00Z" },
    },
  },
  {
    method: "GET",
    path: "/tracks/dj/:username",
    description: "Tracks publicados por un DJ específico, identificado por su username.",
    params: [
      { name: "username",  type: "string", required: true,  description: "Username del DJ en ONLYDJS" },
      { name: "page",      type: "number", required: false, description: "Número de página" },
      { name: "limit",     type: "number", required: false, description: "Resultados por página" },
      { name: "trackType", type: "string", required: false, description: "Filtrar por tipo de track" },
    ],
    example: `${BASE_URL}/tracks/dj/djmanu?trackType=Edit`,
    sampleResponse: {
      data: [{ id: 1, title: "Summer Groove", artist: "DJ Manu", genre: "Tech House", bpm: 128, url: "https://www.onlydjss.com/dj/djmanu/track/1" }],
      pagination: { page: 1, limit: 20, total: 45, totalPages: 3 },
    },
  },
  {
    method: "GET",
    path: "/djs",
    description: "Lista paginada de DJs registrados en la plataforma.",
    params: [
      { name: "page",  type: "number", required: false, description: "Número de página" },
      { name: "limit", type: "number", required: false, description: "Resultados por página" },
      { name: "sort",  type: "string", required: false, description: "Ordenar por: popular | newest" },
    ],
    example: `${BASE_URL}/djs?sort=popular&limit=5`,
    sampleResponse: {
      data: [{ id: 5, username: "djmanu", djName: "DJ Manu", bio: "Tech House DJ from Buenos Aires", country: "AR", avatarUrl: "https://...", isVerified: true, membershipStatus: "member", stats: { followers: 1200, following: 300, tracks: 45 }, url: "https://www.onlydjss.com/djmanu" }],
      pagination: { page: 1, limit: 5, total: 2800, totalPages: 560 },
    },
  },
  {
    method: "GET",
    path: "/djs/:username",
    description: "Perfil completo de un DJ por su username.",
    params: [
      { name: "username", type: "string", required: true, description: "Username del DJ" },
    ],
    example: `${BASE_URL}/djs/djmanu`,
    sampleResponse: {
      data: { id: 5, username: "djmanu", djName: "DJ Manu", bio: "Tech House DJ", country: "AR", isVerified: true, membershipStatus: "member", stats: { followers: 1200, following: 300, tracks: 45 }, url: "https://www.onlydjss.com/djmanu" },
    },
  },
  {
    method: "GET",
    path: "/search",
    description: "Búsqueda full-text en tracks y DJs simultáneamente.",
    params: [
      { name: "q",     type: "string", required: true,  description: "Término de búsqueda (mínimo 2 caracteres)" },
      { name: "limit", type: "number", required: false, description: "Máximo de resultados por categoría" },
    ],
    example: `${BASE_URL}/search?q=tech+house`,
    sampleResponse: {
      query: "tech house",
      data: {
        tracks: [{ id: 1, title: "Tech Vibes", genre: "Tech House" }],
        djs:    [{ id: 5, username: "djmanu", djName: "DJ Manu" }],
      },
    },
  },
  {
    method: "GET",
    path: "/genres",
    description: "Lista de géneros y tipos de track disponibles en la plataforma.",
    params: [],
    example: `${BASE_URL}/genres`,
    sampleResponse: {
      genres: ["Tech House", "Bass House", "Afro House", "Techno", "Melodic Techno", "Big Room", "EDM", "Hard Techno", "Latin", "Reggaeton", "Hip-Hop", "Open Format"],
      trackTypes: ["Extended Mix", "Edit", "Mashup", "Remix", "Rework"],
    },
  },
];

const WIDGET_CODE = `<!-- ONLYDJS Embed Widget -->
<div id="onlydjs-widget"></div>
<script>
  (function() {
    var config = {
      genre: "Tech House",   // optional: filter by genre
      sort: "popular",       // newest | popular | trending
      limit: 6,              // number of tracks to show
      theme: "dark",         // dark | light
      showPreview: true,     // show play button for preview
    };

    var BASE = "https://www.onlydjss.com";
    var API  = BASE + "/api/v1";

    function buildWidget(tracks) {
      var container = document.getElementById("onlydjs-widget");
      if (!container) return;

      var style = [
        "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;",
        "background: " + (config.theme === "dark" ? "#0f0f0f" : "#ffffff") + ";",
        "border-radius: 12px; padding: 16px; max-width: 900px;",
      ].join(" ");

      var html = '<div style="' + style + '">';
      html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">';
      html += '<img src="' + BASE + '/logo-new-gradient.webp" style="height:24px;" alt="ONLYDJS">';
      html += '<span style="font-size:12px;color:#888;">Powered by <a href="' + BASE + '" target="_blank" style="color:#a855f7;text-decoration:none;">ONLYDJS</a></span>';
      html += '</div>';
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">';

      tracks.forEach(function(t) {
        var cover = t.coverImageUrl || (BASE + "/logo-new-gradient.webp");
        var color = config.theme === "dark" ? "#ffffff" : "#111111";
        var sub   = config.theme === "dark" ? "#888888" : "#555555";
        var bg    = config.theme === "dark" ? "#1a1a1a" : "#f5f5f5";

        html += '<a href="' + t.url + '" target="_blank" style="display:flex;gap:10px;align-items:center;';
        html += 'background:' + bg + ';border-radius:8px;padding:10px;text-decoration:none;transition:opacity .2s;" ';
        html += 'onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">';
        html += '<img src="' + cover + '" style="width:52px;height:52px;border-radius:6px;object-fit:cover;flex-shrink:0;" alt="">';
        html += '<div style="overflow:hidden;">';
        html += '<div style="font-size:13px;font-weight:600;color:' + color + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + t.title + '</div>';
        html += '<div style="font-size:11px;color:' + sub + ';margin-top:2px;">' + (t.dj.djName || t.artist) + '</div>';
        html += '<div style="font-size:10px;color:#a855f7;margin-top:3px;">' + t.genre + (t.bpm ? " · " + t.bpm + " BPM" : "") + '</div>';
        html += '</div></a>';
      });

      html += '</div></div>';
      container.innerHTML = html;
    }

    var url = API + "/tracks?sort=" + config.sort + "&limit=" + config.limit;
    if (config.genre) url += "&genre=" + encodeURIComponent(config.genre);

    fetch(url)
      .then(function(r) { return r.json(); })
      .then(function(res) { buildWidget(res.data || []); })
      .catch(function(e) { console.error("ONLYDJS widget error:", e); });
  })();
</script>`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={copy}>
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} />
      </div>
      <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-xs text-zinc-300 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ApiDocs() {
  const [activeEndpoint, setActiveEndpoint] = useState<number>(0);
  const ep = ENDPOINTS[activeEndpoint];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">v1.0</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">ONLYDJS Public API</h1>
          <p className="text-muted-foreground max-w-2xl">
            API REST pública para integrar el catálogo de tracks y perfiles de DJs de ONLYDJS en cualquier sitio web.
            Sin autenticación requerida. CORS abierto para todos los orígenes.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4 text-green-400" />
              <span>Base URL:</span>
              <code className="bg-zinc-900 px-2 py-0.5 rounded text-xs text-primary font-mono">{BASE_URL}</code>
              <CopyButton text={BASE_URL} />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Sin API key · CORS abierto · Rate limit: 120 req/min</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="reference">
          <TabsList className="mb-8">
            <TabsTrigger value="reference"><BookOpen className="w-4 h-4 mr-1.5" />Referencia</TabsTrigger>
            <TabsTrigger value="widget"><Code2 className="w-4 h-4 mr-1.5" />Widget Embebible</TabsTrigger>
            <TabsTrigger value="examples"><Terminal className="w-4 h-4 mr-1.5" />Ejemplos</TabsTrigger>
          </TabsList>

          {/* ── REFERENCE ── */}
          <TabsContent value="reference">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Endpoints</p>
                {ENDPOINTS.map((e, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveEndpoint(i)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      activeEndpoint === i ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <Badge className="text-[10px] px-1.5 py-0 bg-green-500/20 text-green-400 border-green-500/30 font-mono">GET</Badge>
                    <code className="text-xs">{e.path}</code>
                  </button>
                ))}
              </div>

              {/* Detail */}
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-mono">GET</Badge>
                    <code className="text-sm font-mono text-primary">{BASE_URL}{ep.path}</code>
                  </div>
                  <p className="text-sm text-muted-foreground">{ep.description}</p>
                </div>

                {ep.params && ep.params.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Parámetros</p>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium">Nombre</th>
                            <th className="text-left px-3 py-2 font-medium">Tipo</th>
                            <th className="text-left px-3 py-2 font-medium">Requerido</th>
                            <th className="text-left px-3 py-2 font-medium">Descripción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.params.map((p, i) => (
                            <tr key={i} className="border-t border-border">
                              <td className="px-3 py-2 font-mono text-primary">{p.name}</td>
                              <td className="px-3 py-2 text-muted-foreground">{p.type}</td>
                              <td className="px-3 py-2">
                                {p.required
                                  ? <Badge className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">requerido</Badge>
                                  : <Badge className="text-[10px] bg-zinc-500/10 text-zinc-400 border-zinc-500/20">opcional</Badge>
                                }
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ejemplo de solicitud</p>
                  <CodeBlock code={ep.example} lang="bash" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Respuesta de ejemplo</p>
                  <CodeBlock code={JSON.stringify(ep.sampleResponse, null, 2)} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── WIDGET ── */}
          <TabsContent value="widget">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold mb-2">Widget Embebible</h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Copia y pega este código en cualquier sitio web para mostrar un grid de tracks de ONLYDJS.
                  Personaliza el género, cantidad y tema visual directamente en el objeto <code className="text-primary">config</code>.
                </p>
                <Card className="mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Opciones de configuración</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="text-left pb-2">Opción</th>
                          <th className="text-left pb-2">Valores</th>
                          <th className="text-left pb-2">Default</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-1">
                        {[
                          ["genre",       "Tech House, Techno, etc.", "—"],
                          ["sort",        "newest | popular | trending", "popular"],
                          ["limit",       "1 – 100", "6"],
                          ["theme",       "dark | light", "dark"],
                          ["showPreview", "true | false", "true"],
                        ].map(([opt, vals, def]) => (
                          <tr key={opt} className="border-t border-border/50">
                            <td className="py-1.5 font-mono text-primary">{opt}</td>
                            <td className="py-1.5 text-muted-foreground">{vals}</td>
                            <td className="py-1.5 text-muted-foreground">{def}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Código del widget</p>
                  <CopyButton text={WIDGET_CODE} />
                </div>
                <CodeBlock code={WIDGET_CODE} lang="html" />
              </div>
            </div>
          </TabsContent>

          {/* ── EXAMPLES ── */}
          <TabsContent value="examples">
            <div className="space-y-8 max-w-3xl">
              <div>
                <h2 className="text-lg font-semibold mb-1">Ejemplos de integración</h2>
                <p className="text-sm text-muted-foreground mb-6">Fragmentos listos para usar en los lenguajes más comunes.</p>
              </div>

              {[
                {
                  title: "JavaScript (fetch)",
                  code: `// Obtener los 10 tracks más populares de Tech House
fetch("${BASE_URL}/tracks?genre=Tech+House&sort=popular&limit=10")
  .then(res => res.json())
  .then(({ data, pagination }) => {
    console.log(\`\${pagination.total} tracks disponibles\`);
    data.forEach(track => {
      console.log(\`\${track.title} — \${track.dj.djName} [\${track.bpm} BPM]\`);
    });
  });`,
                },
                {
                  title: "Python (requests)",
                  code: `import requests

resp = requests.get(
    "https://www.onlydjss.com/api/v1/tracks",
    params={"genre": "Techno", "sort": "trending", "limit": 20}
)
data = resp.json()

for track in data["data"]:
    print(f"{track['title']} by {track['dj']['djName']} — {track['bpm']} BPM")`,
                },
                {
                  title: "PHP (cURL)",
                  code: `<?php
$url = "https://www.onlydjss.com/api/v1/search?q=tech+house";
$ch  = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$body = curl_exec($ch);
curl_close($ch);

$data = json_decode($body, true);
foreach ($data["data"]["tracks"] as $track) {
    echo $track["title"] . " — " . $track["dj"]["djName"] . "\\n";
}`,
                },
                {
                  title: "React (hook personalizado)",
                  code: `import { useState, useEffect } from "react";

function useOnlyDJSTracks({ genre, sort = "popular", limit = 10 } = {}) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ sort, limit });
    if (genre) params.set("genre", genre);

    fetch(\`https://www.onlydjss.com/api/v1/tracks?\${params}\`)
      .then(r => r.json())
      .then(res => setTracks(res.data || []))
      .finally(() => setLoading(false));
  }, [genre, sort, limit]);

  return { tracks, loading };
}

// Uso:
// const { tracks, loading } = useOnlyDJSTracks({ genre: "Tech House" });`,
                },
              ].map(({ title, code }) => (
                <div key={title}>
                  <p className="text-sm font-semibold mb-2">{title}</p>
                  <CodeBlock code={code} lang="js" />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

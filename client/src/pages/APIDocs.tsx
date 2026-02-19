import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Code, Key, Zap, Shield, Book, Terminal } from "lucide-react";
import { useState } from "react";

export default function APIDocs() {
  const [selectedLanguage, setSelectedLanguage] = useState("curl");

  const endpoints = [
    {
      method: "GET",
      path: "/api/tracks",
      description: "Get a list of tracks with optional filtering",
      params: [
        { name: "genre", type: "string", required: false, description: "Filter by genre" },
        { name: "bpm", type: "number", required: false, description: "Filter by BPM" },
        { name: "limit", type: "number", required: false, description: "Number of results (default: 20)" },
        { name: "offset", type: "number", required: false, description: "Pagination offset" }
      ],
      response: `{
  "tracks": [
    {
      "id": "123",
      "title": "Summer Vibes",
      "artist": "DJ Leo Zam",
      "genre": "Tech House",
      "bpm": 128,
      "key": "Am",
      "coverUrl": "https://...",
      "audioUrl": "https://...",
      "downloads": 1234,
      "createdAt": "2026-02-15T10:00:00Z"
    }
  ],
  "total": 500,
  "limit": 20,
  "offset": 0
}`
    },
    {
      method: "GET",
      path: "/api/tracks/:id",
      description: "Get detailed information about a specific track",
      params: [
        { name: "id", type: "string", required: true, description: "Track ID" }
      ],
      response: `{
  "id": "123",
  "title": "Summer Vibes",
  "artist": "DJ Leo Zam",
  "artistId": "user_456",
  "genre": "Tech House",
  "subgenre": "Melodic",
  "bpm": 128,
  "key": "Am",
  "duration": 360,
  "coverUrl": "https://...",
  "audioUrl": "https://...",
  "waveformUrl": "https://...",
  "downloads": 1234,
  "plays": 5678,
  "likes": 890,
  "price": 4.99,
  "tags": ["summer", "melodic", "festival"],
  "createdAt": "2026-02-15T10:00:00Z"
}`
    },
    {
      method: "POST",
      path: "/api/tracks/upload",
      description: "Upload a new track (requires authentication)",
      params: [
        { name: "file", type: "file", required: true, description: "Audio file (WAV or MP3)" },
        { name: "title", type: "string", required: true, description: "Track title" },
        { name: "genre", type: "string", required: true, description: "Genre" },
        { name: "cover", type: "file", required: false, description: "Cover image" }
      ],
      response: `{
  "success": true,
  "trackId": "123",
  "message": "Track uploaded successfully",
  "analysisStatus": "processing"
}`
    },
    {
      method: "GET",
      path: "/api/users/:username",
      description: "Get public profile information for a DJ",
      params: [
        { name: "username", type: "string", required: true, description: "DJ username" }
      ],
      response: `{
  "id": "user_456",
  "username": "djleozam",
  "displayName": "DJ Leo Zam",
  "bio": "Tech House producer from Miami",
  "avatarUrl": "https://...",
  "coverUrl": "https://...",
  "stats": {
    "tracks": 45,
    "downloads": 12345,
    "followers": 678,
    "totalEarnings": 5432.10
  },
  "socials": {
    "instagram": "djleozam",
    "soundcloud": "djleozam"
  },
  "joinedAt": "2025-01-15T10:00:00Z"
}`
    }
  ];

  const codeExamples: Record<string, string> = {
    curl: `curl -X GET "https://api.onlydjs.com/api/tracks?genre=Tech%20House&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    javascript: `const response = await fetch('https://api.onlydjs.com/api/tracks?genre=Tech%20House&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data);`,
    python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.onlydjs.com/api/tracks',
    params={'genre': 'Tech House', 'limit': 10},
    headers=headers
)

data = response.json()
print(data)`
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Code className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                API Documentation
              </span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Build powerful integrations with the ONLYDJS API. Access tracks, user data, and more programmatically.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 bg-slate-900/50">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Quick Start</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Key className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">1. Get API Key</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Sign up for a free account and generate your API key from the dashboard.
                </p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Terminal className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">2. Make Request</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Use your API key to authenticate and start making requests to our endpoints.
                </p>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">3. Build Amazing</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Integrate ONLYDJS data into your apps, tools, and workflows.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <Card className="p-8 bg-slate-900/50 border-slate-800 mb-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-4">Authentication</h2>
                  <div className="text-slate-300 space-y-4 leading-relaxed">
                    <p>
                      All API requests require authentication using an API key. Include your API key in the <code className="px-2 py-1 bg-slate-800 rounded text-cyan-400">Authorization</code> header:
                    </p>
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                      <code className="text-sm text-cyan-400">
                        Authorization: Bearer YOUR_API_KEY
                      </code>
                    </div>
                    <p className="text-sm text-slate-400">
                      Keep your API key secure and never expose it in client-side code. Use environment variables or secure key management systems.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Base URL */}
            <Card className="p-8 bg-slate-900/50 border-slate-800 mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Base URL</h2>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <code className="text-sm text-cyan-400">
                  https://api.onlydjs.com
                </code>
              </div>
              <p className="text-sm text-slate-400 mt-4">
                All endpoints are relative to this base URL. For example: <code className="px-2 py-1 bg-slate-800 rounded text-cyan-400">https://api.onlydjs.com/api/tracks</code>
              </p>
            </Card>

            {/* Rate Limits */}
            <Card className="p-8 bg-slate-900/50 border-slate-800 mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Rate Limits</h2>
              <div className="text-slate-300 space-y-4 leading-relaxed">
                <p>
                  To ensure fair usage and platform stability, we enforce the following rate limits:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span><strong className="text-white">Free Tier:</strong> 100 requests per hour</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span><strong className="text-white">Pro Tier:</strong> 1,000 requests per hour</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span><strong className="text-white">Enterprise:</strong> Custom limits (contact us)</span>
                  </li>
                </ul>
                <p className="text-sm text-slate-400">
                  Rate limit information is included in response headers: <code className="px-2 py-1 bg-slate-800 rounded text-cyan-400">X-RateLimit-Limit</code>, <code className="px-2 py-1 bg-slate-800 rounded text-cyan-400">X-RateLimit-Remaining</code>, <code className="px-2 py-1 bg-slate-800 rounded text-cyan-400">X-RateLimit-Reset</code>
                </p>
              </div>
            </Card>

            {/* Code Example */}
            <Card className="p-8 bg-slate-900/50 border-slate-800 mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Example Request</h2>
              <div className="flex gap-2 mb-4">
                {Object.keys(codeExamples).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedLanguage === lang
                        ? "bg-cyan-500 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {lang === "curl" ? "cURL" : lang === "javascript" ? "JavaScript" : "Python"}
                  </button>
                ))}
              </div>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                <pre className="text-sm text-slate-300">
                  <code>{codeExamples[selectedLanguage]}</code>
                </pre>
              </div>
            </Card>

            {/* Endpoints */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-white mb-8">Endpoints</h2>
              {endpoints.map((endpoint, idx) => (
                <Card key={idx} className="p-8 bg-slate-900/50 border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-lg font-bold text-sm ${
                      endpoint.method === "GET" ? "bg-cyan-500/20 text-cyan-400" :
                      endpoint.method === "POST" ? "bg-green-500/20 text-green-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-lg font-mono text-white">{endpoint.path}</code>
                  </div>
                  <p className="text-slate-300 mb-6">{endpoint.description}</p>

                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white mb-3">Parameters</h4>
                    <div className="space-y-2">
                      {endpoint.params.map((param, i) => (
                        <div key={i} className="flex items-start gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-cyan-400 font-mono">{param.name}</code>
                              <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                                {param.type}
                              </span>
                              {param.required && (
                                <span className="text-xs px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded">
                                  required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-400">{param.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">Response</h4>
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-x-auto">
                      <pre className="text-sm text-slate-300">
                        <code>{endpoint.response}</code>
                      </pre>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Support */}
            <Card className="p-8 bg-slate-900/50 border-slate-800 mt-12">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Book className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
                  <p className="text-slate-300 mb-4">
                    If you have questions about the API or need assistance with integration, we're here to help.
                  </p>
                  <div className="flex gap-4">
                    <a
                      href="/contact"
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg"
                    >
                      Contact Support
                    </a>
                    <a
                      href="https://discord.gg/onlydjs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-700"
                    >
                      Join Discord
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

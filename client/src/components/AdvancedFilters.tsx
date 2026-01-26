import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search, SlidersHorizontal } from "lucide-react";

interface AdvancedFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  filterOptions?: {
    genres: string[];
    trackTypes: ("Extended Mix" | "Edit" | "Mashup" | "Remix" | "Rework")[];
    moods: string[];
    musicalKeys: string[];
  };
}

export interface SearchFilters {
  query?: string;
  bpmMin?: number;
  bpmMax?: number;
  musicalKey?: string[];
  genres?: string[];
  trackTypes?: ("Extended Mix" | "Edit" | "Mashup" | "Remix" | "Rework")[];
  energyMin?: number;
  energyMax?: number;
  moods?: string[];
  sortBy?: "recent" | "popular" | "bpm" | "downloads";
}

export default function AdvancedFilters({ onSearch, filterOptions }: AdvancedFiltersProps) {
  const [query, setQuery] = useState("");
  const [bpmRange, setBpmRange] = useState<[number, number]>([60, 200]);
  const [energyRange, setEnergyRange] = useState<[number, number]>([0, 100]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "bpm" | "downloads">("recent");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    const filters: SearchFilters = {
      query: query.trim() || undefined,
      bpmMin: bpmRange[0] !== 60 ? bpmRange[0] : undefined,
      bpmMax: bpmRange[1] !== 200 ? bpmRange[1] : undefined,
      energyMin: energyRange[0] !== 0 ? energyRange[0] : undefined,
      energyMax: energyRange[1] !== 100 ? energyRange[1] : undefined,
      musicalKey: selectedKeys.length > 0 ? selectedKeys : undefined,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      trackTypes: selectedTypes.length > 0 ? selectedTypes as any : undefined,
      moods: selectedMoods.length > 0 ? selectedMoods : undefined,
      sortBy,
    };

    onSearch(filters);
  };

  const handleReset = () => {
    setQuery("");
    setBpmRange([60, 200]);
    setEnergyRange([0, 100]);
    setSelectedGenres([]);
    setSelectedKeys([]);
    setSelectedTypes([]);
    setSelectedMoods([]);
    setSortBy("recent");
    
    onSearch({});
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const toggleKey = (key: string) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  const hasActiveFilters = 
    query.trim() ||
    bpmRange[0] !== 60 ||
    bpmRange[1] !== 200 ||
    energyRange[0] !== 0 ||
    energyRange[1] !== 100 ||
    selectedGenres.length > 0 ||
    selectedKeys.length > 0 ||
    selectedTypes.length > 0 ||
    selectedMoods.length > 0;

  return (
    <Card className="card-neon p-6 bg-card mb-6">
      {/* Search Bar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o artista..."
            className="pl-10 bg-background"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </Button>
        <Button
          onClick={handleSearch}
          className="btn-neon bg-primary hover:bg-primary/90 glow-cyan"
        >
          Buscar
        </Button>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {query && (
            <Badge variant="secondary" className="gap-1">
              "{query}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => setQuery("")} />
            </Badge>
          )}
          {(bpmRange[0] !== 60 || bpmRange[1] !== 200) && (
            <Badge variant="secondary" className="gap-1">
              BPM: {bpmRange[0]}-{bpmRange[1]}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setBpmRange([60, 200])} />
            </Badge>
          )}
          {selectedGenres.map(genre => (
            <Badge key={genre} variant="secondary" className="gap-1">
              {genre}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleGenre(genre)} />
            </Badge>
          ))}
          {selectedKeys.map(key => (
            <Badge key={key} variant="secondary" className="gap-1">
              Key: {key}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleKey(key)} />
            </Badge>
          ))}
          {selectedTypes.map(type => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleType(type)} />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-6 text-xs"
          >
            Limpiar todo
          </Button>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-6 pt-4 border-t border-border">
          {/* Sort By */}
          <div>
            <Label className="mb-2 block">Ordenar por</Label>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Más recientes</SelectItem>
                <SelectItem value="popular">Más populares</SelectItem>
                <SelectItem value="downloads">Más descargados</SelectItem>
                <SelectItem value="bpm">Por BPM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* BPM Range */}
          <div>
            <Label className="mb-2 block">
              BPM: {bpmRange[0]} - {bpmRange[1]}
            </Label>
            <Slider
              min={60}
              max={200}
              step={1}
              value={bpmRange}
              onValueChange={(v) => setBpmRange(v as [number, number])}
              className="py-4"
            />
          </div>

          {/* Energy Range */}
          <div>
            <Label className="mb-2 block">
              Energía: {energyRange[0]} - {energyRange[1]}
            </Label>
            <Slider
              min={0}
              max={100}
              step={1}
              value={energyRange}
              onValueChange={(v) => setEnergyRange(v as [number, number])}
              className="py-4"
            />
          </div>

          {/* Genres */}
          {filterOptions?.genres && filterOptions.genres.length > 0 && (
            <div>
              <Label className="mb-2 block">Géneros</Label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.genres.map(genre => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Musical Keys */}
          {filterOptions?.musicalKeys && filterOptions.musicalKeys.length > 0 && (
            <div>
              <Label className="mb-2 block">Clave Musical</Label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.musicalKeys.slice(0, 24).map(key => (
                  <Badge
                    key={key}
                    variant={selectedKeys.includes(key) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleKey(key)}
                  >
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Track Types */}
          {filterOptions?.trackTypes && filterOptions.trackTypes.length > 0 && (
            <div>
              <Label className="mb-2 block">Tipo de Track</Label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.trackTypes.map(type => (
                  <Badge
                    key={type}
                    variant={selectedTypes.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Moods */}
          {filterOptions?.moods && filterOptions.moods.length > 0 && (
            <div>
              <Label className="mb-2 block">Mood</Label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.moods.map(mood => (
                  <Badge
                    key={mood}
                    variant={selectedMoods.includes(mood) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleMood(mood)}
                  >
                    {mood}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

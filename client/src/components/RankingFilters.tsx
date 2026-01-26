import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface RankingFiltersProps {
  country?: string;
  month?: string;
  onCountryChange: (country: string | undefined) => void;
  onMonthChange: (month: string | undefined) => void;
  onClearFilters: () => void;
}

const COUNTRIES = [
  { code: "US", name: "Estados Unidos" },
  { code: "MX", name: "México" },
  { code: "BR", name: "Brasil" },
  { code: "AR", name: "Argentina" },
  { code: "CO", name: "Colombia" },
  { code: "ES", name: "España" },
  { code: "GB", name: "Reino Unido" },
  { code: "DE", name: "Alemania" },
  { code: "FR", name: "Francia" },
  { code: "IT", name: "Italia" },
  { code: "NL", name: "Países Bajos" },
  { code: "BE", name: "Bélgica" },
];

// Generate last 12 months
const generateMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toISOString().slice(0, 7); // YYYY-MM
    const monthName = date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    months.push({ value: monthStr, label: monthName.charAt(0).toUpperCase() + monthName.slice(1) });
  }
  return months;
};

export const RankingFilters = ({ country, month, onCountryChange, onMonthChange, onClearFilters }: RankingFiltersProps) => {
  const months = generateMonths();
  const hasFilters = country || month;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex-1 min-w-[200px]">
        <Select value={country || "all"} onValueChange={(value) => onCountryChange(value === "all" ? undefined : value)}>
          <SelectTrigger className="bg-slate-800/50 border-slate-700">
            <SelectValue placeholder="🌍 Todos los países" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">🌍 Todos los países</SelectItem>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <Select value={month || "all"} onValueChange={(value) => onMonthChange(value === "all" ? undefined : value)}>
          <SelectTrigger className="bg-slate-800/50 border-slate-700">
            <SelectValue placeholder="📅 Últimos 7 días" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">📅 Últimos 7 días</SelectItem>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="border-slate-700 hover:bg-slate-800"
        >
          <X className="w-4 h-4 mr-1" />
          Limpiar filtros
        </Button>
      )}

      {hasFilters && (
        <div className="text-sm text-slate-400">
          Filtros activos: {country && `País: ${COUNTRIES.find(c => c.code === country)?.name}`} {country && month && "·"} {month && `Mes: ${months.find(m => m.value === month)?.label}`}
        </div>
      )}
    </div>
  );
};

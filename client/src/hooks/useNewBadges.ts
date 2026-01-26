import { useEffect, useState, useRef } from "react";

interface Badge {
  id?: number;
  badgeType: string;
  unlocked: boolean;
  unlockedAt: Date | null;
}

/**
 * Hook para detectar badges nuevos desbloqueados
 * Compara badges actuales con badges previos almacenados en localStorage
 */
export function useNewBadges(badges: Badge[] | undefined) {
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const previousBadgesRef = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!badges) return;

    // En el primer mount, cargar badges vistos desde localStorage
    if (isInitialMount.current) {
      const storedBadges = localStorage.getItem("seenBadges");
      if (storedBadges) {
        try {
          const parsed = JSON.parse(storedBadges) as string[];
          previousBadgesRef.current = new Set(parsed);
        } catch (err) {
          console.error("Error parsing seenBadges:", err);
        }
      }
      
      // Agregar badges actuales desbloqueados a la lista de vistos
      const currentUnlocked = badges
        .filter(b => b.unlocked)
        .map(b => b.badgeType);
      
      currentUnlocked.forEach(type => previousBadgesRef.current.add(type));
      localStorage.setItem("seenBadges", JSON.stringify(Array.from(previousBadgesRef.current)));
      
      isInitialMount.current = false;
      return;
    }

    // Detectar badges nuevos
    const currentUnlockedBadges = badges.filter(b => b.unlocked);
    
    for (const badge of currentUnlockedBadges) {
      if (!previousBadgesRef.current.has(badge.badgeType)) {
        // Badge nuevo detectado
        setNewBadge(badge);
        previousBadgesRef.current.add(badge.badgeType);
        
        // Actualizar localStorage
        localStorage.setItem("seenBadges", JSON.stringify(Array.from(previousBadgesRef.current)));
        
        // Solo mostrar un badge a la vez
        break;
      }
    }
  }, [badges]);

  const clearNewBadge = () => {
    setNewBadge(null);
  };

  return { newBadge, clearNewBadge };
}

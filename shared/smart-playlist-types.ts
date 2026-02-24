// Tipos compartidos para Smart Playlists

export type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';

export type FilterField = 'genre' | 'bpm' | 'key' | 'uploadDate' | 'plays' | 'downloads';

export interface SmartPlaylistRule {
  field: FilterField;
  operator: FilterOperator;
  value: string | number | string[] | number[];
}

export interface SmartPlaylistRules {
  rules: SmartPlaylistRule[];
  matchAll: boolean; // true = AND, false = OR
  limit?: number; // Máximo de tracks
  sortBy?: 'uploadDate' | 'plays' | 'downloads' | 'bpm';
  sortOrder?: 'asc' | 'desc';
}

// Templates predefinidos
export const SMART_PLAYLIST_TEMPLATES = {
  TOP_TECH_HOUSE: {
    name: 'Top 50 Tech House',
    description: 'Los tracks de Tech House más populares',
    rules: {
      rules: [
        { field: 'genre' as FilterField, operator: 'equals' as FilterOperator, value: 'Tech House' }
      ],
      matchAll: true,
      limit: 50,
      sortBy: 'plays' as const,
      sortOrder: 'desc' as const
    }
  },
  BPM_128_132: {
    name: 'BPM 128-132',
    description: 'Tracks perfectos para mezclar en 128-132 BPM',
    rules: {
      rules: [
        { field: 'bpm' as FilterField, operator: 'between' as FilterOperator, value: [128, 132] }
      ],
      matchAll: true,
      limit: 100,
      sortBy: 'uploadDate' as const,
      sortOrder: 'desc' as const
    }
  },
  NEW_RELEASES: {
    name: 'New Releases (Last 7 Days)',
    description: 'Tracks subidos en los últimos 7 días',
    rules: {
      rules: [
        { field: 'uploadDate' as FilterField, operator: 'greaterThan' as FilterOperator, value: 7 }
      ],
      matchAll: true,
      limit: 50,
      sortBy: 'uploadDate' as const,
      sortOrder: 'desc' as const
    }
  },
  DEEP_HOUSE_CHILL: {
    name: 'Deep House Chill',
    description: 'Deep House relajado (120-125 BPM)',
    rules: {
      rules: [
        { field: 'genre' as FilterField, operator: 'equals' as FilterOperator, value: 'Deep House' },
        { field: 'bpm' as FilterField, operator: 'between' as FilterOperator, value: [120, 125] }
      ],
      matchAll: true,
      limit: 50,
      sortBy: 'plays' as const,
      sortOrder: 'desc' as const
    }
  },
  PEAK_TIME_TECHNO: {
    name: 'Peak Time Techno',
    description: 'Techno energético (130-140 BPM)',
    rules: {
      rules: [
        { field: 'genre' as FilterField, operator: 'equals' as FilterOperator, value: 'Techno' },
        { field: 'bpm' as FilterField, operator: 'between' as FilterOperator, value: [130, 140] }
      ],
      matchAll: true,
      limit: 50,
      sortBy: 'plays' as const,
      sortOrder: 'desc' as const
    }
  }
};

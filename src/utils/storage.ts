import { DrawRecord, IndicatorWeights, Market, PositionConfig } from '../types/lottery';
import { INITIAL_MARKETS, getInitialDraws } from '../data/initialData';

const STORAGE_PREFIX = 'smart_lottery_v1_';

export const DEFAULT_POSITION_CONFIG: PositionConfig = {
  as: 0,
  kop: 1,
  kepala: 2,
  ekor: 3,
};

export const DEFAULT_INDICATOR_WEIGHTS: IndicatorWeights = {
  frequency: 25,
  recency: 25,
  overdue: 15,
  positional: 20,
  pairs: 10,
  pattern: 5,
  halfLife: 14,
};

// Markets
export function loadMarkets(): Market[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}markets`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load markets from storage:', e);
  }
  saveMarkets(INITIAL_MARKETS);
  return INITIAL_MARKETS;
}

export function saveMarkets(markets: Market[]): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}markets`, JSON.stringify(markets));
  } catch (e) {
    console.error('Failed to save markets:', e);
  }
}

// Draws per market
export function loadDraws(marketId: string): DrawRecord[] {
  try {
    const key = `${STORAGE_PREFIX}draws_${marketId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(`Failed to load draws for market ${marketId}:`, e);
  }

  // Fallback to initial datasets if empty
  const initial = getInitialDraws(marketId);
  saveDraws(marketId, initial);
  return initial;
}

export function saveDraws(marketId: string, draws: DrawRecord[]): void {
  try {
    const key = `${STORAGE_PREFIX}draws_${marketId}`;
    localStorage.setItem(key, JSON.stringify(draws));
  } catch (e) {
    console.error(`Failed to save draws for market ${marketId}:`, e);
  }
}

// Position configuration per market
export function loadPositionConfig(marketId: string): PositionConfig {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}pos_${marketId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load pos config:', e);
  }
  return DEFAULT_POSITION_CONFIG;
}

export function savePositionConfig(marketId: string, config: PositionConfig): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}pos_${marketId}`, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save pos config:', e);
  }
}

// Indicator weights
export function loadIndicatorWeights(): IndicatorWeights {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}weights`);
    if (raw) {
      return { ...DEFAULT_INDICATOR_WEIGHTS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load weights:', e);
  }
  return DEFAULT_INDICATOR_WEIGHTS;
}

export function saveIndicatorWeights(weights: IndicatorWeights): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}weights`, JSON.stringify(weights));
  } catch (e) {
    console.error('Failed to save weights:', e);
  }
}

// Export complete database to JSON file
export function exportDatabaseBackup(): string {
  const markets = loadMarkets();
  const database: Record<string, any> = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    markets,
    draws: {},
    positionConfigs: {},
    weights: loadIndicatorWeights(),
  };

  for (const m of markets) {
    database.draws[m.id] = loadDraws(m.id);
    database.positionConfigs[m.id] = loadPositionConfig(m.id);
  }

  return JSON.stringify(database, null, 2);
}

// Restore database from JSON
export function importDatabaseBackup(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.markets || !data.draws) {
      return { success: false, message: 'Format file cadangan tidak valid (kurang field markets atau draws)' };
    }

    if (Array.isArray(data.markets)) {
      saveMarkets(data.markets);
    }

    if (data.draws && typeof data.draws === 'object') {
      for (const [marketId, drawsList] of Object.entries(data.draws)) {
        if (Array.isArray(drawsList)) {
          saveDraws(marketId, drawsList as DrawRecord[]);
        }
      }
    }

    if (data.positionConfigs && typeof data.positionConfigs === 'object') {
      for (const [marketId, pos] of Object.entries(data.positionConfigs)) {
        savePositionConfig(marketId, pos as PositionConfig);
      }
    }

    if (data.weights) {
      saveIndicatorWeights(data.weights);
    }

    return { success: true, message: 'Database berhasil dipulihkan dari cadangan.' };
  } catch (err: any) {
    return { success: false, message: `Gagal membaca file JSON: ${err?.message || 'Error parsing'}` };
  }
}

// Reset all markets to initial seed data
export function resetDatabaseToInitial(): void {
  localStorage.clear();
  saveMarkets(INITIAL_MARKETS);
  for (const m of INITIAL_MARKETS) {
    saveDraws(m.id, getInitialDraws(m.id));
    savePositionConfig(m.id, DEFAULT_POSITION_CONFIG);
  }
  saveIndicatorWeights(DEFAULT_INDICATOR_WEIGHTS);
}

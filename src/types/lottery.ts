export interface DrawRecord {
  id: string;
  marketId: string;
  date: string; // e.g. "05-11-2026" or "2026-11-05"
  day?: string; // e.g. "Kamis"
  period: string; // e.g. "2165"
  number: string; // e.g. "9887" (must be 4 digits 0000-9999)
  note?: string;
  createdAt: number;
}

export interface Market {
  id: string;
  name: string;
  code: string;
  schedule: string;
  color: string;
  description: string;
}

export type PositionKey = 'as' | 'kop' | 'kepala' | 'ekor';

export interface PositionConfig {
  as: number; // default index 0
  kop: number; // default index 1
  kepala: number; // default index 2
  ekor: number; // default index 3
}

export interface DigitStat {
  digit: number;
  count: number;
  frequency: number; // count / total
  percentage: number; // frequency * 100
  rank: number;
  zScore: number;
  isHot: boolean;
  isCold: boolean;
}

export interface OverdueStat {
  digit: number;
  currentGap: number; // draws since last appearance
  lastDrawDate?: string;
  lastPeriod?: string;
  avgGap: number;
  maxGap: number;
  appearanceCount: number;
}

export interface PositionalFrequency {
  position: PositionKey;
  label: string;
  digitCounts: Record<number, number>;
  mostFrequent: { digit: number; count: number; pct: number };
  leastFrequent: { digit: number; count: number; pct: number };
}

export interface PairStat {
  pair: string; // e.g. "18"
  count: number;
  frequency: number;
  lastSeenDrawsAgo: number;
}

export interface PatternDistribution {
  name: string;
  pattern: string;
  count: number;
  percentage: number;
}

export interface RecencyWeightStat {
  digit: number;
  rawCount: number;
  rawPercentage: number;
  weightedScore: number;
  weightedPercentage: number;
  rank: number;
}

export interface IndicatorWeights {
  frequency: number; // 0 - 100
  recency: number; // 0 - 100
  overdue: number; // 0 - 100
  positional: number; // 0 - 100
  pairs: number; // 0 - 100
  pattern: number; // 0 - 100
  halfLife: number; // default 14
}

export interface BacktestResult {
  totalEvaluated: number;
  trainSize: number;
  testedMethod: string;
  digitHitRate: number; // % of predicted top-4 digits that matched any digit in actual draw
  positionHitRate: number; // % of position predictions that matched exact positions
  exact2DHitRate: number; // % of 2D predictions hitting actual 2D (Kepala+Ekor)
  exact3DHitRate: number;
  exact4DHitRate: number;
  randomBaselineDigit: number; // statistical baseline
  randomBaseline2D: number;
  randomBaseline3D: number;
  randomBaseline4D: number;
  confidenceInterval: [number, number]; // 95% CI
  historyLog: Array<{
    period: string;
    actual: string;
    predicted2D: string;
    predictedTopDigits: number[];
    isDigitHit: boolean;
    is2DHit: boolean;
    isPositionHit: boolean;
  }>;
}

export interface MistikIndexMapping {
  original: number;
  mistikLama: number;
  mistikBaru: number;
  index: number;
}

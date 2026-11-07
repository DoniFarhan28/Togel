import {
  BacktestResult,
  DigitStat,
  DrawRecord,
  IndicatorWeights,
  MistikIndexMapping,
  OverdueStat,
  PairStat,
  PatternDistribution,
  PositionConfig,
  PositionalFrequency,
  PositionKey,
  RecencyWeightStat
} from '../types/lottery';

// Mistik & Index Mappings
export const MISTIK_LAMA_MAP: Record<number, number> = {
  0: 1, 1: 0,
  2: 5, 5: 2,
  3: 8, 8: 3,
  4: 7, 7: 4,
  6: 9, 9: 6
};

export const MISTIK_BARU_MAP: Record<number, number> = {
  0: 8, 8: 0,
  1: 7, 7: 1,
  2: 6, 6: 2,
  3: 9, 9: 3,
  4: 5, 5: 4
};

export const INDEX_MAP: Record<number, number> = {
  0: 5, 5: 0,
  1: 6, 6: 1,
  2: 7, 7: 2,
  3: 8, 8: 3,
  4: 9, 9: 4
};

export function getMistikIndexDetails(digit: number): MistikIndexMapping {
  return {
    original: digit,
    mistikLama: MISTIK_LAMA_MAP[digit] ?? 0,
    mistikBaru: MISTIK_BARU_MAP[digit] ?? 0,
    index: INDEX_MAP[digit] ?? 0
  };
}

// Helper to filter draws by period limit
export function filterDrawsByLimit(draws: DrawRecord[], limit?: number | 'all'): DrawRecord[] {
  if (!draws || draws.length === 0) return [];
  if (!limit || limit === 'all' || limit >= draws.length) {
    return [...draws];
  }
  return draws.slice(draws.length - limit);
}

// 1. Frequency calculation for digits 0-9
export function calculateFrequency(draws: DrawRecord[]): DigitStat[] {
  const counts: Record<number, number> = {};
  for (let d = 0; d <= 9; d++) counts[d] = 0;

  let totalDigitsObserved = 0;
  for (const draw of draws) {
    const clean = draw.number.padStart(4, '0').slice(-4);
    for (let i = 0; i < 4; i++) {
      const num = parseInt(clean[i], 10);
      if (!isNaN(num) && num >= 0 && num <= 9) {
        counts[num]++;
        totalDigitsObserved++;
      }
    }
  }

  const n = draws.length;
  const expectedCount = (totalDigitsObserved * 0.1) || 1;
  const standardDeviation = Math.sqrt(totalDigitsObserved * 0.1 * 0.9) || 1;

  const stats: DigitStat[] = [];
  for (let d = 0; d <= 9; d++) {
    const count = counts[d];
    const freq = totalDigitsObserved > 0 ? count / totalDigitsObserved : 0;
    const z = (count - expectedCount) / standardDeviation;
    stats.push({
      digit: d,
      count,
      frequency: freq,
      percentage: Number((freq * 100).toFixed(2)),
      rank: 0,
      zScore: Number(z.toFixed(2)),
      isHot: z > 0.5,
      isCold: z < -0.5
    });
  }

  // Assign rank by count descending
  const sorted = [...stats].sort((a, b) => b.count - a.count);
  sorted.forEach((item, index) => {
    const target = stats.find(s => s.digit === item.digit);
    if (target) target.rank = index + 1;
  });

  return stats;
}

// 2. Hot and Cold calculation
export function calculateHotCold(draws: DrawRecord[]) {
  const freqStats = calculateFrequency(draws);
  const sortedHot = [...freqStats].sort((a, b) => b.count - a.count || b.zScore - a.zScore);
  const sortedCold = [...freqStats].sort((a, b) => a.count - b.count || a.zScore - b.zScore);

  return {
    all: freqStats,
    top2: sortedHot.slice(0, 2),
    top3: sortedHot.slice(0, 3),
    top4: sortedHot.slice(0, 4),
    top5: sortedHot.slice(0, 5),
    bottom2: sortedCold.slice(0, 2),
    bottom3: sortedCold.slice(0, 3),
    bottom4: sortedCold.slice(0, 4),
    bottom5: sortedCold.slice(0, 5)
  };
}

// 3. Overdue / Gap Analysis: G(d) = T - T_terakhir(d)
export function calculateOverdue(draws: DrawRecord[]): OverdueStat[] {
  const stats: OverdueStat[] = [];
  const totalDraws = draws.length;

  for (let d = 0; d <= 9; d++) {
    const appearances: number[] = [];
    let lastDate: string | undefined;
    let lastPeriod: string | undefined;

    draws.forEach((draw, idx) => {
      const clean = draw.number.padStart(4, '0').slice(-4);
      if (clean.includes(d.toString())) {
        appearances.push(idx);
        lastDate = draw.date;
        lastPeriod = draw.period;
      }
    });

    const count = appearances.length;
    let currentGap = totalDraws;
    if (count > 0) {
      const lastIdx = appearances[appearances.length - 1];
      currentGap = totalDraws - 1 - lastIdx;
    }

    // Gaps between consecutive appearances
    const gaps: number[] = [];
    if (count > 0) {
      gaps.push(appearances[0]); // gap from start
      for (let i = 1; i < count; i++) {
        gaps.push(appearances[i] - appearances[i - 1] - 1);
      }
    }

    const avgGap = gaps.length > 0
      ? Number((gaps.reduce((acc, g) => acc + g, 0) / gaps.length).toFixed(1))
      : totalDraws;
    const maxGap = gaps.length > 0 ? Math.max(...gaps) : totalDraws;

    stats.push({
      digit: d,
      currentGap,
      lastDrawDate: lastDate,
      lastPeriod,
      avgGap,
      maxGap,
      appearanceCount: count
    });
  }

  // Sort by current gap descending (most overdue first)
  return stats.sort((a, b) => b.currentGap - a.currentGap);
}

// 4. Position Analysis (AS, KOP, KEPALA, EKOR)
export function calculatePositionAnalysis(
  draws: DrawRecord[],
  config: PositionConfig = { as: 0, kop: 1, kepala: 2, ekor: 3 }
): Record<PositionKey, PositionalFrequency> {
  const positions: Array<{ key: PositionKey; label: string; index: number }> = [
    { key: 'as', label: 'As (Digit 1)', index: config.as },
    { key: 'kop', label: 'Kop (Digit 2)', index: config.kop },
    { key: 'kepala', label: 'Kepala (Digit 3)', index: config.kepala },
    { key: 'ekor', label: 'Ekor (Digit 4)', index: config.ekor },
  ];

  const result: Partial<Record<PositionKey, PositionalFrequency>> = {};

  for (const pos of positions) {
    const digitCounts: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) digitCounts[d] = 0;

    for (const draw of draws) {
      const clean = draw.number.padStart(4, '0').slice(-4);
      const digit = parseInt(clean[pos.index], 10);
      if (!isNaN(digit) && digit >= 0 && digit <= 9) {
        digitCounts[digit]++;
      }
    }

    const totalInPos = draws.length || 1;
    let highestDigit = 0;
    let highestCount = -1;
    let lowestDigit = 0;
    let lowestCount = Infinity;

    for (let d = 0; d <= 9; d++) {
      const c = digitCounts[d];
      if (c > highestCount) {
        highestCount = c;
        highestDigit = d;
      }
      if (c < lowestCount) {
        lowestCount = c;
        lowestDigit = d;
      }
    }

    result[pos.key] = {
      position: pos.key,
      label: pos.label,
      digitCounts,
      mostFrequent: {
        digit: highestDigit,
        count: highestCount,
        pct: Number(((highestCount / totalInPos) * 100).toFixed(1))
      },
      leastFrequent: {
        digit: lowestDigit,
        count: lowestCount,
        pct: Number(((lowestCount / totalInPos) * 100).toFixed(1))
      }
    };
  }

  return result as Record<PositionKey, PositionalFrequency>;
}

// 5. 2D Pair Analysis
export function calculatePairAnalysis(
  draws: DrawRecord[],
  pairType: 'belakang' | 'depan' | 'tengah' | 'all' = 'belakang'
): {
  topPairs: PairStat[];
  rarePairs: PairStat[];
  zeroPairs: string[];
  consecutiveCount: number;
  nonConsecutiveCount: number;
} {
  const pairCounts: Record<string, { count: number; lastSeen: number }> = {};
  for (let i = 0; i <= 99; i++) {
    const key = i.toString().padStart(2, '0');
    pairCounts[key] = { count: 0, lastSeen: -1 };
  }

  let consecutiveCount = 0;
  let nonConsecutiveCount = 0;

  draws.forEach((draw, drawIdx) => {
    const clean = draw.number.padStart(4, '0').slice(-4);
    const pairsInThisDraw: string[] = [];

    if (pairType === 'belakang') {
      pairsInThisDraw.push(clean.slice(2, 4)); // Kepala-Ekor
    } else if (pairType === 'depan') {
      pairsInThisDraw.push(clean.slice(0, 2)); // As-Kop
    } else if (pairType === 'tengah') {
      pairsInThisDraw.push(clean.slice(1, 3)); // Kop-Kepala
    } else {
      pairsInThisDraw.push(
        clean.slice(0, 2),
        clean.slice(1, 3),
        clean.slice(2, 4),
        `${clean[0]}${clean[2]}`,
        `${clean[1]}${clean[3]}`,
        `${clean[0]}${clean[3]}`
      );
    }

    pairsInThisDraw.forEach(pair => {
      if (pairCounts[pair]) {
        pairCounts[pair].count++;
        pairCounts[pair].lastSeen = drawIdx;
      }
      const d1 = parseInt(pair[0], 10);
      const d2 = parseInt(pair[1], 10);
      if (Math.abs(d1 - d2) === 1 || (d1 === 0 && d2 === 9) || (d1 === 9 && d2 === 0)) {
        consecutiveCount++;
      } else {
        nonConsecutiveCount++;
      }
    });
  });

  const totalPairsObserved = Object.values(pairCounts).reduce((a, b) => a + b.count, 0) || 1;
  const pairStatsList: PairStat[] = [];
  const zeroPairs: string[] = [];

  for (let i = 0; i <= 99; i++) {
    const pair = i.toString().padStart(2, '0');
    const { count, lastSeen } = pairCounts[pair];
    const lastSeenDrawsAgo = lastSeen >= 0 ? draws.length - 1 - lastSeen : draws.length;

    if (count === 0) {
      zeroPairs.push(pair);
    }

    pairStatsList.push({
      pair,
      count,
      frequency: Number((count / totalPairsObserved).toFixed(4)),
      lastSeenDrawsAgo
    });
  }

  const topPairs = [...pairStatsList].sort((a, b) => b.count - a.count).slice(0, 10);
  const rarePairs = [...pairStatsList]
    .filter(p => p.count > 0)
    .sort((a, b) => a.count - b.count)
    .slice(0, 10);

  return {
    topPairs,
    rarePairs,
    zeroPairs,
    consecutiveCount,
    nonConsecutiveCount
  };
}

// 6. Mistik and Index Transition Analysis
export function calculateMistikIndexTransitions(draws: DrawRecord[]): {
  sameCount: number;
  mistikLamaCount: number;
  mistikBaruCount: number;
  indexCount: number;
  transitions: Array<{
    period: string;
    from: string;
    to: string;
    matches: Array<{ pos: number; digit: number; type: 'same' | 'mistikLama' | 'mistikBaru' | 'index' }>;
  }>;
} {
  let sameCount = 0;
  let mistikLamaCount = 0;
  let mistikBaruCount = 0;
  let indexCount = 0;
  const transitions: Array<{
    period: string;
    from: string;
    to: string;
    matches: Array<{ pos: number; digit: number; type: 'same' | 'mistikLama' | 'mistikBaru' | 'index' }>;
  }> = [];

  for (let i = 1; i < draws.length; i++) {
    const prev = draws[i - 1].number.padStart(4, '0').slice(-4);
    const curr = draws[i].number.padStart(4, '0').slice(-4);
    const matches: Array<{ pos: number; digit: number; type: 'same' | 'mistikLama' | 'mistikBaru' | 'index' }> = [];

    for (let p = 0; p < 4; p++) {
      const dCurr = parseInt(curr[p], 10);
      const dPrev = parseInt(prev[p], 10);

      if (dCurr === dPrev) {
        sameCount++;
        matches.push({ pos: p, digit: dCurr, type: 'same' });
      } else if (MISTIK_LAMA_MAP[dPrev] === dCurr) {
        mistikLamaCount++;
        matches.push({ pos: p, digit: dCurr, type: 'mistikLama' });
      } else if (MISTIK_BARU_MAP[dPrev] === dCurr) {
        mistikBaruCount++;
        matches.push({ pos: p, digit: dCurr, type: 'mistikBaru' });
      } else if (INDEX_MAP[dPrev] === dCurr) {
        indexCount++;
        matches.push({ pos: p, digit: dCurr, type: 'index' });
      }
    }

    transitions.push({
      period: draws[i].period,
      from: prev,
      to: curr,
      matches
    });
  }

  return {
    sameCount,
    mistikLamaCount,
    mistikBaruCount,
    indexCount,
    transitions: transitions.slice(-20) // Show last 20 transitions for detail
  };
}

// 7. Digit Sum (0 - 36)
export function calculateDigitSum(draws: DrawRecord[]): {
  sumCounts: Record<number, number>;
  mostFrequentSum: { sum: number; count: number };
  leastFrequentSum: { sum: number; count: number };
  neverDrawnSums: number[];
  averageSum: number;
  recentSums: Array<{ period: string; sum: number }>;
} {
  const sumCounts: Record<number, number> = {};
  for (let s = 0; s <= 36; s++) sumCounts[s] = 0;

  const sumList: number[] = [];
  const recentSums: Array<{ period: string; sum: number }> = [];

  for (const draw of draws) {
    const clean = draw.number.padStart(4, '0').slice(-4);
    const sum = clean.split('').reduce((acc, ch) => acc + (parseInt(ch, 10) || 0), 0);
    sumCounts[sum]++;
    sumList.push(sum);
    recentSums.push({ period: draw.period, sum });
  }

  let mostFreqSum = 18;
  let maxCount = -1;
  let leastFreqSum = 0;
  let minCount = Infinity;
  const neverDrawnSums: number[] = [];

  for (let s = 0; s <= 36; s++) {
    const c = sumCounts[s];
    if (c > maxCount) {
      maxCount = c;
      mostFreqSum = s;
    }
    if (c > 0 && c < minCount) {
      minCount = c;
      leastFreqSum = s;
    }
    if (c === 0) {
      neverDrawnSums.push(s);
    }
  }

  const avgSum = sumList.length > 0
    ? Number((sumList.reduce((a, b) => a + b, 0) / sumList.length).toFixed(1))
    : 18;

  return {
    sumCounts,
    mostFrequentSum: { sum: mostFreqSum, count: maxCount },
    leastFrequentSum: { sum: leastFreqSum, count: minCount === Infinity ? 0 : minCount },
    neverDrawnSums,
    averageSum: avgSum,
    recentSums: recentSums.slice(-30)
  };
}

// 8. Parity (Ganjil-Genap) and Size (Besar-Kecil)
export function calculateParityAndSize(draws: DrawRecord[]): {
  parityDistribution: PatternDistribution[];
  sizeDistribution: PatternDistribution[];
  oddCount: number;
  evenCount: number;
  bigCount: number;
  smallCount: number;
} {
  const parityCounts: Record<string, number> = {
    '4G-0E': 0,
    '3G-1E': 0,
    '2G-2E': 0,
    '1G-3E': 0,
    '0G-4E': 0
  };

  const sizeCounts: Record<string, number> = {
    '4B-0K': 0,
    '3B-1K': 0,
    '2B-2K': 0,
    '1B-3K': 0,
    '0B-4K': 0
  };

  let totalOdd = 0;
  let totalEven = 0;
  let totalBig = 0;
  let totalSmall = 0;

  for (const draw of draws) {
    const clean = draw.number.padStart(4, '0').slice(-4);
    let odd = 0;
    let big = 0;

    for (let i = 0; i < 4; i++) {
      const d = parseInt(clean[i], 10);
      if (d % 2 !== 0) {
        odd++;
        totalOdd++;
      } else {
        totalEven++;
      }

      if (d >= 5) {
        big++;
        totalBig++;
      } else {
        totalSmall++;
      }
    }

    const even = 4 - odd;
    const small = 4 - big;

    parityCounts[`${odd}G-${even}E`]++;
    sizeCounts[`${big}B-${small}K`]++;
  }

  const total = draws.length || 1;

  const parityDistribution: PatternDistribution[] = [
    { name: '4 Ganjil', pattern: '4G-0E', count: parityCounts['4G-0E'], percentage: Number(((parityCounts['4G-0E'] / total) * 100).toFixed(1)) },
    { name: '3 Ganjil, 1 Genap', pattern: '3G-1E', count: parityCounts['3G-1E'], percentage: Number(((parityCounts['3G-1E'] / total) * 100).toFixed(1)) },
    { name: '2 Ganjil, 2 Genap', pattern: '2G-2E', count: parityCounts['2G-2E'], percentage: Number(((parityCounts['2G-2E'] / total) * 100).toFixed(1)) },
    { name: '1 Ganjil, 3 Genap', pattern: '1G-3E', count: parityCounts['1G-3E'], percentage: Number(((parityCounts['1G-3E'] / total) * 100).toFixed(1)) },
    { name: '4 Genap', pattern: '0G-4E', count: parityCounts['0G-4E'], percentage: Number(((parityCounts['0G-4E'] / total) * 100).toFixed(1)) },
  ];

  const sizeDistribution: PatternDistribution[] = [
    { name: '4 Besar', pattern: '4B-0K', count: sizeCounts['4B-0K'], percentage: Number(((sizeCounts['4B-0K'] / total) * 100).toFixed(1)) },
    { name: '3 Besar, 1 Kecil', pattern: '3B-1K', count: sizeCounts['3B-1K'], percentage: Number(((sizeCounts['3B-1K'] / total) * 100).toFixed(1)) },
    { name: '2 Besar, 2 Kecil', pattern: '2B-2K', count: sizeCounts['2B-2K'], percentage: Number(((sizeCounts['2B-2K'] / total) * 100).toFixed(1)) },
    { name: '1 Besar, 3 Kecil', pattern: '1B-3K', count: sizeCounts['1B-3K'], percentage: Number(((sizeCounts['1B-3K'] / total) * 100).toFixed(1)) },
    { name: '4 Kecil', pattern: '0B-4K', count: sizeCounts['0B-4K'], percentage: Number(((sizeCounts['0B-4K'] / total) * 100).toFixed(1)) },
  ];

  return {
    parityDistribution,
    sizeDistribution,
    oddCount: totalOdd,
    evenCount: totalEven,
    bigCount: totalBig,
    smallCount: totalSmall
  };
}

// 9. Exponential Recency Weighting: W(d) = Σ 2^(-i / h) * I(d_i = d)
export function calculateRecencyWeighting(
  draws: DrawRecord[],
  halfLife: number = 14
): RecencyWeightStat[] {
  const h = Math.max(1, halfLife);
  const rawCounts: Record<number, number> = {};
  const weightedScores: Record<number, number> = {};

  for (let d = 0; d <= 9; d++) {
    rawCounts[d] = 0;
    weightedScores[d] = 0;
  }

  const n = draws.length;
  let totalRaw = 0;
  let totalWeighted = 0;

  for (let idx = 0; idx < n; idx++) {
    const draw = draws[idx];
    const i = n - 1 - idx; // distance in periods from newest (0 = newest)
    const decayWeight = Math.pow(2, -i / h);
    const clean = draw.number.padStart(4, '0').slice(-4);

    for (let p = 0; p < 4; p++) {
      const d = parseInt(clean[p], 10);
      if (!isNaN(d) && d >= 0 && d <= 9) {
        rawCounts[d]++;
        totalRaw++;
        weightedScores[d] += decayWeight;
        totalWeighted += decayWeight;
      }
    }
  }

  const stats: RecencyWeightStat[] = [];
  for (let d = 0; d <= 9; d++) {
    const rawPct = totalRaw > 0 ? (rawCounts[d] / totalRaw) * 100 : 0;
    const weightedPct = totalWeighted > 0 ? (weightedScores[d] / totalWeighted) * 100 : 0;

    stats.push({
      digit: d,
      rawCount: rawCounts[d],
      rawPercentage: Number(rawPct.toFixed(2)),
      weightedScore: Number(weightedScores[d].toFixed(3)),
      weightedPercentage: Number(weightedPct.toFixed(2)),
      rank: 0
    });
  }

  // Sort and assign rank by weighted score
  const sorted = [...stats].sort((a, b) => b.weightedScore - a.weightedScore);
  sorted.forEach((item, index) => {
    const target = stats.find(s => s.digit === item.digit);
    if (target) target.rank = index + 1;
  });

  return stats;
}

// 10. Walk-Forward Backtesting Engine (Strictly No Look-Ahead)
export function runWalkForwardBacktest(
  draws: DrawRecord[],
  method: 'hot' | 'cold' | 'overdue' | 'recency' | 'composite' = 'composite',
  trainWindow: number = 20,
  weights: IndicatorWeights = {
    frequency: 25,
    recency: 25,
    overdue: 15,
    positional: 20,
    pairs: 10,
    pattern: 5,
    halfLife: 14
  }
): BacktestResult {
  const minRequired = Math.max(10, trainWindow);
  if (draws.length <= minRequired) {
    return {
      totalEvaluated: 0,
      trainSize: trainWindow,
      testedMethod: method,
      digitHitRate: 0,
      positionHitRate: 0,
      exact2DHitRate: 0,
      exact3DHitRate: 0,
      exact4DHitRate: 0,
      randomBaselineDigit: 34.39, // Hypergeometric probability of >=1 match in 4 picks
      randomBaseline2D: 1.0, // 1 in 100
      randomBaseline3D: 0.1, // 1 in 1000
      randomBaseline4D: 0.01, // 1 in 10000
      confidenceInterval: [0, 0],
      historyLog: []
    };
  }

  let digitHitCount = 0;
  let positionHitCount = 0;
  let exact2DHitCount = 0;
  let exact3DHitCount = 0;
  let exact4DHitCount = 0;
  let totalEvaluated = 0;

  const historyLog: BacktestResult['historyLog'] = [];

  // Walk forward: for each time step t from minRequired to draws.length - 1
  for (let t = minRequired; t < draws.length; t++) {
    const trainingSlice = draws.slice(Math.max(0, t - trainWindow), t);
    const targetDraw = draws[t];
    const actualClean = targetDraw.number.padStart(4, '0').slice(-4);
    const actualDigits = actualClean.split('').map(c => parseInt(c, 10));

    // Predict based solely on trainingSlice
    let predictedTopDigits: number[] = [];
    let predicted2D = '00';

    if (method === 'hot') {
      const hotStats = calculateFrequency(trainingSlice).sort((a, b) => b.count - a.count);
      predictedTopDigits = hotStats.slice(0, 4).map(s => s.digit);
      predicted2D = `${predictedTopDigits[0]}${predictedTopDigits[1]}`;
    } else if (method === 'cold') {
      const coldStats = calculateFrequency(trainingSlice).sort((a, b) => a.count - b.count);
      predictedTopDigits = coldStats.slice(0, 4).map(s => s.digit);
      predicted2D = `${predictedTopDigits[0]}${predictedTopDigits[1]}`;
    } else if (method === 'overdue') {
      const overdueStats = calculateOverdue(trainingSlice);
      predictedTopDigits = overdueStats.slice(0, 4).map(s => s.digit);
      predicted2D = `${predictedTopDigits[0]}${predictedTopDigits[1]}`;
    } else if (method === 'recency') {
      const recencyStats = calculateRecencyWeighting(trainingSlice, weights.halfLife);
      predictedTopDigits = recencyStats.slice(0, 4).map(s => s.digit);
      predicted2D = `${predictedTopDigits[0]}${predictedTopDigits[1]}`;
    } else {
      // Composite prediction
      const compositeScores = getCompositeDigitScores(trainingSlice, weights);
      const sorted = Object.entries(compositeScores)
        .map(([d, score]) => ({ digit: parseInt(d, 10), score }))
        .sort((a, b) => b.score - a.score);

      predictedTopDigits = sorted.slice(0, 4).map(s => s.digit);
      const posAnalysis = calculatePositionAnalysis(trainingSlice);
      const kepalaPred = posAnalysis.kepala.mostFrequent.digit;
      const ekorPred = posAnalysis.ekor.mostFrequent.digit;
      predicted2D = `${kepalaPred}${ekorPred}`;
    }

    // Evaluation checks
    const hasDigitHit = predictedTopDigits.some(d => actualDigits.includes(d));
    const actual2D = actualClean.slice(2, 4);
    const is2DHit = predicted2D === actual2D;

    // Positional check (As, Kop, Kepala, Ekor predictions vs actual)
    const posAnalysis = calculatePositionAnalysis(trainingSlice);
    const isPositionHit =
      posAnalysis.as.mostFrequent.digit === actualDigits[0] ||
      posAnalysis.kop.mostFrequent.digit === actualDigits[1] ||
      posAnalysis.kepala.mostFrequent.digit === actualDigits[2] ||
      posAnalysis.ekor.mostFrequent.digit === actualDigits[3];

    if (hasDigitHit) digitHitCount++;
    if (is2DHit) exact2DHitCount++;
    if (isPositionHit) positionHitCount++;

    totalEvaluated++;

    historyLog.push({
      period: targetDraw.period,
      actual: actualClean,
      predicted2D,
      predictedTopDigits,
      isDigitHit: hasDigitHit,
      is2DHit,
      isPositionHit
    });
  }

  const digitHitRate = totalEvaluated > 0 ? Number(((digitHitCount / totalEvaluated) * 100).toFixed(2)) : 0;
  const positionHitRate = totalEvaluated > 0 ? Number(((positionHitCount / totalEvaluated) * 100).toFixed(2)) : 0;
  const exact2DHitRate = totalEvaluated > 0 ? Number(((exact2DHitCount / totalEvaluated) * 100).toFixed(2)) : 0;
  const exact3DHitRate = totalEvaluated > 0 ? Number(((exact3DHitCount / totalEvaluated) * 100).toFixed(2)) : 0;
  const exact4DHitRate = totalEvaluated > 0 ? Number(((exact4DHitCount / totalEvaluated) * 100).toFixed(2)) : 0;

  // 95% Confidence Interval for Digit Hit Rate
  const p = digitHitRate / 100;
  const margin = totalEvaluated > 0 ? 1.96 * Math.sqrt((p * (1 - p)) / totalEvaluated) * 100 : 0;
  const ciLow = Math.max(0, Number((digitHitRate - margin).toFixed(2)));
  const ciHigh = Math.min(100, Number((digitHitRate + margin).toFixed(2)));

  return {
    totalEvaluated,
    trainSize: trainWindow,
    testedMethod: method,
    digitHitRate,
    positionHitRate,
    exact2DHitRate,
    exact3DHitRate,
    exact4DHitRate,
    randomBaselineDigit: 34.39,
    randomBaseline2D: 1.0,
    randomBaseline3D: 0.1,
    randomBaseline4D: 0.01,
    confidenceInterval: [ciLow, ciHigh],
    historyLog: historyLog.reverse()
  };
}

// 11. Helper: Compute Normalized Composite Scores for Digits 0-9
export function getCompositeDigitScores(
  draws: DrawRecord[],
  weights: IndicatorWeights
): Record<number, number> {
  const scores: Record<number, number> = {};
  for (let d = 0; d <= 9; d++) scores[d] = 0;

  if (!draws || draws.length === 0) return scores;

  // Total weight normalization
  const sumWeights = (
    weights.frequency +
    weights.recency +
    weights.overdue +
    weights.positional +
    weights.pairs +
    weights.pattern
  ) || 100;

  // Component 1: Frequency
  const freqStats = calculateFrequency(draws);
  const maxFreq = Math.max(...freqStats.map(s => s.count)) || 1;
  const freqScores: Record<number, number> = {};
  freqStats.forEach(s => {
    freqScores[s.digit] = (s.count / maxFreq) * 100;
  });

  // Component 2: Recency Weighting
  const recencyStats = calculateRecencyWeighting(draws, weights.halfLife);
  const maxRec = Math.max(...recencyStats.map(s => s.weightedScore)) || 1;
  const recScores: Record<number, number> = {};
  recencyStats.forEach(s => {
    recScores[s.digit] = (s.weightedScore / maxRec) * 100;
  });

  // Component 3: Overdue / Gap
  const overdueStats = calculateOverdue(draws);
  const maxGap = Math.max(...overdueStats.map(s => s.currentGap)) || 1;
  const gapScores: Record<number, number> = {};
  overdueStats.forEach(s => {
    gapScores[s.digit] = (s.currentGap / maxGap) * 100;
  });

  // Component 4: Positional Peak
  const posAnalysis = calculatePositionAnalysis(draws);
  const posScores: Record<number, number> = {};
  for (let d = 0; d <= 9; d++) {
    const totalPosCount =
      posAnalysis.as.digitCounts[d] +
      posAnalysis.kop.digitCounts[d] +
      posAnalysis.kepala.digitCounts[d] +
      posAnalysis.ekor.digitCounts[d];
    posScores[d] = totalPosCount;
  }
  const maxPos = Math.max(...Object.values(posScores)) || 1;
  for (let d = 0; d <= 9; d++) {
    posScores[d] = (posScores[d] / maxPos) * 100;
  }

  // Combine weighted components
  for (let d = 0; d <= 9; d++) {
    const total =
      (freqScores[d] * weights.frequency +
        recScores[d] * weights.recency +
        gapScores[d] * weights.overdue +
        posScores[d] * weights.positional) /
      sumWeights;
    scores[d] = Number(total.toFixed(2));
  }

  return scores;
}

// 12. Smart Prediction Generator (4D, 3D, 2D, BBFS, Colok)
export function generateCompositePrediction(
  draws: DrawRecord[],
  weights: IndicatorWeights,
  posConfig: PositionConfig = { as: 0, kop: 1, kepala: 2, ekor: 3 }
) {
  const scores = getCompositeDigitScores(draws, weights);
  const sortedDigits = Object.entries(scores)
    .map(([d, score]) => ({ digit: parseInt(d, 10), score }))
    .sort((a, b) => b.score - a.score);

  const topDigits = sortedDigits.map(s => s.digit);

  // Positional highest scored digits
  const posAnalysis = calculatePositionAnalysis(draws, posConfig);
  const bestAs = posAnalysis.as.mostFrequent.digit;
  const bestKop = posAnalysis.kop.mostFrequent.digit;
  const bestKepala = posAnalysis.kepala.mostFrequent.digit;
  const bestEkor = posAnalysis.ekor.mostFrequent.digit;

  // Secondary candidate digits per position
  const getSecondBest = (posCounts: Record<number, number>, exclude: number) => {
    let best = -1;
    let max = -1;
    for (let d = 0; d <= 9; d++) {
      if (d !== exclude && posCounts[d] > max) {
        max = posCounts[d];
        best = d;
      }
    }
    return best >= 0 ? best : (exclude + 1) % 10;
  };

  const secondAs = getSecondBest(posAnalysis.as.digitCounts, bestAs);
  const secondKop = getSecondBest(posAnalysis.kop.digitCounts, bestKop);
  const secondKepala = getSecondBest(posAnalysis.kepala.digitCounts, bestKepala);
  const secondEkor = getSecondBest(posAnalysis.ekor.digitCounts, bestEkor);

  // Primary 4D combinations
  const primary4D = `${bestAs}${bestKop}${bestKepala}${bestEkor}`;
  const secondary4D = `${topDigits[0]}${topDigits[1]}${topDigits[2]}${topDigits[3]}`;
  const alternate4D = `${secondAs}${secondKop}${secondKepala}${secondEkor}`;

  // 3D combinations
  const primary3D = `${bestKop}${bestKepala}${bestEkor}`;
  const secondary3D = `${topDigits[1]}${topDigits[2]}${topDigits[3]}`;

  // 2D combinations (Belakang, Tengah, Depan)
  const pair2D_Belakang = `${bestKepala}${bestEkor}`;
  const pair2D_Tengah = `${bestKop}${bestKepala}`;
  const pair2D_Depan = `${bestAs}${bestKop}`;

  // BBFS (Top 6 digits)
  const bbfs = topDigits.slice(0, 6);

  // Colok Bebas (Top 2 digits)
  const colokBebas = [topDigits[0], topDigits[1]];

  // Colok Jitu
  const colokJitu = {
    as: bestAs,
    kop: bestKop,
    kepala: bestKepala,
    ekor: bestEkor
  };

  return {
    sortedDigits,
    primary4D,
    secondary4D,
    alternate4D,
    primary3D,
    secondary3D,
    pair2D_Belakang,
    pair2D_Tengah,
    pair2D_Depan,
    bbfs,
    colokBebas,
    colokJitu
  };
}

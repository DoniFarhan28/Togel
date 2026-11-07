import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFrequency,
  calculateHotCold,
  calculateOverdue,
  calculatePositionAnalysis,
  calculatePairAnalysis,
  calculateMistikIndexTransitions,
  calculateDigitSum,
  calculateParityAndSize,
  calculateRecencyWeighting,
  runWalkForwardBacktest,
  generateCompositePrediction,
  MISTIK_LAMA_MAP,
  MISTIK_BARU_MAP,
  INDEX_MAP
} from './calculations';
import { DrawRecord } from '../types/lottery';

const sampleDraws: DrawRecord[] = [
  { id: '1', marketId: 'test', date: '01-11-2026', period: '101', number: '1234', createdAt: 1000 },
  { id: '2', marketId: 'test', date: '02-11-2026', period: '102', number: '5678', createdAt: 2000 },
  { id: '3', marketId: 'test', date: '03-11-2026', period: '103', number: '9012', createdAt: 3000 },
  { id: '4', marketId: 'test', date: '04-11-2026', period: '104', number: '3456', createdAt: 4000 },
  { id: '5', marketId: 'test', date: '05-11-2026', period: '105', number: '7890', createdAt: 5000 },
  { id: '6', marketId: 'test', date: '06-11-2026', period: '106', number: '1122', createdAt: 6000 },
  { id: '7', marketId: 'test', date: '07-11-2026', period: '107', number: '3344', createdAt: 7000 },
  { id: '8', marketId: 'test', date: '08-11-2026', period: '108', number: '5566', createdAt: 8000 },
  { id: '9', marketId: 'test', date: '09-11-2026', period: '109', number: '7788', createdAt: 9000 },
  { id: '10', marketId: 'test', date: '10-11-2026', period: '110', number: '9900', createdAt: 10000 },
  { id: '11', marketId: 'test', date: '11-11-2026', period: '111', number: '1234', createdAt: 11000 },
  { id: '12', marketId: 'test', date: '12-11-2026', period: '112', number: '5678', createdAt: 12000 },
];

test('calculateFrequency returns 10 digits with correct totals', () => {
  const stats = calculateFrequency(sampleDraws);
  assert.equal(stats.length, 10);
  const totalCount = stats.reduce((sum, s) => sum + s.count, 0);
  assert.equal(totalCount, sampleDraws.length * 4);
  assert.ok(stats.every(s => s.rank >= 1 && s.rank <= 10));
});

test('calculateHotCold partitions correctly', () => {
  const res = calculateHotCold(sampleDraws);
  assert.equal(res.top2.length, 2);
  assert.equal(res.top3.length, 3);
  assert.equal(res.bottom2.length, 2);
  assert.equal(res.bottom3.length, 3);
  assert.ok(res.top2[0].count >= res.top2[1].count);
});

test('calculateOverdue tracks gap correctly', () => {
  const overdue = calculateOverdue(sampleDraws);
  assert.equal(overdue.length, 10);
  // Digit 4 appeared in draw 11 (index 10). Latest draw is index 11 (5678).
  // So gap for digit 4 should be 1.
  const stat4 = overdue.find(s => s.digit === 4);
  assert.ok(stat4 !== undefined);
  assert.equal(stat4.currentGap, 1);
});

test('calculatePositionAnalysis separates As, Kop, Kepala, Ekor', () => {
  const pos = calculatePositionAnalysis(sampleDraws);
  assert.ok(pos.as && pos.kop && pos.kepala && pos.ekor);
  // Draw 0: 1234 -> As=1, Kop=2, Kepala=3, Ekor=4
  assert.ok(pos.as.digitCounts[1] >= 1);
  assert.ok(pos.kop.digitCounts[2] >= 1);
  assert.ok(pos.kepala.digitCounts[3] >= 1);
  assert.ok(pos.ekor.digitCounts[4] >= 1);
});

test('calculatePairAnalysis finds 2D pairs', () => {
  const pairs = calculatePairAnalysis(sampleDraws, 'belakang');
  assert.ok(pairs.topPairs.length <= 10);
  assert.ok(pairs.consecutiveCount + pairs.nonConsecutiveCount === sampleDraws.length);
});

test('Mistik and Index mappings match standards', () => {
  assert.equal(MISTIK_LAMA_MAP[1], 0);
  assert.equal(MISTIK_LAMA_MAP[2], 5);
  assert.equal(MISTIK_BARU_MAP[0], 8);
  assert.equal(MISTIK_BARU_MAP[1], 7);
  assert.equal(INDEX_MAP[0], 5);
  assert.equal(INDEX_MAP[1], 6);

  const transitions = calculateMistikIndexTransitions(sampleDraws);
  assert.ok(transitions.transitions.length > 0);
});

test('calculateDigitSum calculates range 0 to 36 accurately', () => {
  const res = calculateDigitSum(sampleDraws);
  // '1234' sum is 10. '5678' sum is 26.
  assert.ok(res.sumCounts[10] >= 1);
  assert.ok(res.sumCounts[26] >= 1);
  assert.ok(res.averageSum > 0 && res.averageSum < 36);
});

test('calculateParityAndSize categorizes correctly', () => {
  const res = calculateParityAndSize(sampleDraws);
  assert.equal(res.parityDistribution.length, 5);
  assert.equal(res.sizeDistribution.length, 5);
  const totalParity = res.parityDistribution.reduce((acc, p) => acc + p.count, 0);
  assert.equal(totalParity, sampleDraws.length);
});

test('calculateRecencyWeighting applies exponential decay', () => {
  const stats = calculateRecencyWeighting(sampleDraws, 7);
  assert.equal(stats.length, 10);
  assert.ok(stats.every(s => s.weightedScore >= 0));
});

test('runWalkForwardBacktest executes without errors and respects boundaries', () => {
  const res = runWalkForwardBacktest(sampleDraws, 'composite', 5);
  assert.ok(res.totalEvaluated > 0);
  assert.ok(res.digitHitRate >= 0 && res.digitHitRate <= 100);
});

test('generateCompositePrediction generates valid 4D, 3D, 2D and BBFS', () => {
  const pred = generateCompositePrediction(sampleDraws, {
    frequency: 25,
    recency: 25,
    overdue: 15,
    positional: 20,
    pairs: 10,
    pattern: 5,
    halfLife: 14
  });
  assert.equal(pred.primary4D.length, 4);
  assert.equal(pred.primary3D.length, 3);
  assert.equal(pred.pair2D_Belakang.length, 2);
  assert.equal(pred.bbfs.length, 6);
});

import {
    getAverageLifeExpectancy,
    getHealthyLifeExpectancy,
    getLifeProgressPercentage,
    HEALTHY_LIFE_EXPECTANCY_DATA_YEAR,
    LIFE_EXPECTANCY_DATA_YEAR,
} from '../../../src/lib/life-expectancy';

describe('getAverageLifeExpectancy', () => {
    it('2025年の平均寿命データを使う', () => {
        expect(LIFE_EXPECTANCY_DATA_YEAR).toBe(2025);
    });

    it('2022年の健康寿命データを使う', () => {
        expect(HEALTHY_LIFE_EXPECTANCY_DATA_YEAR).toBe(2022);
    });

    it.each([
        ['男性', 81.35],
        ['女性', 87.33],
        ['その他', 84.34],
        ['未設定', 84.34],
    ] as const)('%sの平均寿命を返す', (gender, expected) => {
        expect(getAverageLifeExpectancy(gender)).toBe(expected);
    });

    it.each([
        ['男性', 72.57],
        ['女性', 75.45],
        ['その他', 74.01],
        ['未設定', 74.01],
    ] as const)('%sの健康寿命を返す', (gender, expected) => {
        expect(getHealthyLifeExpectancy(gender)).toBe(expected);
    });

    it('終点に対する進行度を計算し、100%を超える値も返す', () => {
        expect(getLifeProgressPercentage(29, 81.35)).toBeCloseTo(35.64, 1);
        expect(getLifeProgressPercentage(100, 72.57)).toBeGreaterThan(100);
    });
});

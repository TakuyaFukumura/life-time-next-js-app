import {getAverageLifeExpectancy, LIFE_EXPECTANCY_DATA_YEAR} from '../../../src/lib/life-expectancy';

describe('getAverageLifeExpectancy', () => {
    it('2025年の平均寿命データを使う', () => {
        expect(LIFE_EXPECTANCY_DATA_YEAR).toBe(2025);
    });

    it.each([
        ['男性', 81.35],
        ['女性', 87.33],
        ['その他', 84.34],
        ['未設定', 84.34],
    ] as const)('%sの平均寿命を返す', (gender, expected) => {
        expect(getAverageLifeExpectancy(gender)).toBe(expected);
    });
});

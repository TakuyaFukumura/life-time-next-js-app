import type {Gender} from './life-settings';

export const LIFE_EXPECTANCY_DATA_YEAR = 2025;

const maleLifeExpectancy = 81.35;
const femaleLifeExpectancy = 87.33;

export function getAverageLifeExpectancy(gender: Gender): number {
    if (gender === '男性') {
        return maleLifeExpectancy;
    }
    if (gender === '女性') {
        return femaleLifeExpectancy;
    }

    return (maleLifeExpectancy + femaleLifeExpectancy) / 2;
}

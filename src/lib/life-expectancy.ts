import type {Gender} from './life-settings';

export const LIFE_EXPECTANCY_DATA_YEAR = 2025;
export const HEALTHY_LIFE_EXPECTANCY_DATA_YEAR = 2022;

const maleLifeExpectancy = 81.35;
const femaleLifeExpectancy = 87.33;
const maleHealthyLifeExpectancy = 72.57;
const femaleHealthyLifeExpectancy = 75.45;

function averageToTwoDecimals(male: number, female: number): number {
    return Math.round((male + female) * 50) / 100;
}

export function getAverageLifeExpectancy(gender: Gender): number {
    if (gender === '男性') {
        return maleLifeExpectancy;
    }
    if (gender === '女性') {
        return femaleLifeExpectancy;
    }

    return averageToTwoDecimals(maleLifeExpectancy, femaleLifeExpectancy);
}

export function getHealthyLifeExpectancy(gender: Gender): number {
    if (gender === '男性') {
        return maleHealthyLifeExpectancy;
    }
    if (gender === '女性') {
        return femaleHealthyLifeExpectancy;
    }

    return averageToTwoDecimals(maleHealthyLifeExpectancy, femaleHealthyLifeExpectancy);
}

export function getLifeProgressPercentage(currentAge: number, endpointAge: number): number {
    return (currentAge / endpointAge) * 100;
}

import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {parse} from 'csv-parse/sync';
import {GENDERS} from './gender';
import type {Gender} from './gender';

export {GENDERS} from './gender';
export type {Gender} from './gender';

export type LifeSettings = {
    currentAge: number;
    gender: Gender;
};

function isGender(value: string): value is Gender {
    return GENDERS.includes(value as Gender);
}

export function parseLifeSettingsCsv(content: string): LifeSettings {
    if (content.startsWith('\uFEFF')) {
        throw new Error('設定CSVにBOMを含めることはできません');
    }

    const rows = parse(content, {
        bom: false,
        skip_empty_lines: true,
        trim: true,
    }) as string[][];

    if (
        rows.length === 0 ||
        rows[0].length !== 2 ||
        rows[0][0] !== 'current_age' ||
        rows[0][1] !== 'gender'
    ) {
        throw new Error('設定CSVのヘッダーが不正です');
    }
    if (rows.length !== 2 || rows[1].length !== 2) {
        throw new Error('設定CSVには現在年齢と性別を1件だけ指定してください');
    }

    const [ageText, genderText] = rows[1];
    if (!/^\d+$/.test(ageText)) {
        throw new Error('現在年齢は整数ではありません');
    }

    const age = Number(ageText);
    if (age > 100) {
        throw new Error('現在年齢が範囲外です');
    }

    const gender = genderText || '未設定';
    if (!isGender(gender)) {
        throw new Error('性別が不正です');
    }

    return {currentAge: age, gender};
}

export async function loadLifeSettings(): Promise<LifeSettings> {
    const filePath = path.join(process.cwd(), 'data', 'life-settings.csv');
    const content = new TextDecoder('utf-8', {
        fatal: true,
        ignoreBOM: true,
    }).decode(await readFile(filePath));
    return parseLifeSettingsCsv(content);
}

import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {parse} from 'csv-parse/sync';

export function parseCurrentAgeCsv(content: string): number {
    if (content.startsWith('\uFEFF')) {
        throw new Error('設定CSVにBOMを含めることはできません');
    }

    const rows = parse(content, {
        bom: false,
        skip_empty_lines: true,
        trim: true,
    }) as string[][];

    if (rows.length === 0 || rows[0].length !== 1 || rows[0][0] !== 'current_age') {
        throw new Error('設定CSVのヘッダーが不正です');
    }
    if (rows.length !== 2 || rows[1].length !== 1) {
        throw new Error('設定CSVには現在年齢を1件だけ指定してください');
    }

    const ageText = rows[1][0];
    if (!/^\d+$/.test(ageText)) {
        throw new Error('現在年齢は整数ではありません');
    }

    const age = Number(ageText);
    if (age > 100) {
        throw new Error('現在年齢が範囲外です');
    }

    return age;
}

export async function loadCurrentAge(): Promise<number> {
    const filePath = path.join(process.cwd(), 'data', 'life-settings.csv');
    const content = new TextDecoder('utf-8', {
        fatal: true,
        ignoreBOM: true,
    }).decode(await readFile(filePath));
    return parseCurrentAgeCsv(content);
}

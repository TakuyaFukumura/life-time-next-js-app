import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {parse} from 'csv-parse/sync';
import {LIFE_EVENT_CATEGORIES} from './life-event-categories';
import type {LifeEventCategory} from './life-event-categories';

export const LIFE_EVENT_CSV_HEADERS = [
    'type',
    'name',
    'age',
    'category',
    'description',
    'status',
] as const;

export type LifeEventType = 'event' | 'goal';
export {LIFE_EVENT_CATEGORIES} from './life-event-categories';
export type {LifeEventCategory} from './life-event-categories';
export type GoalStatus = '未着手' | '進行中' | '達成' | '中止';

type LifeEventBase = {
    name: string;
    age: number;
    category: LifeEventCategory;
    description: string;
};

export type LifeEvent =
    | (LifeEventBase & {type: 'event'; status?: never})
    | (LifeEventBase & {type: 'goal'; status: GoalStatus});

const goalStatuses: readonly GoalStatus[] = ['未着手', '進行中', '達成', '中止'];

function isCategory(value: string): value is LifeEventCategory {
    return LIFE_EVENT_CATEGORIES.includes(value as LifeEventCategory);
}

function isGoalStatus(value: string): value is GoalStatus {
    return goalStatuses.includes(value as GoalStatus);
}

export function parseLifeEventsCsv(content: string): LifeEvent[] {
    if (content.startsWith('\uFEFF')) {
        throw new Error('CSVにBOMを含めることはできません');
    }

    const rows = parse(content, {
        bom: false,
        skip_empty_lines: true,
        trim: true,
    }) as string[][];

    const headers = rows.shift();
    if (!headers || headers.length !== LIFE_EVENT_CSV_HEADERS.length ||
        !LIFE_EVENT_CSV_HEADERS.every((header, index) => headers[index] === header)) {
        throw new Error('CSVのヘッダーが不正です');
    }

    return rows.map((row, index) => {
        if (row.length !== LIFE_EVENT_CSV_HEADERS.length) {
            throw new Error(`${index + 2}行目の列数が不正です`);
        }

        const [type, name, ageText, category, description, status] = row;
        if (type !== 'event' && type !== 'goal') {
            throw new Error(`${index + 2}行目の種別が不正です`);
        }
        if (!name) {
            throw new Error(`${index + 2}行目の名称が空です`);
        }
        if (!/^\d+$/.test(ageText)) {
            throw new Error(`${index + 2}行目の年齢が整数ではありません`);
        }

        const age = Number(ageText);
        if (age < 0 || age > 100) {
            throw new Error(`${index + 2}行目の年齢が範囲外です`);
        }
        if (!isCategory(category)) {
            throw new Error(`${index + 2}行目のカテゴリが不正です`);
        }
        const lifeEvent = {
            name,
            age,
            category,
            description,
        };

        if (type === 'goal') {
            if (!isGoalStatus(status)) {
                throw new Error(`${index + 2}行目の目標状態が不正です`);
            }
            return {...lifeEvent, type, status};
        }
        if (status) {
            throw new Error(`${index + 2}行目のイベントに目標状態は指定できません`);
        }
        return {...lifeEvent, type};
    });
}

export async function loadLifeEvents(): Promise<LifeEvent[]> {
    const filePath = path.join(process.cwd(), 'data', 'life-events.csv');
    const content = new TextDecoder('utf-8', {
        fatal: true,
        ignoreBOM: true,
    }).decode(await readFile(filePath));
    return parseLifeEventsCsv(content);
}

import {loadLifeEvents, parseLifeEventsCsv} from '../../../src/lib/life-events';

const headers = 'type,name,age,category,description,status';

describe('parseLifeEventsCsv', () => {
    it('リポジトリ内のサンプルCSVを読み込む', async () => {
        const events = await loadLifeEvents();

        expect(events.length).toBeGreaterThan(0);
        expect(events.some((event) => event.type === 'goal')).toBe(true);
    });

    it('イベントと目標を解析し、年齢を数値に変換する', () => {
        const events = parseLifeEventsCsv(
            `${headers}\nevent,誕生,0,家族,,\nevent,大学卒業,22,学業,,\ngoal,目標,30,仕事,"説明, 補足",進行中\n`
        );

        expect(events).toEqual([
            {
                type: 'event',
                name: '誕生',
                age: 0,
                category: '家族',
                description: '',
            },
            {
                type: 'event',
                name: '大学卒業',
                age: 22,
                category: '学業',
                description: '',
            },
            {
                type: 'goal',
                name: '目標',
                age: 30,
                category: '仕事',
                description: '説明, 補足',
                status: '進行中',
            },
        ]);
    });

    it('列名や列順が異なるヘッダーを拒否する', () => {
        expect(() => parseLifeEventsCsv('name,type,age,category,description,status'))
            .toThrow('CSVのヘッダーが不正です');
    });

    it('必須の名称が空の行を拒否する', () => {
        expect(() => parseLifeEventsCsv(`${headers}\nevent,,20,仕事,,`))
            .toThrow('名称が空です');
    });

    it.each(['1.5', '-1', '101', 'abc'])('不正な年齢 %s を拒否する', (age) => {
        expect(() => parseLifeEventsCsv(`${headers}\nevent,出来事,${age},仕事,,`))
            .toThrow();
    });

    it('許可されていないカテゴリを拒否する', () => {
        expect(() => parseLifeEventsCsv(`${headers}\nevent,出来事,20,その他,,`))
            .toThrow('カテゴリが不正です');
    });

    it('目標に状態がない場合や状態が不正な場合に拒否する', () => {
        expect(() => parseLifeEventsCsv(`${headers}\ngoal,目標,20,仕事,,`))
            .toThrow('目標状態が不正です');
        expect(() => parseLifeEventsCsv(`${headers}\ngoal,目標,20,仕事,,保留`))
            .toThrow('目標状態が不正です');
    });

    it('イベントに目標状態が指定された行を拒否する', () => {
        expect(() => parseLifeEventsCsv(`${headers}\nevent,出来事,20,仕事,,達成`))
            .toThrow('イベントに目標状態は指定できません');
    });

    it('BOM付きCSVを拒否する', () => {
        expect(() => parseLifeEventsCsv(`\uFEFF${headers}`))
            .toThrow('CSVにBOMを含めることはできません');
    });

    it('列数が異なる行を拒否する', () => {
        expect(() => parseLifeEventsCsv(`${headers}\nevent,出来事,20,仕事,`))
            .toThrow();
    });

    it('空のCSVを拒否する', () => {
        expect(() => parseLifeEventsCsv(''))
            .toThrow('CSVのヘッダーが不正です');
    });
});

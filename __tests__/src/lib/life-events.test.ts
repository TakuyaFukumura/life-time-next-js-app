import {loadLifeEvents, parseLifeEventsCsv} from '../../../src/lib/life-events';

const headers = 'type,name,age,category,description,status';

describe('parseLifeEventsCsv', () => {
    it('リポジトリ内のサンプルCSVを読み込む', async () => {
        const events = await loadLifeEvents();

        expect(events.length).toBeGreaterThan(0);
        expect(events.some((event) => event.type === 'goal')).toBe(true);
        expect(events.some((event) => event.name === '就職')).toBe(true);
        expect(events.some((event) => event.name === '初めての仕事')).toBe(false);
        expect(events.some((event) => event.name === '専門分野のスキルを身につける')).toBe(false);
        expect(events.find((event) => event.name === '貯金目標達成')).toMatchObject({
            type: 'goal',
            age: 26,
            category: '資産形成',
            status: '達成',
        });
        expect(events.find((event) => event.name === '半世紀生きる')).toMatchObject({
            type: 'goal',
            age: 50,
            category: '家族',
            status: '未着手',
        });
        expect(events.find((event) => event.name === 'NISA枠埋める')).toMatchObject({
            type: 'goal',
            age: 40,
            category: '資産形成',
            status: '未着手',
        });
        expect(events.find((event) => event.name === 'iDeCo活用開始')).toMatchObject({
            type: 'goal',
            age: 41,
            category: '資産形成',
            status: '未着手',
        });
        expect(events.find((event) => event.name === '収入の３本柱確立')).toMatchObject({
            type: 'goal',
            age: 43,
            category: '資産形成',
            status: '未着手',
        });
        expect(events.find((event) => event.name === '1世紀生きる')).toMatchObject({
            type: 'goal',
            age: 100,
            category: '家族',
            status: '未着手',
        });
        expect(events.find((event) => event.name === '銀婚式')).toMatchObject({
            type: 'event',
            age: 54,
            category: '家族',
        });
        expect(events.find((event) => event.name === '金婚式')).toMatchObject({
            type: 'event',
            age: 79,
            category: '家族',
        });
        expect(events.find((event) => event.name === '還暦')).toMatchObject({
            type: 'event',
            age: 60,
            category: '家族',
        });
        expect(events.find((event) => event.name === '孫の顔を見る')).toMatchObject({
            type: 'goal',
            age: 70,
            category: '家族',
            status: '未着手',
        });
        expect(events.find((event) => event.name === '婚活')).toMatchObject({
            type: 'event',
            age: 27,
            category: '家族',
        });
        expect(events.find((event) => event.name === '結婚')?.age).toBe(29);
        expect(events.find((event) => event.name === '子どもの誕生')?.age).toBe(33);
        expect(
            events
                .filter((event) => event.name.startsWith('子どもの') && event.name !== '子どもの誕生')
                .map(({name, age, category, type}) => ({name, age, category, type}))
        ).toEqual([
            {name: '子どもの幼稚園・保育園入園', age: 36, category: '学業', type: 'event'},
            {name: '子どもの幼稚園・保育園卒園', age: 39, category: '学業', type: 'event'},
            {name: '子どもの小学校卒業', age: 45, category: '学業', type: 'event'},
            {name: '子どもの中学校卒業', age: 48, category: '学業', type: 'event'},
            {name: '子どもの高校卒業', age: 51, category: '学業', type: 'event'},
            {name: '子どもの大学卒業', age: 55, category: '学業', type: 'event'},
        ]);
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

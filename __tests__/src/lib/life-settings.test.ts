import {loadLifeSettings, parseLifeSettingsCsv} from '../../../src/lib/life-settings';

describe('parseLifeSettingsCsv', () => {
    it('リポジトリ内の設定CSVから現在年齢と性別を読み込む', async () => {
        await expect(loadLifeSettings()).resolves.toEqual({currentAge: 29, gender: '男性'});
    });

    it.each([0, 29, 100])('有効な年齢 %i を解析する', (age) => {
        expect(parseLifeSettingsCsv(`current_age,gender\n${age},男性\n`))
            .toEqual({currentAge: age, gender: '男性'});
    });

    it('不正なヘッダーを拒否する', () => {
        expect(() => parseLifeSettingsCsv('age,gender\n29,男性\n'))
            .toThrow('設定CSVのヘッダーが不正です');
    });

    it('欠落または複数の設定を拒否する', () => {
        expect(() => parseLifeSettingsCsv('current_age,gender\n'))
            .toThrow('設定CSVには現在年齢と性別を1件だけ指定してください');
        expect(() => parseLifeSettingsCsv('current_age,gender\n29,男性\n30,女性\n'))
            .toThrow('設定CSVには現在年齢と性別を1件だけ指定してください');
    });

    it.each(['-1', '1.5', 'abc', '101'])('不正な年齢 %s を拒否する', (age) => {
        expect(() => parseLifeSettingsCsv(`current_age,gender\n${age},男性\n`))
            .toThrow();
    });

    it.each(['男性', '女性', 'その他', '未設定'])('性別 %s を解析する', (gender) => {
        expect(parseLifeSettingsCsv(`current_age,gender\n29,${gender}\n`).gender).toBe(gender);
    });

    it('性別欄が空の場合は未設定として解析する', () => {
        expect(parseLifeSettingsCsv('current_age,gender\n29,\n').gender).toBe('未設定');
    });

    it('許可されていない性別を拒否する', () => {
        expect(() => parseLifeSettingsCsv('current_age,gender\n29,不明\n'))
            .toThrow('性別が不正です');
    });

    it('BOM付きCSVを拒否する', () => {
        expect(() => parseLifeSettingsCsv('\uFEFFcurrent_age,gender\n29,男性\n'))
            .toThrow('設定CSVにBOMを含めることはできません');
    });
});

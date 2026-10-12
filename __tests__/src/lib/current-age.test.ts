import {loadCurrentAge, parseCurrentAgeCsv} from '../../../src/lib/current-age';

describe('parseCurrentAgeCsv', () => {
    it('リポジトリ内の設定CSVから29歳を読み込む', async () => {
        await expect(loadCurrentAge()).resolves.toBe(29);
    });

    it.each([0, 29, 100])('有効な年齢 %i を解析する', (age) => {
        expect(parseCurrentAgeCsv(`current_age\n${age}\n`)).toBe(age);
    });

    it('不正なヘッダーを拒否する', () => {
        expect(() => parseCurrentAgeCsv('age\n29\n'))
            .toThrow('設定CSVのヘッダーが不正です');
    });

    it('欠落または複数の年齢を拒否する', () => {
        expect(() => parseCurrentAgeCsv('current_age\n'))
            .toThrow('設定CSVには現在年齢を1件だけ指定してください');
        expect(() => parseCurrentAgeCsv('current_age\n29\n30\n'))
            .toThrow('設定CSVには現在年齢を1件だけ指定してください');
    });

    it.each(['-1', '1.5', 'abc', '101'])('不正な年齢 %s を拒否する', (age) => {
        expect(() => parseCurrentAgeCsv(`current_age\n${age}\n`))
            .toThrow();
    });

    it('BOM付きCSVを拒否する', () => {
        expect(() => parseCurrentAgeCsv('\uFEFFcurrent_age\n29\n'))
            .toThrow('設定CSVにBOMを含めることはできません');
    });
});

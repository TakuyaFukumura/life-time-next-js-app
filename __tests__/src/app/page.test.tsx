import {fireEvent, render, screen, within} from '@testing-library/react';
import Home from '../../../src/app/page';

describe('Home', () => {
    it('年齢・性別の入力を表示し、削除対象の文章を表示しない', async () => {
        render(await Home());

        expect(screen.queryByText(
            '人生の出来事や目標を年齢軸で確認できます。年齢や性別を変えると、タイムラインと進行度の表示がその場で切り替わります。'
        )).not.toBeInTheDocument();
        const ageAndGender = screen.getByRole('group', {name: '年齢と性別の設定'});
        expect(within(ageAndGender).getByRole('spinbutton', {name: '現在の年齢'})).toHaveValue(29);
        expect(within(ageAndGender).getByRole('combobox', {name: '性別:'})).toHaveValue('男性');
        expect(within(ageAndGender).queryByText(
            '年齢と性別の変更はこの画面だけに反映され、保存されません。ページを再表示すると設定CSVの値に戻ります。'
        )).not.toBeInTheDocument();
        expect(screen.queryByText('表示条件')).not.toBeInTheDocument();
    });

    it('設定CSVの性別を選択欄の初期値として表示する', async () => {
        render(await Home());

        expect(screen.getByRole('combobox', {name: '性別:'})).toHaveValue('男性');
    });

    it('性別を画面上で変更すると寿命目安と進行度が更新される', async () => {
        render(await Home());
        const genderSelect = screen.getByRole('combobox', {name: '性別:'});

        fireEvent.change(genderSelect, {target: {value: '女性'}});

        expect(genderSelect).toHaveValue('女性');
        expect(screen.getByText(/平均寿命（女性・日本・2025年）/)).toHaveTextContent('87.33歳');
        expect(screen.getByText(/健康寿命（女性・日本・2022年）/)).toHaveTextContent('75.45歳');
        const progress = screen.getByRole('group', {name: '人生の進行度'});
        expect(within(progress).getByText('33.2%')).toBeInTheDocument();
        expect(within(progress).getByText('38.4%')).toBeInTheDocument();
    });

    it('画面上で変更した性別はページ再表示で設定CSVの値に戻る', async () => {
        const {unmount} = render(await Home());
        fireEvent.change(screen.getByRole('combobox', {name: '性別:'}), {
            target: {value: '女性'},
        });

        unmount();
        render(await Home());

        expect(screen.getByRole('combobox', {name: '性別:'})).toHaveValue('男性');
    });

    it('人生の進行度グラフをデータ一覧の直前に表示する', async () => {
        render(await Home());

        const progressHeading = screen.getByRole('heading', {name: '人生の進行度'});
        const eventListHeading = screen.getByRole('heading', {name: 'データ一覧'});

        expect(progressHeading.compareDocumentPosition(eventListHeading) & Node.DOCUMENT_POSITION_FOLLOWING)
            .toBeTruthy();
    });
});

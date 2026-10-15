import {render, screen} from '@testing-library/react';
import GuidePage from '../../../src/app/guide/page';

describe('GuidePage', () => {
    it('タイムラインの詳細な設定方法と統計値の注意点を説明する', () => {
        render(<GuidePage/>);

        expect(screen.getByText(
            /変更はこの画面だけに反映され、保存されません。再読み込みすると設定CSVの値に戻ります。/,
        )).toBeInTheDocument();
        expect(screen.getByText(
            /平均寿命・健康寿命は日本の統計上の目安であり、個人の寿命や健康状態を予測するものではありません。/,
        )).toBeInTheDocument();
        expect(screen.getByText(
            /年齢は0歳から100歳まで設定できます。/,
        )).toBeInTheDocument();
        expect(screen.getByText(
            /平均寿命・健康寿命の統計値を100%の目安とした進行度/,
        )).toBeInTheDocument();
    });
});

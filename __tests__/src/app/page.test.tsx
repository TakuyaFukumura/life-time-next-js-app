import {render, screen} from '@testing-library/react';
import Home from '../../../src/app/page';

describe('Home', () => {
    it('設定CSVの性別をプロフィールとして表示する', async () => {
        render(await Home());

        expect(screen.getByText('性別:')).toBeInTheDocument();
        expect(screen.getByText('男性')).toBeInTheDocument();
    });

    it('人生の進行度グラフをデータ一覧の直前に表示する', async () => {
        render(await Home());

        const progressHeading = screen.getByRole('heading', {name: '人生の進行度'});
        const eventListHeading = screen.getByRole('heading', {name: 'データ一覧'});

        expect(progressHeading.compareDocumentPosition(eventListHeading) & Node.DOCUMENT_POSITION_FOLLOWING)
            .toBeTruthy();
    });
});

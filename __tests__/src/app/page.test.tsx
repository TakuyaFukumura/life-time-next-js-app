import {render, screen} from '@testing-library/react';
import Home from '../../../src/app/page';

describe('Home', () => {
    it('設定CSVの性別をプロフィールとして表示する', async () => {
        render(await Home());

        expect(screen.getByText('性別:')).toBeInTheDocument();
        expect(screen.getByText('男性')).toBeInTheDocument();
    });
});

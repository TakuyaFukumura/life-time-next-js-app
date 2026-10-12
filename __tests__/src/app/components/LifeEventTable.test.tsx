import {render, screen, within} from '@testing-library/react';
import LifeEventTable from '../../../../src/app/components/LifeEventTable';
import type {LifeEvent} from '../../../../src/lib/life-events';

const events: LifeEvent[] = [
    {
        type: 'goal',
        name: '資格取得',
        age: 30,
        category: '仕事',
        description: '学習を続ける',
        status: '進行中',
    },
    {
        type: 'event',
        name: '誕生',
        age: 0,
        category: '家族',
        description: '',
    },
];

describe('LifeEventTable', () => {
    it('全項目を年齢順の表として表示する', () => {
        render(<LifeEventTable events={events}/>);

        const table = screen.getByRole('table', {name: '年齢順に並んだ人生のイベントと目標'});
        expect(within(table).getAllByRole('columnheader').map((header) => header.textContent))
            .toEqual(['種別', '名称', '年齢', 'カテゴリ', '説明', '状態']);

        const rows = within(table).getAllByRole('row');
        expect(rows[1]).toHaveTextContent('誕生');
        expect(rows[1]).toHaveTextContent('0歳');
        expect(rows[1]).toHaveTextContent('家族');
        expect(rows[1]).toHaveTextContent('—');
        expect(rows[2]).toHaveTextContent('資格取得');
        expect(rows[2]).toHaveTextContent('30歳');
        expect(rows[2]).toHaveTextContent('学習を続ける');
        expect(rows[2]).toHaveTextContent('進行中');
    });

    it('データがない場合は空の状態を表示する', () => {
        render(<LifeEventTable events={[]}/>);

        expect(screen.getByRole('heading', {name: '登録データ'})).toBeInTheDocument();
        expect(screen.getByText('0件')).toBeInTheDocument();
        expect(screen.getByText('登録データはありません。')).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
});

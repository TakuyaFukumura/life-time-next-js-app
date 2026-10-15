import {fireEvent, render, screen, within} from '@testing-library/react';
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

        const table = screen.getByRole('table', {name: '人生のイベントと目標一覧'});
        expect(within(table).getAllByRole('columnheader').map(
            (header) => header.querySelector('button span')?.textContent,
        ))
            .toEqual(['種別', '名称', '年齢', 'カテゴリ', '説明', '状態']);
        expect(within(table).getByRole('button', {name: '年齢を昇順で並べ替え'}).closest('th'))
            .toHaveAttribute('aria-sort', 'ascending');

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

    it('列ヘッダーで昇順・降順を切り替え、別の列は昇順で並べ替える', () => {
        const unsortedEvents: LifeEvent[] = [
            {
                type: 'goal',
                name: 'Beta',
                age: 20,
                category: '仕事',
                description: 'Zulu description',
                status: '進行中',
            },
            {
                type: 'event',
                name: 'Alpha',
                age: 10,
                category: '家族',
                description: 'Alpha description',
            },
        ];
        render(<LifeEventTable events={unsortedEvents}/>);

        const table = screen.getByRole('table');
        const rowNames = () => within(table).getAllByRole('row').slice(1)
            .map((row) => within(row).getAllByRole('cell')[1].textContent);

        expect(rowNames()).toEqual(['Alpha', 'Beta']);

        fireEvent.click(screen.getByRole('button', {name: '名称で並べ替え'}));
        expect(rowNames()).toEqual(['Alpha', 'Beta']);
        expect(within(table).getByRole('button', {name: '名称を昇順で並べ替え'}).closest('th'))
            .toHaveAttribute('aria-sort', 'ascending');

        fireEvent.click(screen.getByRole('button', {name: '名称を昇順で並べ替え'}));
        expect(rowNames()).toEqual(['Beta', 'Alpha']);
        expect(within(table).getByRole('button', {name: '名称を降順で並べ替え'}).closest('th'))
            .toHaveAttribute('aria-sort', 'descending');

        fireEvent.click(screen.getByRole('button', {name: '年齢で並べ替え'}));
        expect(rowNames()).toEqual(['Alpha', 'Beta']);
        expect(within(table).getByRole('button', {name: '年齢を昇順で並べ替え'}).closest('th'))
            .toHaveAttribute('aria-sort', 'ascending');
    });

    it('データがない場合は空の状態を表示する', () => {
        render(<LifeEventTable events={[]}/>);

        expect(screen.getByRole('heading', {name: 'データ一覧'})).toBeInTheDocument();
        expect(screen.getByText('0件')).toBeInTheDocument();
        expect(screen.getByText('データはありません。')).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('10件ずつページ送りでき、表示範囲とボタン状態を更新する', () => {
        const manyEvents: LifeEvent[] = Array.from({length: 23}, (_, index) => ({
            type: 'event',
            name: `出来事${index + 1}`,
            age: index,
            category: '家族',
            description: `説明${index + 1}`,
        }));
        render(<LifeEventTable events={manyEvents}/>);

        const table = screen.getByRole('table');
        const previousButton = screen.getByRole('button', {name: '前へ'});
        const nextButton = screen.getByRole('button', {name: '次へ'});
        expect(within(table).getAllByRole('row')).toHaveLength(11);
        expect(screen.getByText('1〜10件を表示 / 23件')).toBeInTheDocument();
        expect(previousButton).toBeDisabled();

        fireEvent.click(nextButton);
        expect(within(table).getAllByRole('row')).toHaveLength(11);
        expect(screen.getByText('11〜20件を表示 / 23件')).toBeInTheDocument();
        expect(within(table).getByText('出来事11')).toBeInTheDocument();

        fireEvent.click(nextButton);
        expect(within(table).getAllByRole('row')).toHaveLength(4);
        expect(screen.getByText('21〜23件を表示 / 23件')).toBeInTheDocument();
        expect(nextButton).toBeDisabled();

        fireEvent.click(previousButton);
        expect(screen.getByText('11〜20件を表示 / 23件')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: '名称で並べ替え'}));
        expect(screen.getByText('1〜10件を表示 / 23件')).toBeInTheDocument();
    });

    it('種別・カテゴリ・目標状態の条件を組み合わせて絞り込む', () => {
        render(<LifeEventTable events={events}/>);

        fireEvent.change(screen.getByRole('combobox', {name: '種別'}), {
            target: {value: 'goal'},
        });
        fireEvent.change(screen.getByRole('combobox', {name: 'カテゴリ'}), {
            target: {value: '仕事'},
        });
        fireEvent.change(screen.getByRole('combobox', {name: '目標状態'}), {
            target: {value: '進行中'},
        });

        expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(1);
        expect(screen.getByText('1件 / 2件')).toBeInTheDocument();
        const table = screen.getByRole('table');
        expect(within(table).getByText('資格取得')).toBeInTheDocument();
        expect(within(table).queryByText('誕生')).not.toBeInTheDocument();
        expect(screen.getByRole('list', {name: '適用中の条件'})).toHaveTextContent(
            '種別: 目標カテゴリ: 仕事目標状態: 進行中',
        );

        fireEvent.change(screen.getByRole('combobox', {name: '目標状態'}), {
            target: {value: '達成'},
        });
        expect(screen.getByText('条件に一致するデータがありません。')).toBeInTheDocument();
        expect(screen.getByText('0〜0件を表示 / 0件')).toBeInTheDocument();
        expect(screen.getByRole('list', {name: '適用中の条件'})).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: '条件をクリア'}));
        expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(2);
        expect(screen.getByRole('combobox', {name: '種別'})).toHaveValue('all');
        expect(screen.getByRole('combobox', {name: 'カテゴリ'})).toHaveValue('all');
        expect(screen.getByRole('combobox', {name: '目標状態'})).toHaveValue('all');
        expect(screen.queryByRole('list', {name: '適用中の条件'})).not.toBeInTheDocument();
    });

    it('学業カテゴリでデータを絞り込む', () => {
        const academicEvent: LifeEvent = {
            type: 'event',
            name: '大学卒業',
            age: 22,
            category: '学業',
            description: '',
        };
        render(<LifeEventTable events={[...events, academicEvent]}/>);

        fireEvent.change(screen.getByRole('combobox', {name: 'カテゴリ'}), {
            target: {value: '学業'},
        });

        const table = screen.getByRole('table');
        expect(table).toHaveTextContent('大学卒業');
        expect(screen.getByText('1件 / 3件')).toBeInTheDocument();
        expect(within(table).queryByText('資格取得')).not.toBeInTheDocument();
        expect(within(table).queryByText('誕生')).not.toBeInTheDocument();
    });

    it('名称または説明のキーワードで検索し、条件変更後は1ページ目へ戻る', () => {
        const manyEvents: LifeEvent[] = Array.from({length: 23}, (_, index) => ({
            type: 'event',
            name: `出来事${index + 1}`,
            age: index,
            category: '家族',
            description: `説明${index + 1}`,
        }));
        render(<LifeEventTable events={manyEvents}/>);

        fireEvent.click(screen.getByRole('button', {name: '次へ'}));
        expect(screen.getByText('11〜20件を表示 / 23件')).toBeInTheDocument();

        fireEvent.change(screen.getByRole('searchbox', {name: 'キーワード'}), {
            target: {value: '出来事1'},
        });
        expect(screen.getByText('1〜10件を表示 / 11件')).toBeInTheDocument();
        expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(10);
        expect(screen.getByRole('list', {name: '適用中の条件'})).toHaveTextContent(
            'キーワード: 出来事1',
        );

        fireEvent.change(screen.getByRole('searchbox', {name: 'キーワード'}), {
            target: {value: '説明20'},
        });
        expect(screen.getByText('1〜1件を表示 / 1件')).toBeInTheDocument();
        expect(within(screen.getByRole('table')).getByText('出来事20')).toBeInTheDocument();
    });

    it('モバイルカードに全項目を表示し、並べ替えられる', () => {
        const sortableEvents: LifeEvent[] = [
            {
                type: 'goal',
                name: 'Zeta',
                age: 10,
                category: '仕事',
                description: 'Career goal',
                status: '進行中',
            },
            {
                type: 'event',
                name: 'Alpha',
                age: 20,
                category: '家族',
                description: 'Family event',
            },
        ];
        render(<LifeEventTable events={sortableEvents}/>);

        const mobileList = screen.getByRole('list', {name: 'モバイルのデータ一覧'});
        const cardNames = () => within(mobileList).getAllByRole('heading', {level: 3})
            .map((heading) => heading.textContent);

        expect(cardNames()).toEqual(['Zeta', 'Alpha']);
        expect(within(mobileList).getByText('Family event')).toBeInTheDocument();
        expect(within(mobileList).getByText('20歳')).toBeInTheDocument();
        expect(within(mobileList).getByText('Career goal')).toBeInTheDocument();
        expect(within(mobileList).getByText('進行中')).toBeInTheDocument();

        fireEvent.change(screen.getByRole('combobox', {name: 'モバイルの並べ替え項目'}), {
            target: {value: 'name'},
        });
        expect(cardNames()).toEqual(['Alpha', 'Zeta']);

        fireEvent.click(screen.getByRole('button', {name: '降順にする'}));
        expect(cardNames()).toEqual(['Zeta', 'Alpha']);
        expect(screen.getByRole('button', {name: '昇順にする'})).toHaveTextContent('降順');
    });
});

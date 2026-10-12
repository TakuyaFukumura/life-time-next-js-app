import {fireEvent, render, screen} from '@testing-library/react';
import Timeline from '../../../../src/app/components/Timeline';
import type {LifeEvent} from '../../../../src/lib/life-events';

const events: LifeEvent[] = [
    {
        type: 'event',
        name: '誕生',
        age: 0,
        category: '家族',
        description: 'サンプルの説明',
    },
    {
        type: 'goal',
        name: '資格取得',
        age: 30,
        category: '仕事',
        description: '学習を続ける',
        status: '進行中',
    },
];

describe('Timeline', () => {
    it('初期状態ではカードを表示せず、年齢目盛りとマーカーを表示する', () => {
        render(<Timeline events={events}/>);

        expect(screen.getByText('0歳')).toBeInTheDocument();
        expect(screen.getByText('100歳')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /資格取得/})).toBeInTheDocument();
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('マーカーにカーソルを合わせるとカードを浮かび上がらせる', () => {
        render(<Timeline events={events}/>);

        fireEvent.mouseEnter(screen.getByRole('button', {name: /資格取得/}));

        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveTextContent('資格取得');
        expect(tooltip).toHaveTextContent('30歳・仕事');
        expect(tooltip).toHaveTextContent('進行中');
    });

    it('キーボードでマーカーにフォーカスするとカードを表示する', () => {
        render(<Timeline events={events}/>);

        const marker = screen.getByRole('button', {name: /誕生/});
        fireEvent.focus(marker);
        expect(screen.getByRole('tooltip')).toHaveTextContent('誕生');

        fireEvent.blur(marker, {relatedTarget: document.body});
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('項目を選択すると説明を表示し、再度選択すると閉じる', () => {
        render(<Timeline events={events}/>);

        fireEvent.click(screen.getByRole('button', {name: /誕生/}));
        expect(screen.getByText('サンプルの説明')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: /誕生/}));
        expect(screen.queryByText('サンプルの説明')).not.toBeInTheDocument();
    });

    it('同じ年齢の項目を同じ横位置で縦にずらして表示する', () => {
        render(
            <Timeline
                events={[
                    events[0],
                    {...events[1], age: 0},
                ]}
            />
        );

        const markers = screen.getAllByRole('button');
        expect(markers[0].parentElement?.style.left).toBe(markers[1].parentElement?.style.left);
        expect(markers[0].parentElement?.style.top).not.toBe(markers[1].parentElement?.style.top);
    });

    it('年齢が近いマーカーが重ならないよう縦にずらす', () => {
        render(
            <Timeline
                events={[
                    events[0],
                    {...events[1], age: 1},
                ]}
            />
        );

        const markers = screen.getAllByRole('button');
        expect(markers[0].parentElement?.style.top).not.toBe(markers[1].parentElement?.style.top);
    });

    it('項目がない場合は空の状態を表示する', () => {
        render(<Timeline events={[]}/>);

        expect(screen.getByText('表示できる項目がありません。')).toBeInTheDocument();
    });
});

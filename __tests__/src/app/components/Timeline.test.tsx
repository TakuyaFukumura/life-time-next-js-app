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
    it('0歳から100歳までの年齢目盛りと項目を表示する', () => {
        render(<Timeline events={events}/>);

        expect(screen.getByText('0歳')).toBeInTheDocument();
        expect(screen.getByText('100歳')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /資格取得/})).toHaveTextContent('30歳・仕事');
        expect(screen.getByRole('button', {name: /資格取得/})).toHaveTextContent('進行中');
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

        const buttons = screen.getAllByRole('button');
        expect(buttons[0].style.left).toBe(buttons[1].style.left);
        expect(buttons[0].style.top).not.toBe(buttons[1].style.top);
    });

    it('年齢が近い項目のカードを別の行に配置する', () => {
        render(
            <Timeline
                events={[
                    events[0],
                    {...events[1], age: 15},
                ]}
            />
        );

        const buttons = screen.getAllByRole('button');
        expect(buttons[0].style.top).not.toBe(buttons[1].style.top);
    });

    it('項目がない場合は空の状態を表示する', () => {
        render(<Timeline events={[]}/>);

        expect(screen.getByText('表示できる項目がありません。')).toBeInTheDocument();
    });
});

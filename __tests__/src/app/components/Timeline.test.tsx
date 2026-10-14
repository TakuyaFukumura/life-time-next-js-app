import {fireEvent, render, screen, within} from '@testing-library/react';
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
        render(<Timeline events={events} currentAge={29} gender="未設定"/>);

        expect(screen.getByText('0歳')).toBeInTheDocument();
        expect(screen.getByText('100歳')).toBeInTheDocument();
        expect(screen.getByText('現在 29歳')).toBeInTheDocument();
        expect(screen.getByRole('spinbutton', {name: '現在の年齢'})).toHaveValue(29);
        expect(screen.getByRole('button', {name: /資格取得/})).toBeInTheDocument();
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('現在の年齢を編集すると現在位置とイベントの経過状態が更新される', () => {
        render(<Timeline events={events} currentAge={29} gender="未設定"/>);

        fireEvent.change(screen.getByRole('spinbutton', {name: '現在の年齢'}), {
            target: {value: '30'},
        });

        expect(screen.getByText('現在 30歳')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /資格取得.*経過済み/})).toBeInTheDocument();
    });

    it('平均寿命と健康寿命を終点にした進行度を表示し、100%超も示す', () => {
        render(<Timeline events={events} currentAge={29} gender="男性"/>);

        const progress = screen.getByRole('group', {name: '人生の進行度'});
        expect(within(progress).getByText('平均寿命まで')).toBeInTheDocument();
        expect(within(progress).getByText('35.6%')).toBeInTheDocument();
        expect(within(progress).getByText('健康寿命まで')).toBeInTheDocument();
        expect(within(progress).getByText('40.0%')).toBeInTheDocument();
        expect(screen.getByRole('meter', {name: '平均寿命まで'})).toHaveAttribute('aria-valuenow', '35.6');
        expect(screen.getByRole('meter', {name: '健康寿命まで'})).toHaveAttribute('aria-valuenow', '40');
        expect(
            screen.getByRole('meter', {name: '健康寿命まで'})
                .compareDocumentPosition(screen.getByRole('meter', {name: '平均寿命まで'}))
                & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();

        fireEvent.change(screen.getByRole('spinbutton', {name: '現在の年齢'}), {
            target: {value: '100'},
        });

        expect(within(progress).getByText('122.9%')).toBeInTheDocument();
        expect(within(progress).getByText('137.8%')).toBeInTheDocument();
        expect(screen.getByRole('meter', {name: '平均寿命まで'})).toHaveAttribute('aria-valuenow', '122.9');
        expect(screen.getByRole('meter', {name: '健康寿命まで'})).toHaveAttribute('aria-valuenow', '137.8');
    });

    it('無効な年齢を確定すると最後の有効な年齢に戻す', () => {
        render(<Timeline events={events} currentAge={29} gender="未設定"/>);
        const ageInput = screen.getByRole('spinbutton', {name: '現在の年齢'});

        fireEvent.change(ageInput, {target: {value: '101'}});
        expect(screen.getByText('現在 29歳')).toBeInTheDocument();

        fireEvent.blur(ageInput);
        expect(ageInput).toHaveValue(29);
    });

    it('コンポーネントを再表示すると初期年齢に戻る', () => {
        const {unmount} = render(<Timeline events={events} currentAge={29} gender="未設定"/>);
        fireEvent.change(screen.getByRole('spinbutton', {name: '現在の年齢'}), {
            target: {value: '35'},
        });

        unmount();
        render(<Timeline events={events} currentAge={29} gender="未設定"/>);

        expect(screen.getByText('現在 29歳')).toBeInTheDocument();
    });

    it('現在年齢までのイベントと目標は塗りつぶし、それ以降は枠線だけで表示する', () => {
        render(
            <Timeline
                events={[
                    events[0],
                    {...events[1], name: '現在年齢の目標', age: 29},
                    events[1],
                ]}
                currentAge={29}
                gender="未設定"
            />
        );

        const elapsedEvent = screen.getByRole('button', {name: /誕生.*経過済み/});
        expect(elapsedEvent.querySelector('[aria-hidden="true"]'))
            .toHaveClass('bg-gray-700', 'rounded-full');

        const elapsedGoal = screen.getByRole('button', {name: /現在年齢の目標.*経過済み/});
        expect(elapsedGoal.querySelector('[aria-hidden="true"]'))
            .toHaveClass('bg-gray-700', 'rotate-45');

        const futureGoal = screen.getByRole('button', {name: /資格取得.*これから/});
        expect(futureGoal.querySelector('[aria-hidden="true"]'))
            .toHaveClass('bg-white', 'rotate-45');
    });

    it('マーカーにカーソルを合わせるとカードを浮かび上がらせる', () => {
        render(<Timeline events={events} currentAge={29} gender="未設定"/>);

        fireEvent.mouseEnter(screen.getByRole('button', {name: /資格取得/}));

        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveTextContent('資格取得');
        expect(tooltip).toHaveTextContent('30歳・仕事');
        expect(tooltip).toHaveTextContent('進行中');
    });

    it('キーボードでマーカーにフォーカスするとカードを表示する', () => {
        render(<Timeline events={events} currentAge={29} gender="未設定"/>);

        const marker = screen.getByRole('button', {name: /誕生/});
        fireEvent.focus(marker);
        expect(screen.getByRole('tooltip')).toHaveTextContent('誕生');

        fireEvent.blur(marker, {relatedTarget: document.body});
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('項目を選択すると説明を表示し、再度選択すると閉じる', () => {
        render(<Timeline events={events} currentAge={29} gender="未設定"/>);

        fireEvent.click(screen.getByRole('button', {name: /誕生/}));
        expect(screen.getByText('サンプルの説明')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: /誕生/}));
        expect(screen.queryByText('サンプルの説明')).not.toBeInTheDocument();
    });

    it('同じ年齢の項目を同じ横位置で縦にずらして表示する', () => {
        render(
            <Timeline
                currentAge={29}
                gender="未設定"
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
                currentAge={29}
                gender="未設定"
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
        render(<Timeline events={[]} currentAge={29} gender="未設定"/>);

        expect(screen.getByText('表示できる項目がありません。')).toBeInTheDocument();
    });

    it('健康寿命の凡例を平均寿命より左側に表示する', () => {
        render(<Timeline events={events} currentAge={29} gender="男性"/>);

        const healthyLifeLegend = screen.getByText(/健康寿命（男性・日本・2022年）/);
        const averageLifeLegend = screen.getByText(/平均寿命（男性・日本・2025年）/);

        expect(
            healthyLifeLegend.compareDocumentPosition(averageLifeLegend)
                & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
    });

    it.each([
        ['男性', '男性', '81.35'],
        ['女性', '女性', '87.33'],
        ['その他', '男女平均', '84.34'],
        ['未設定', '男女平均', '84.34'],
    ] as const)('%sに対応する平均寿命を表示する', (gender, group, age) => {
        render(<Timeline events={events} currentAge={29} gender={gender}/>);

        const legend = screen.getByText(new RegExp(`平均寿命（${group}・日本・2025年）`));
        expect(legend).toHaveTextContent(`${age}歳`);
    });

    it.each([
        ['男性', '男性', '72.57'],
        ['女性', '女性', '75.45'],
        ['その他', '男女平均', '74.01'],
        ['未設定', '男女平均', '74.01'],
    ] as const)('%sに対応する健康寿命を表示する', (gender, group, age) => {
        render(<Timeline events={events} currentAge={29} gender={gender}/>);

        const legend = screen.getByText(new RegExp(`健康寿命（${group}・日本・2022年）`));
        expect(legend).toHaveTextContent(`${age}歳`);
    });
});

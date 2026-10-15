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

    it('年齢位置の移動ボタンで横スクロールし、ページ位置は変更しない', () => {
        render(<Timeline events={events} currentAge={29} gender="未設定"/>);
        const timeline = screen.getByRole('region', {
            name: '年齢0歳から100歳までのタイムライン。横スクロールできます',
        });
        const scrollTo = jest.fn();
        Object.defineProperty(timeline, 'clientWidth', {configurable: true, value: 300});
        Object.defineProperty(timeline, 'scrollWidth', {configurable: true, value: 1432});
        Object.defineProperty(timeline, 'scrollTo', {configurable: true, value: scrollTo});

        fireEvent.click(screen.getByRole('button', {name: '0歳へ'}));
        expect(scrollTo).toHaveBeenLastCalledWith({left: 0, behavior: 'smooth'});

        fireEvent.click(screen.getByRole('button', {name: '現在年齢へ'}));
        expect(scrollTo.mock.calls.at(-1)?.[0].left).toBeCloseTo(266.08);
        expect(scrollTo.mock.calls.at(-1)?.[0].behavior).toBe('smooth');

        fireEvent.click(screen.getByRole('button', {name: '100歳へ'}));
        expect(scrollTo).toHaveBeenLastCalledWith({left: 1132, behavior: 'smooth'});
    });

    it('現在年齢を変更すると移動ボタンの移動先も更新し、動きを減らす設定を尊重する', () => {
        const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            value: jest.fn().mockReturnValue({matches: true}),
        });

        try {
            render(<Timeline events={events} currentAge={29} gender="未設定"/>);
            const timeline = screen.getByRole('region', {
                name: '年齢0歳から100歳までのタイムライン。横スクロールできます',
            });
            const scrollTo = jest.fn();
            Object.defineProperty(timeline, 'clientWidth', {configurable: true, value: 300});
            Object.defineProperty(timeline, 'scrollWidth', {configurable: true, value: 1432});
            Object.defineProperty(timeline, 'scrollTo', {configurable: true, value: scrollTo});

            fireEvent.change(screen.getByRole('spinbutton', {name: '現在の年齢'}), {
                target: {value: '40'},
            });
            fireEvent.click(screen.getByRole('button', {name: '現在年齢へ'}));

            expect(scrollTo.mock.calls[0][0].left).toBeCloseTo(414.8);
            expect(scrollTo.mock.calls[0][0].behavior).toBe('auto');
        } finally {
            if (originalDescriptor) {
                Object.defineProperty(window, 'matchMedia', originalDescriptor);
            } else {
                Reflect.deleteProperty(window, 'matchMedia');
            }
        }
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

        const marker = screen.getByRole('button', {name: /誕生/});
        fireEvent.click(marker);
        expect(screen.getByText('サンプルの説明')).toBeInTheDocument();
        expect(screen.getByRole('heading', {name: '誕生'})).toBeInTheDocument();
        expect(screen.getByText('年齢:')).toBeInTheDocument();
        expect(screen.getByText('種別:')).toBeInTheDocument();
        expect(screen.getByText('カテゴリ:')).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('選択中: 誕生、0歳');

        fireEvent.click(screen.getByRole('button', {name: '閉じる'}));
        expect(screen.queryByText('サンプルの説明')).not.toBeInTheDocument();
        expect(document.activeElement).toBe(marker);

        fireEvent.click(marker);
        fireEvent.click(marker);
        expect(screen.queryByText('サンプルの説明')).not.toBeInTheDocument();
    });

    it('別の項目を選ぶと詳細を切り替え、目標の状態を表示する', () => {
        render(<Timeline events={events} currentAge={29} gender="未設定"/>);

        fireEvent.click(screen.getByRole('button', {name: /誕生/}));
        fireEvent.click(screen.getByRole('button', {name: /資格取得/}));

        const details = screen.getByRole('region', {name: '資格取得'});
        expect(within(details).getByText('30歳')).toBeInTheDocument();
        expect(within(details).getByText('目標')).toBeInTheDocument();
        expect(within(details).getByText('仕事')).toBeInTheDocument();
        expect(within(details).getByText('状態:')).toBeInTheDocument();
        expect(within(details).getByText('進行中')).toBeInTheDocument();
        expect(screen.queryByText('サンプルの説明')).not.toBeInTheDocument();
    });

    it('説明がない項目は説明がないことを明示する', () => {
        render(
            <Timeline
                events={[{...events[0], description: ''}]}
                currentAge={29}
                gender="未設定"
            />,
        );

        fireEvent.click(screen.getByRole('button', {name: /誕生/}));

        expect(screen.getByText('説明はありません。')).toBeInTheDocument();
    });

    it('密集マーカーを隠さない位置にプレビューを表示する', () => {
        render(
            <Timeline
                events={[
                    {...events[0], age: 0},
                    {...events[1], name: '隣接する目標', age: 1},
                ]}
                currentAge={29}
                gender="未設定"
            />,
        );

        fireEvent.mouseEnter(screen.getByRole('button', {name: /誕生/}));

        const tooltip = screen.getByRole('tooltip');
        const markerGroups = screen.getAllByRole('button', {name: /^(イベント|目標):/})
            .map((marker) => marker.parentElement);
        const tooltipLeft = Number.parseFloat(markerGroups[0]?.style.left ?? '0') +
            Number.parseFloat(tooltip.style.left);
        const tooltipTop = Number.parseFloat(markerGroups[0]?.style.top ?? '0') +
            Number.parseFloat(tooltip.style.top);
        const tooltipRight = tooltipLeft + Number.parseFloat(tooltip.style.width);
        const tooltipBottom = tooltipTop + Number.parseFloat(tooltip.style.minHeight);

        for (const markerGroup of markerGroups.slice(1)) {
            const markerX = Number.parseFloat(markerGroup?.style.left ?? '0');
            const markerY = Number.parseFloat(markerGroup?.style.top ?? '0');
            const overlaps = tooltipLeft < markerX + 16 &&
                tooltipRight > markerX - 16 &&
                tooltipTop < markerY + 16 &&
                tooltipBottom > markerY - 16;
            expect(overlaps).toBe(false);
        }
    });

    it('100歳のマーカーのプレビューをタイムライン幅内に収める', () => {
        render(
            <Timeline
                events={[{...events[0], name: '100歳の項目', age: 100}]}
                currentAge={29}
                gender="未設定"
            />,
        );

        fireEvent.mouseEnter(screen.getByRole('button', {name: /100歳の項目/}));

        const marker = screen.getByRole('button', {name: /100歳の項目/}).parentElement;
        const tooltip = screen.getByRole('tooltip');
        const markerX = Number.parseFloat(marker?.style.left ?? '0');
        const tooltipLeft = markerX + Number.parseFloat(tooltip.style.left);

        expect(tooltipLeft).toBeGreaterThanOrEqual(0);
        expect(tooltipLeft + 200).toBeLessThanOrEqual(1400);
    });

    it('0歳と100歳のマーカーを個別に選択できる', () => {
        render(
            <Timeline
                events={[
                    {...events[0], name: '0歳の項目'},
                    {...events[1], name: '100歳の項目', age: 100},
                ]}
                currentAge={29}
                gender="未設定"
            />,
        );

        fireEvent.click(screen.getByRole('button', {name: /^イベント: 0歳の項目/}));
        expect(screen.getByRole('heading', {name: '0歳の項目'})).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: /100歳の項目/}));
        expect(screen.getByRole('heading', {name: '100歳の項目'})).toBeInTheDocument();
    });

    it('長い日本語名でもプレビューをタイムライン内に収める', () => {
        const name = '人生の節目に向けて準備し続けた長い名称の目標を達成する'.repeat(3);
        render(
            <Timeline
                events={[{...events[1], name, age: 100}]}
                currentAge={29}
                gender="未設定"
            />,
        );

        fireEvent.mouseEnter(screen.getByRole('button', {name: new RegExp(name)}));

        const tooltip = screen.getByRole('tooltip');
        const marker = screen.getByRole('button', {name: new RegExp(name)}).parentElement;
        const timeline = screen.getByRole('region', {
            name: '年齢0歳から100歳までのタイムライン。横スクロールできます',
        });
        const tooltipLeft = Number.parseFloat(marker?.style.left ?? '0') +
            Number.parseFloat(tooltip.style.left);
        const tooltipTop = Number.parseFloat(marker?.style.top ?? '0') +
            Number.parseFloat(tooltip.style.top);

        expect(tooltipLeft).toBeGreaterThanOrEqual(0);
        expect(tooltipLeft + 200).toBeLessThanOrEqual(1400);
        expect(tooltipTop + Number.parseFloat(tooltip.style.minHeight))
            .toBeLessThanOrEqual(Number.parseFloat((timeline.firstElementChild as HTMLElement).style.height));
        expect(tooltip).toHaveTextContent(name);
    });

    it('同じ年齢のマーカーも個別に選択できる', () => {
        render(
            <Timeline
                events={[
                    {...events[0], name: '同年齢のイベント'},
                    {...events[1], name: '同年齢の目標', age: 0},
                ]}
                currentAge={29}
                gender="未設定"
            />,
        );
        const eventMarker = screen.getByRole('button', {name: /同年齢のイベント/});
        const goalMarker = screen.getByRole('button', {name: /同年齢の目標/});

        fireEvent.click(eventMarker);
        expect(screen.getByRole('heading', {name: '同年齢のイベント'})).toBeInTheDocument();

        fireEvent.click(goalMarker);
        expect(screen.getByRole('heading', {name: '同年齢の目標'})).toBeInTheDocument();
        expect(eventMarker).toHaveAttribute('aria-pressed', 'false');
        expect(goalMarker).toHaveAttribute('aria-pressed', 'true');
    });

    it('タイムラインを移動しても選択中の詳細を維持する', () => {
        render(<Timeline events={events} currentAge={29} gender="未設定"/>);
        const timeline = screen.getByRole('region', {
            name: '年齢0歳から100歳までのタイムライン。横スクロールできます',
        });
        Object.defineProperty(timeline, 'clientWidth', {configurable: true, value: 300});
        Object.defineProperty(timeline, 'scrollWidth', {configurable: true, value: 1432});
        Object.defineProperty(timeline, 'scrollTo', {configurable: true, value: jest.fn()});

        fireEvent.click(screen.getByRole('button', {name: /誕生/}));
        fireEvent.click(screen.getByRole('button', {name: '100歳へ'}));

        expect(screen.getByRole('heading', {name: '誕生'})).toBeInTheDocument();
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

        const markers = screen.getAllByRole('button', {name: /^(イベント|目標):/});
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

        const markers = screen.getAllByRole('button', {name: /^(イベント|目標):/});
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

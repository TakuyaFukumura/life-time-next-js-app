'use client';

import {useState} from 'react';
import type {FocusEvent} from 'react';
import type {LifeEvent} from '../../lib/life-events';
import {
    getAverageLifeExpectancy,
    getHealthyLifeExpectancy,
    getLifeProgressPercentage,
    HEALTHY_LIFE_EXPECTANCY_DATA_YEAR,
    LIFE_EXPECTANCY_DATA_YEAR,
} from '../../lib/life-expectancy';
import type {Gender} from '../../lib/life-settings';

const TIMELINE_WIDTH = 1400;
const HORIZONTAL_PADDING = 24;
const CARD_WIDTH = 200;
const AXIS_Y = 48;
const CARD_LINE_HEIGHT = 24;
const MARKER_LANE_HEIGHT = 18;
const MARKER_SIZE = 16;

function getNameLineCount(name: string): number {
    const textWidth = Array.from(name).reduce(
        (width, character) => width + (/[^\u0000-\u00ff]/.test(character) ? 16 : 8),
        0,
    );

    return Math.max(1, Math.ceil(textWidth / (CARD_WIDTH - 24)));
}

function getAgeX(age: number): number {
    return HORIZONTAL_PADDING +
        (age / 100) * (TIMELINE_WIDTH - HORIZONTAL_PADDING * 2);
}

type PositionedEvent = {
    event: LifeEvent;
    x: number;
    cardLeft: number;
    cardHeight: number;
    lane: number;
    markerY: number;
};

function layoutEvents(events: readonly LifeEvent[]): PositionedEvent[] {
    const sorted = events
        .map((event, index) => ({event, index}))
        .sort((a, b) => a.event.age - b.event.age || a.index - b.index);
    const laneLastX: number[] = [];

    return sorted.map(({event}) => {
        const x = getAgeX(event.age);
        const cardLeft = Math.max(0, Math.min(x - CARD_WIDTH / 2, TIMELINE_WIDTH - CARD_WIDTH));
        let lane = laneLastX.findIndex((lastX) => x - lastX >= MARKER_SIZE + 4);
        if (lane === -1) {
            lane = laneLastX.length;
        }
        laneLastX[lane] = x;
        const nameLines = getNameLineCount(event.name);
        const cardHeight = Math.max(
            80,
            nameLines * CARD_LINE_HEIGHT + 44 + (event.type === 'goal' ? 20 : 0),
        );

        return {
            event,
            x,
            cardLeft,
            lane,
            cardHeight,
            markerY: AXIS_Y + 54 + lane * MARKER_LANE_HEIGHT,
        };
    });
}

export default function Timeline({
    events,
    currentAge,
    gender,
}: {
    readonly events: readonly LifeEvent[];
    readonly currentAge: number;
    readonly gender: Gender;
}) {
    const [currentAgeInput, setCurrentAgeInput] = useState(String(currentAge));
    const [displayAge, setDisplayAge] = useState(currentAge);
    const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const positionedEvents = layoutEvents(events);
    const averageLifeExpectancy = getAverageLifeExpectancy(gender);
    const averageLifeExpectancyX = getAgeX(averageLifeExpectancy);
    const healthyLifeExpectancy = getHealthyLifeExpectancy(gender);
    const healthyLifeExpectancyX = getAgeX(healthyLifeExpectancy);
    const averageLifeProgress = getLifeProgressPercentage(displayAge, averageLifeExpectancy);
    const healthyLifeProgress = getLifeProgressPercentage(displayAge, healthyLifeExpectancy);
    const expectancyGroup = gender === '男性'
        ? '男性'
        : gender === '女性'
            ? '女性'
            : '男女平均';
    const currentAgeX = getAgeX(displayAge);
    const currentAgeLabelLeft = Math.max(
        0,
        Math.min(currentAgeX - 50, TIMELINE_WIDTH - 100),
    );
    const height = Math.max(
        260,
        ...positionedEvents.map(({markerY, cardHeight}) => markerY + cardHeight + 40),
    );

    const handleBlur = (index: number, event: FocusEvent<HTMLDivElement>) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node && event.currentTarget.contains(nextTarget))) {
            setFocusedIndex((currentIndex) => currentIndex === index ? null : currentIndex);
        }
    };

    const handleCurrentAgeChange = (value: string) => {
        setCurrentAgeInput(value);
        if (!/^\d+$/.test(value)) {
            return;
        }

        const age = Number(value);
        if (age <= 100) {
            setDisplayAge(age);
        }
    };

    const handleCurrentAgeBlur = () => {
        if (!/^\d+$/.test(currentAgeInput) || Number(currentAgeInput) > 100) {
            setCurrentAgeInput(String(displayAge));
        }
    };

    return (
        <section aria-label="人生タイムライン">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4 text-sm text-gray-700 dark:text-gray-300">
                <div>
                    <label htmlFor="current-age-input" className="mb-1 block font-medium">
                        現在の年齢
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            id="current-age-input"
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={currentAgeInput}
                            onChange={(event) => handleCurrentAgeChange(event.currentTarget.value)}
                            onBlur={handleCurrentAgeBlur}
                            className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus-visible:outline-gray-200"
                        />
                        <span>歳</span>
                    </div>
                </div>
                <span role="img" aria-label="イベントは丸、目標はひし形">
                    <span aria-hidden="true">●</span> イベント
                    <span className="ml-4" aria-hidden="true">◆</span> 目標
                </span>
                <span className="inline-flex items-center gap-2">
                    <span
                        aria-hidden="true"
                        className="h-4 border-l-2 border-dashed border-teal-600 dark:border-teal-300"
                    />
                    <span>
                        健康寿命（{expectancyGroup}・日本・{HEALTHY_LIFE_EXPECTANCY_DATA_YEAR}年）
                        {' '}{healthyLifeExpectancy.toFixed(2)}歳
                    </span>
                </span>
                <span className="inline-flex items-center gap-2">
                    <span
                        aria-hidden="true"
                        className="h-4 border-l-2 border-dashed border-amber-600 dark:border-amber-300"
                    />
                    <span>
                        平均寿命（{expectancyGroup}・日本・{LIFE_EXPECTANCY_DATA_YEAR}年）
                        {' '}{averageLifeExpectancy.toFixed(2)}歳
                    </span>
                </span>
            </div>
            <div
                className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                role="region"
                aria-label="年齢0歳から100歳までのタイムライン。横スクロールできます"
                tabIndex={0}
            >
                {events.length === 0 ? (
                    <p className="py-8 text-center text-gray-600 dark:text-gray-400">表示できる項目がありません。</p>
                ) : (
                    <div className="relative" style={{width: TIMELINE_WIDTH, height}}>
                        <div
                            aria-hidden="true"
                            className="absolute h-0.5 bg-gray-300 dark:bg-gray-600"
                            style={{
                                left: HORIZONTAL_PADDING,
                                right: HORIZONTAL_PADDING,
                                top: AXIS_Y,
                            }}
                        />
                        <div
                            aria-hidden="true"
                            className="absolute h-0.5 bg-gray-700 dark:bg-gray-200"
                            style={{
                                left: HORIZONTAL_PADDING,
                                width: currentAgeX - HORIZONTAL_PADDING,
                                top: AXIS_Y,
                            }}
                        />
                        <div
                            aria-hidden="true"
                            className="absolute z-20 w-0.5 bg-gray-700 dark:bg-gray-200"
                            style={{
                                left: currentAgeX,
                                top: AXIS_Y - 4,
                                height: 32,
                            }}
                        />
                        <div
                            aria-hidden="true"
                            className="absolute z-[1] border-l-2 border-dashed border-amber-600 dark:border-amber-300"
                            style={{
                                left: averageLifeExpectancyX,
                                top: AXIS_Y - 4,
                                height: height - AXIS_Y + 4,
                            }}
                        />
                        <div
                            aria-hidden="true"
                            className="absolute z-[1] border-l-2 border-dashed border-teal-600 dark:border-teal-300"
                            style={{
                                left: healthyLifeExpectancyX,
                                top: AXIS_Y - 4,
                                height: height - AXIS_Y + 4,
                            }}
                        />
                        <span
                            className="absolute z-30 whitespace-nowrap rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                            style={{
                                left: currentAgeLabelLeft,
                                top: AXIS_Y + 20,
                                width: 100,
                                textAlign: 'center',
                            }}
                        >
                            現在 {displayAge}歳
                        </span>
                        {Array.from({length: 11}, (_, index) => {
                            const age = index * 10;
                            const x = getAgeX(age);

                            return (
                                <div
                                    key={age}
                                    aria-hidden="true"
                                    className="absolute -translate-x-1/2 text-sm text-gray-600 dark:text-gray-400"
                                    style={{left: x, top: 8}}
                                >
                                    {age}歳
                                    <span
                                        className="absolute left-1/2 top-8 h-3 w-px -translate-x-1/2 bg-gray-500 dark:bg-gray-400"
                                    />
                                </div>
                            );
                        })}
                        {positionedEvents.map(({event, x, cardLeft, cardHeight, markerY}, index) => {
                            const isCardVisible = hoveredIndex === index || focusedIndex === index;
                            const isElapsed = event.age <= displayAge;
                            const tooltipId = `life-event-tooltip-${index}`;
                            const periodLabel = isElapsed ? '経過済み' : 'これから';
                            const markerName = event.type === 'goal'
                                ? `目標: ${event.name}、${event.age}歳、${event.category}、${event.status}、${periodLabel}`
                                : `イベント: ${event.name}、${event.age}歳、${event.category}、${periodLabel}`;

                            return (
                                <div
                                    key={`${event.age}-${event.type}-${index}`}
                                    className="group absolute z-10"
                                    style={{left: x, top: markerY}}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex((currentIndex) =>
                                        currentIndex === index ? null : currentIndex
                                    )}
                                    onFocusCapture={() => setFocusedIndex(index)}
                                    onBlurCapture={(event) => handleBlur(index, event)}
                                >
                                    <span
                                        aria-hidden="true"
                                        className="absolute w-px bg-gray-400 dark:bg-gray-500"
                                        style={{
                                            left: 0,
                                            top: AXIS_Y + 5 - markerY,
                                            height: markerY - AXIS_Y - 5,
                                        }}
                                    />
                                    <button
                                        type="button"
                                        aria-pressed={selectedEvent === event}
                                        aria-label={markerName}
                                        aria-describedby={isCardVisible ? tooltipId : undefined}
                                        onClick={() => {
                                            setSelectedEvent(selectedEvent === event ? null : event);
                                            setFocusedIndex(index);
                                        }}
                                        className="absolute left-0 top-0 z-20 grid size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 dark:focus-visible:outline-gray-200"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`size-4 border-2 border-gray-700 transition-transform group-hover:scale-125 dark:border-gray-200 ${
                                                isElapsed ? 'bg-gray-700 dark:bg-gray-200' : 'bg-white dark:bg-gray-800'
                                            } ${
                                                event.type === 'goal' ? 'rotate-45' : 'rounded-full'
                                            }`}
                                        />
                                        <span className="sr-only">{markerName}</span>
                                    </button>
                                    {isCardVisible && (
                                        <div
                                            id={tooltipId}
                                            role="tooltip"
                                            className="absolute z-30 rounded-lg border border-gray-300 bg-white p-3 text-gray-900 shadow-xl dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 motion-reduce:animate-none animate-[life-event-popover_160ms_ease-out]"
                                            style={{
                                                left: cardLeft - x,
                                                top: MARKER_SIZE,
                                                width: CARD_WIDTH,
                                                minHeight: cardHeight,
                                            }}
                                        >
                                            <span className="block w-full break-words font-semibold">{event.name}</span>
                                            <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">
                                                {event.age}歳・{event.category}
                                            </span>
                                            {event.type === 'goal' && (
                                                <span className="block text-sm text-gray-600 dark:text-gray-300">
                                                    {event.status}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {selectedEvent && (
                <div
                    className="mt-4 rounded-xl border border-gray-200 bg-white p-5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    aria-live="polite"
                >
                    <h2 className="font-semibold">{selectedEvent.name}</h2>
                    <p className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {selectedEvent.description || '説明はありません。'}
                    </p>
                </div>
            )}
            <section
                aria-labelledby="life-progress-heading"
                className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
                <h2 id="life-progress-heading" className="text-xl font-semibold">
                    人生の進行度
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    寿命の目安を100%として表示しています。現在年齢は最大100歳まで設定できます。
                </p>
                <div
                    role="group"
                    aria-label="人生の進行度"
                    className="mt-5 space-y-5"
                >
                    {[
                        {
                            label: '健康寿命まで',
                            progress: healthyLifeProgress,
                            color: 'bg-teal-600 dark:bg-teal-300',
                        },
                        {
                            label: '平均寿命まで',
                            progress: averageLifeProgress,
                            color: 'bg-amber-600 dark:bg-amber-300',
                        },
                    ].map(({label, progress, color}) => (
                        <div key={label}>
                            <div className="mb-2 flex items-baseline justify-between gap-4">
                                <span className="font-medium">{label}</span>
                                <span className="font-semibold">{progress.toFixed(1)}%</span>
                            </div>
                            <div
                                role="meter"
                                aria-label={label}
                                aria-valuemin={0}
                                aria-valuemax={150}
                                aria-valuenow={Number(progress.toFixed(1))}
                                aria-valuetext={`${progress.toFixed(1)}%`}
                                className="relative h-4 rounded-full bg-gray-200 dark:bg-gray-700"
                            >
                                <div
                                    aria-hidden="true"
                                    className={`absolute inset-y-0 left-0 rounded-full ${color}`}
                                    style={{width: `${(progress / 150) * 100}%`}}
                                />
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-y-0 left-2/3 border-l-2 border-gray-900 dark:border-gray-100"
                                />
                            </div>
                            <div
                                aria-hidden="true"
                                className="mt-1 flex justify-between text-xs text-gray-600 dark:text-gray-400"
                            >
                                <span>0%</span>
                                <span>100%（寿命の目安）</span>
                                <span>150%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </section>
    );
}

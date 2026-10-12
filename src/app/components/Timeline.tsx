'use client';

import {useState} from 'react';
import type {FocusEvent} from 'react';
import type {LifeEvent} from '../../lib/life-events';

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
        const x = HORIZONTAL_PADDING +
            (event.age / 100) * (TIMELINE_WIDTH - HORIZONTAL_PADDING * 2);
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
            markerY: AXIS_Y + 17 + lane * MARKER_LANE_HEIGHT,
        };
    });
}

export default function Timeline({events}: {readonly events: readonly LifeEvent[]}) {
    const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const positionedEvents = layoutEvents(events);
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

    return (
        <section aria-label="人生のタイムライン">
            <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                <span>マーカーにカーソルを合わせるかタップするとカードを表示します。選択すると説明を確認できます。</span>
                <span role="img" aria-label="イベントは丸、目標はひし形">
                    <span aria-hidden="true">●</span> イベント
                    <span className="ml-4" aria-hidden="true">◆</span> 目標
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
                            className="absolute h-0.5 bg-gray-500 dark:bg-gray-400"
                            style={{
                                left: HORIZONTAL_PADDING,
                                right: HORIZONTAL_PADDING,
                                top: AXIS_Y,
                            }}
                        />
                        {Array.from({length: 11}, (_, index) => {
                            const age = index * 10;
                            const x = HORIZONTAL_PADDING +
                                (age / 100) * (TIMELINE_WIDTH - HORIZONTAL_PADDING * 2);

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
                            const tooltipId = `life-event-tooltip-${index}`;
                            const markerName = event.type === 'goal'
                                ? `目標: ${event.name}、${event.age}歳、${event.category}、${event.status}`
                                : `イベント: ${event.name}、${event.age}歳、${event.category}`;

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
                                            className={`size-4 border-2 border-gray-700 bg-white transition-transform group-hover:scale-125 dark:border-gray-200 dark:bg-gray-800 ${
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
        </section>
    );
}

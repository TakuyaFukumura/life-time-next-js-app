'use client';

import {useState} from 'react';
import type {LifeEvent} from '../../lib/life-events';

const TIMELINE_WIDTH = 1400;
const HORIZONTAL_PADDING = 24;
const CARD_WIDTH = 200;
const CARD_GAP = 12;
const AXIS_Y = 48;
const FIRST_CARD_Y = 142;
const CARD_LINE_HEIGHT = 24;
const LANE_GAP = 20;
const MARKER_LANE_HEIGHT = 18;

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
    cardTop: number;
    cardHeight: number;
    lane: number;
};

function layoutEvents(events: readonly LifeEvent[]): PositionedEvent[] {
    const sorted = events
        .map((event, index) => ({event, index}))
        .sort((a, b) => a.event.age - b.event.age || a.index - b.index);
    const laneLastRight: number[] = [];
    const laneHeights: number[] = [];

    const laidOutEvents = sorted.map(({event}) => {
        const x = HORIZONTAL_PADDING +
            (event.age / 100) * (TIMELINE_WIDTH - HORIZONTAL_PADDING * 2);
        const cardLeft = Math.max(0, Math.min(x - CARD_WIDTH / 2, TIMELINE_WIDTH - CARD_WIDTH));
        let lane = laneLastRight.findIndex((lastRight) => cardLeft - lastRight >= CARD_GAP);
        if (lane === -1) {
            lane = laneLastRight.length;
        }
        laneLastRight[lane] = cardLeft + CARD_WIDTH;
        const nameLines = getNameLineCount(event.name);
        const cardHeight = Math.max(
            80,
            nameLines * CARD_LINE_HEIGHT + 44 + (event.type === 'goal' ? 20 : 0),
        );
        laneHeights[lane] = Math.max(laneHeights[lane] ?? 0, cardHeight);

        return {
            event,
            x,
            cardLeft,
            lane,
            cardHeight,
        };
    });
    const laneTops: number[] = [];
    laneHeights.reduce((top, laneHeight, lane) => {
        laneTops[lane] = top;
        return top + laneHeight + LANE_GAP;
    }, FIRST_CARD_Y);

    return laidOutEvents.map((item) => ({
        ...item,
        cardTop: laneTops[item.lane],
    }));
}

export default function Timeline({events}: {readonly events: readonly LifeEvent[]}) {
    const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
    const positionedEvents = layoutEvents(events);
    const height = Math.max(
        260,
        ...positionedEvents.map(({cardTop, cardHeight}) => cardTop + cardHeight + 16),
    );

    return (
        <section aria-label="人生のタイムライン">
            <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700 dark:text-gray-300">
                <span>項目を選択すると説明を表示します。</span>
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
                        {positionedEvents.map(({event, x, cardLeft, cardTop, lane}, index) => {
                            const markerY = AXIS_Y + 17 + lane * MARKER_LANE_HEIGHT;

                            return (
                                <div key={`${event.age}-${event.type}-${index}`}>
                                    <span
                                        aria-hidden="true"
                                        className="absolute w-px bg-gray-400 dark:bg-gray-500"
                                        style={{
                                            left: x,
                                            top: AXIS_Y + 5,
                                            height: markerY - AXIS_Y - 5,
                                        }}
                                    />
                                    <span
                                        aria-hidden="true"
                                        className={`absolute size-4 -translate-x-1/2 -translate-y-1/2 border-2 border-gray-700 bg-white dark:border-gray-200 dark:bg-gray-800 ${
                                            event.type === 'goal' ? 'rotate-45' : 'rounded-full'
                                        }`}
                                        style={{left: x, top: markerY}}
                                    />
                                    <button
                                        type="button"
                                        aria-pressed={selectedEvent === event}
                                        onClick={() => setSelectedEvent(selectedEvent === event ? null : event)}
                                        className="absolute flex min-h-20 flex-col items-start rounded-lg border border-gray-300 bg-white p-3 text-left text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus-visible:outline-gray-200"
                                        style={{
                                            left: cardLeft,
                                            top: cardTop,
                                            width: CARD_WIDTH,
                                        }}
                                    >
                                        <span className="w-full break-words font-semibold">{event.name}</span>
                                        <span className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            {event.age}歳・{event.category}
                                        </span>
                                        {event.type === 'goal' && (
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {event.status}
                                            </span>
                                        )}
                                    </button>
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

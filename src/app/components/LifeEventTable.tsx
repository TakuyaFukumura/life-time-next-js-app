'use client';

import {useState} from 'react';
import type {LifeEvent} from '../../lib/life-events';

const PAGE_SIZE = 10;

export default function LifeEventTable({events}: {readonly events: readonly LifeEvent[]}) {
    const [requestedPage, setRequestedPage] = useState(1);
    const orderedEvents = [...events].sort((first, second) => first.age - second.age);
    const pageCount = Math.ceil(orderedEvents.length / PAGE_SIZE);
    const currentPage = Math.min(requestedPage, Math.max(pageCount, 1));
    const pageEvents = orderedEvents.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const firstVisibleEvent = orderedEvents.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const lastVisibleEvent = Math.min(currentPage * PAGE_SIZE, orderedEvents.length);

    return (
        <section aria-labelledby="registered-events-heading" className="mt-12">
            <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 id="registered-events-heading" className="text-2xl font-bold">
                    登録データ
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {events.length}件
                </span>
            </div>
            {events.length === 0 ? (
                <p className="rounded-xl border border-gray-200 bg-white p-5 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    登録データはありません。
                </p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                        <caption className="sr-only">
                            年齢順に並んだ人生のイベントと目標
                        </caption>
                        <thead className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                            <tr>
                                <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">種別</th>
                                <th scope="col" className="px-4 py-3 font-semibold">名称</th>
                                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right font-semibold">年齢</th>
                                <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">カテゴリ</th>
                                <th scope="col" className="px-4 py-3 font-semibold">説明</th>
                                <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">状態</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {pageEvents.map((event, index) => (
                                <tr
                                    key={`${event.age}-${event.type}-${(currentPage - 1) * PAGE_SIZE + index}`}
                                    className="text-gray-800 dark:text-gray-200"
                                >
                                    <td className="whitespace-nowrap px-4 py-3">
                                        {event.type === 'event' ? 'イベント' : '目標'}
                                    </td>
                                    <td className="max-w-56 break-words px-4 py-3 font-medium">
                                        {event.name}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                        {event.age}歳
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">{event.category}</td>
                                    <td className="max-w-80 whitespace-pre-wrap break-words px-4 py-3">
                                        {event.description || '—'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        {event.type === 'goal' ? event.status : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p aria-live="polite" className="text-sm text-gray-600 dark:text-gray-400">
                    {firstVisibleEvent}〜{lastVisibleEvent}件を表示 / {events.length}件
                </p>
                {pageCount > 1 && (
                    <nav aria-label="登録データのページ操作" className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setRequestedPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            前へ
                        </button>
                        <span className="min-w-20 text-center text-sm text-gray-700 dark:text-gray-300">
                            {currentPage} / {pageCount} ページ
                        </span>
                        <button
                            type="button"
                            onClick={() => setRequestedPage(currentPage + 1)}
                            disabled={currentPage === pageCount}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            次へ
                        </button>
                    </nav>
                )}
            </div>
        </section>
    );
}

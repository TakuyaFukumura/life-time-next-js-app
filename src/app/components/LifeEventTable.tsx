'use client';

import {useState} from 'react';
import type {LifeEvent} from '../../lib/life-events';

const PAGE_SIZE = 10;

export default function LifeEventTable({events}: {readonly events: readonly LifeEvent[]}) {
    const [requestedPage, setRequestedPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState<'all' | 'event' | 'goal'>('all');
    const [categoryFilter, setCategoryFilter] = useState<'all' | '仕事' | '家族'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | '未着手' | '進行中' | '達成' | '中止'>('all');
    const [keyword, setKeyword] = useState('');
    const orderedEvents = [...events].sort((first, second) => first.age - second.age);
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('ja');
    const filteredEvents = orderedEvents.filter((event) => (
        (typeFilter === 'all' || event.type === typeFilter) &&
        (categoryFilter === 'all' || event.category === categoryFilter) &&
        (statusFilter === 'all' || (event.type === 'goal' && event.status === statusFilter)) &&
        (normalizedKeyword === '' ||
            event.name.toLocaleLowerCase('ja').includes(normalizedKeyword) ||
            event.description.toLocaleLowerCase('ja').includes(normalizedKeyword))
    ));
    const pageCount = Math.ceil(filteredEvents.length / PAGE_SIZE);
    const currentPage = Math.min(requestedPage, Math.max(pageCount, 1));
    const pageEvents = filteredEvents.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const firstVisibleEvent = filteredEvents.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const lastVisibleEvent = Math.min(currentPage * PAGE_SIZE, filteredEvents.length);
    const hasActiveFilters = typeFilter !== 'all' || categoryFilter !== 'all' ||
        statusFilter !== 'all' || keyword.trim() !== '';

    const clearFilters = () => {
        setTypeFilter('all');
        setCategoryFilter('all');
        setStatusFilter('all');
        setKeyword('');
        setRequestedPage(1);
    };

    return (
        <section aria-labelledby="registered-events-heading" className="mt-12">
            <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 id="registered-events-heading" className="text-2xl font-bold">
                    登録データ
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredEvents.length === events.length
                        ? `${events.length}件`
                        : `${filteredEvents.length}件 / ${events.length}件`}
                </span>
            </div>
            {events.length === 0 ? (
                <p className="rounded-xl border border-gray-200 bg-white p-5 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    登録データはありません。
                </p>
            ) : (
                <>
                    <div
                        role="search"
                        aria-label="登録データの絞り込み"
                        className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
                            キーワード
                            <input
                                type="search"
                                value={keyword}
                                onChange={(event) => {
                                    setKeyword(event.currentTarget.value);
                                    setRequestedPage(1);
                                }}
                                placeholder="名称・説明を検索"
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus-visible:outline-gray-200"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
                            種別
                            <select
                                value={typeFilter}
                                onChange={(event) => {
                                    const value = event.currentTarget.value;
                                    setTypeFilter(value === 'event' || value === 'goal' ? value : 'all');
                                    setRequestedPage(1);
                                }}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus-visible:outline-gray-200"
                            >
                                <option value="all">すべて</option>
                                <option value="event">イベント</option>
                                <option value="goal">目標</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
                            カテゴリ
                            <select
                                value={categoryFilter}
                                onChange={(event) => {
                                    const value = event.currentTarget.value;
                                    setCategoryFilter(value === '仕事' || value === '家族' ? value : 'all');
                                    setRequestedPage(1);
                                }}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus-visible:outline-gray-200"
                            >
                                <option value="all">すべて</option>
                                <option value="仕事">仕事</option>
                                <option value="家族">家族</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
                            目標状態
                            <select
                                value={statusFilter}
                                onChange={(event) => {
                                    const value = event.currentTarget.value;
                                    setStatusFilter(value === '未着手' || value === '進行中' ||
                                        value === '達成' || value === '中止' ? value : 'all');
                                    setRequestedPage(1);
                                }}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:focus-visible:outline-gray-200"
                            >
                                <option value="all">すべて</option>
                                <option value="未着手">未着手</option>
                                <option value="進行中">進行中</option>
                                <option value="達成">達成</option>
                                <option value="中止">中止</option>
                            </select>
                        </label>
                        {hasActiveFilters && (
                            <div className="sm:col-span-2 lg:col-span-4">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus-visible:outline-gray-200"
                                >
                                    条件をクリア
                                </button>
                            </div>
                        )}
                    </div>
                    {filteredEvents.length === 0 ? (
                        <p className="rounded-xl border border-gray-200 bg-white p-5 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                            条件に一致するデータがありません。
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
                </>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p aria-live="polite" className="text-sm text-gray-600 dark:text-gray-400">
                    {firstVisibleEvent}〜{lastVisibleEvent}件を表示 / {filteredEvents.length}件
                </p>
                {pageCount > 1 && filteredEvents.length > 0 && (
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

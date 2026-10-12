import Timeline from './components/Timeline';
import LifeEventTable from './components/LifeEventTable';
import {loadLifeEvents} from '../lib/life-events';
import type {LifeEvent} from '../lib/life-events';

export default async function Home() {
    let events: LifeEvent[] | null;
    try {
        events = await loadLifeEvents();
    } catch (error) {
        console.error('サンプルデータの読み込みに失敗しました:', error);
        events = null;
    }

    if (events === null) {
        return (
            <main className="min-h-[calc(100vh-4rem)] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <p role="alert" className="rounded-lg border border-gray-300 bg-white p-5 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                        サンプルデータを読み込めませんでした
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-10 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">人生のタイムライン</h1>
                    <p className="mt-3 text-gray-600 dark:text-gray-400">
                        0歳から100歳までの出来事と目標を表示します。
                    </p>
                </div>
                <Timeline events={events}/>
                <LifeEventTable events={events}/>
            </div>
        </main>
    );
}

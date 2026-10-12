import Timeline from './components/Timeline';
import LifeEventTable from './components/LifeEventTable';
import {loadLifeEvents} from '../lib/life-events';
import {loadCurrentAge} from '../lib/current-age';
import type {LifeEvent} from '../lib/life-events';

export default async function Home() {
    let events: LifeEvent[] | null = null;
    let currentAge: number | null = null;
    try {
        [events, currentAge] = await Promise.all([
            loadLifeEvents(),
            loadCurrentAge(),
        ]);
    } catch (error) {
        console.error('サンプルデータまたは設定の読み込みに失敗しました:', error);
    }

    if (events === null || currentAge === null) {
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
                        現在年齢までの経過と、0歳から100歳までの出来事・目標を表示します。
                    </p>
                </div>
                <Timeline events={events} currentAge={currentAge}/>
                <LifeEventTable events={events}/>
            </div>
        </main>
    );
}

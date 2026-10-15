import LifeTimeline from './components/LifeTimeline';
import LifeEventTable from './components/LifeEventTable';
import type {LifeEvent} from '../lib/life-events';
import {loadLifeEvents} from '../lib/life-events';
import type {LifeSettings} from '../lib/life-settings';
import {loadLifeSettings} from '../lib/life-settings';

export default async function Home() {
    let events: LifeEvent[] | null = null;
    let settings: LifeSettings | null = null;
    try {
        [events, settings] = await Promise.all([
            loadLifeEvents(),
            loadLifeSettings(),
        ]);
    } catch (error) {
        console.error('サンプルデータまたは設定の読み込みに失敗しました:', error);
    }

    if (events === null || settings === null) {
        return (
            <main className="min-h-[calc(100vh-4rem)] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <p role="alert"
                       className="rounded-lg border border-gray-300 bg-white p-5 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                        サンプルデータを読み込めませんでした
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main
            className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-10 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <LifeTimeline
                    events={events}
                    currentAge={settings.currentAge}
                    initialGender={settings.gender}
                />
                <LifeEventTable events={events}/>
            </div>
        </main>
    );
}

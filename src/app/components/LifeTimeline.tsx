import Timeline from './Timeline';
import type {LifeEvent} from '../../lib/life-events';
import type {Gender} from '../../lib/gender';

export default function LifeTimeline({
                                         events,
                                         currentAge,
                                         initialGender,
                                     }: {
    readonly events: readonly LifeEvent[];
    readonly currentAge: number;
    readonly initialGender: Gender;
}) {
    return (
        <>
            <header className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">人生タイムライン</h1>
                <p className="mt-3 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
                    人生の出来事や目標を年齢軸で確認できます。年齢や性別を変えると、タイムラインと進行度の表示がその場で切り替わります。
                </p>
            </header>
            <Timeline
                events={events}
                currentAge={currentAge}
                initialGender={initialGender}
            />
        </>
    );
}

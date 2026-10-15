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
            </header>
            <Timeline
                events={events}
                currentAge={currentAge}
                initialGender={initialGender}
            />
        </>
    );
}

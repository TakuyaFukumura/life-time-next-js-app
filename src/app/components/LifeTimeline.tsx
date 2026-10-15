'use client';

import {useState} from 'react';
import Timeline from './Timeline';
import type {LifeEvent} from '../../lib/life-events';
import type {Gender} from '../../lib/gender';
import {GENDERS} from '../../lib/gender';

export default function LifeTimeline({
                                         events,
                                         currentAge,
                                         initialGender,
                                     }: {
    readonly events: readonly LifeEvent[];
    readonly currentAge: number;
    readonly initialGender: Gender;
}) {
    const [gender, setGender] = useState(initialGender);

    const handleGenderChange = (value: string) => {
        const selectedGender = GENDERS.find((option) => option === value);
        if (selectedGender) {
            setGender(selectedGender);
        }
    };

    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">人生タイムライン</h1>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <label htmlFor="gender-select">性別:</label>
                    <select
                        id="gender-select"
                        value={gender}
                        onChange={(event) => handleGenderChange(event.currentTarget.value)}
                        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus-visible:outline-gray-200"
                    >
                        {GENDERS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </header>
            <Timeline
                events={events}
                currentAge={currentAge}
                gender={gender}
            />
        </>
    );
}

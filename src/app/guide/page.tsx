import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: '解説 | 人生可視化アプリ',
    description: '人生タイムラインとデータ一覧の見方を紹介します。',
};

const sectionClassName = 'rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800';

export default function GuidePage() {
    return (
        <main className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-10 text-gray-900 dark:bg-gray-900 dark:text-gray-100 sm:px-6 lg:px-8">
            <article className="mx-auto max-w-4xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">解説</h1>
                    <p className="mt-3 text-gray-600 dark:text-gray-400">
                        人生タイムラインの見方と、データ一覧の確認方法を紹介します。
                    </p>
                </header>

                <div className="space-y-6">
                    <section aria-labelledby="timeline-guide" className={sectionClassName}>
                        <h2 id="timeline-guide" className="text-xl font-semibold">タイムラインの見方</h2>
                        <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700 dark:text-gray-300">
                            <li>横軸は0歳から100歳までの年齢で、縦線が現在の年齢を示します。</li>
                            <li>現在までの濃い線は経過した年数、薄い線はこれからの年数です。</li>
                            <li>破線は、性別に応じた日本の2025年平均寿命の目安を示します。「その他」「未設定」の場合は男女平均です。</li>
                            <li>丸いマーカーはイベント、ひし形のマーカーは目標です。塗りつぶされたマーカーは現在年齢までの項目です。</li>
                            <li>マーカーにカーソルを合わせるか、フォーカスまたはタップすると概要が表示されます。選択すると説明を確認できます。</li>
                            <li>画面幅に収まらない場合は、タイムラインを横にスクロールできます。</li>
                        </ul>
                    </section>

                    <section aria-labelledby="table-guide" className={sectionClassName}>
                        <h2 id="table-guide" className="text-xl font-semibold">データ一覧の使い方</h2>
                        <p className="mt-4 text-gray-700 dark:text-gray-300">
                            タイムラインの下にはデータ一覧が表示されます。列見出しで並べ替え、種別・カテゴリ（仕事・家族・学業）・目標状態や名称・説明のキーワードで絞り込めます。
                        </p>
                    </section>
                </div>
            </article>
        </main>
    );
}

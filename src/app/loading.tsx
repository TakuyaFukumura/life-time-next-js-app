export default function Loading() {
    return (
        <main
            className="flex min-h-[calc(100vh-4rem)] items-center justify-center"
            role="status"
        >
            <p className="text-gray-600 dark:text-gray-400">サンプルデータを読み込んでいます...</p>
        </main>
    );
}

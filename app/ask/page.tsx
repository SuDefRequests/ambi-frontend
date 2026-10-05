'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { Narration } from '@/components/archive/ReaderNarration';
import styles from './narration.module.css';
import visual from './ask.module.css';
import { ArrowUp, ArrowRight, BookOpen, FileText, GraduationCap, Layers, Scale, Search, Sparkles, Users } from 'lucide-react';
import { useVisit } from '@/components/archive/VisitPreferences';

type Source = {
    passage_id: string;
    archive_type: 'baws' | 'cad';
    source: string;
    page: number | null;
    volume: number;
    title: string | null;
    url: string | null;
    text: string;
};

type AskResponse = {
    question: string;
    answer: string;
    sources: Source[];
};

const SUGGESTIONS = [
    {
        icon: GraduationCap,
        text: 'What did Ambedkar say about education?',
    },
    {
        icon: Users,
        text: 'What were Ambedkar’s views on representation?',
    },
    {
        icon: Scale,
        text: 'What did Ambedkar say about social justice?',
    },
    {
        icon: BookOpen,
        text: 'What role did Ambedkar see for the Constitution?',
    },
];

function sourceLabel(source: Source) {
    if (source.archive_type === 'cad') {
        return `${source.source} · ${source.title || 'Assembly proceeding'}`;
    }

    return `${source.source} · ${source.page ? `PDF page ${source.page}` : `Volume ${source.volume}`
        }`;
}

function renderAnswer(answer: string) {
    const parts = answer.split(/(\[[a-z0-9_]+\])/gi);

    return parts.map((part, index) => {
        if (/^\[[a-z0-9_]+\]$/i.test(part)) {
            return (
                <span
                    key={index}
                    className="mx-1 inline-flex items-center rounded-full border border-[#b89d72]/40 bg-[#f3eadb] px-2 py-0.5 font-mono text-[0.7em] text-[#765d3f]"
                >
                    {part}
                </span>
            );
        }

        return <span key={index}>{part}</span>;
    });
}

export default function AskArchivePage() {
    const [question, setQuestion] = useState('');
    const { language, setLanguage } = useVisit();
    const [answer, setAnswer] = useState<AskResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const hasAnswer = Boolean(answer);

    const sourceIds = useMemo(
        () => new Set(answer?.sources.map((source) => source.passage_id) ?? []),
        [answer],
    );

    async function askArchive(
        event?: FormEvent,
        directQuestion?: string,
    ) {
        event?.preventDefault();

        const trimmed = (directQuestion ?? question).trim();

        if (!trimmed || loading) return;

        setQuestion(trimmed);
        setLoading(true);
        setError('');
        setAnswer(null);

        try {
            const response = await fetch('/api/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: trimmed,
                    language,
                    archive: 'all',
                    top_k: 6,
                }),
            });
            const payload = await response.json();

            if (!response.ok) {
                throw new Error(
                    payload?.detail?.message ||
                    'The archive could not answer this question.',
                );
            }

            setAnswer(payload as AskResponse);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'The archive could not answer this question.',
            );
        } finally {
            setLoading(false);
        }
    }

    function submitSuggestion(value: string) {
        void askArchive(undefined, value);
    }

    return (
        <main className={visual.page} data-reading={hasAnswer || loading}>
            <div aria-hidden="true" className={visual.artwork} />
            <div className={visual.shell}>
                {/* Header */}
                <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#b9a88d]/30">
                    <Link
                        href="/"
                        className="group inline-flex min-h-12 items-center gap-3 rounded-full px-3 text-sm font-medium tracking-wide text-[#51473d] transition hover:bg-[#ebe1d2]"
                    >
                        <span className="text-lg transition-transform duration-200 group-hover:-translate-x-1">
                            ←
                        </span>

                        <span>Archive Home</span>
                    </Link>

                    <div className="hidden items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#806a4f] sm:flex">
                        <span className="h-2 w-2 rounded-full bg-[#96703e]" />
                        Ask the Archive
                    </div>
                </header>

                {/* Main experience */}
                <section
                    className={`${visual.experience} ${hasAnswer || loading ? visual.reading : ''}`}
                >
                    {/* Hero */}
                    {!hasAnswer && !loading && (
                        <div className={visual.hero}>
                            <div className="mb-5 flex items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#987346]">
                                <span className="h-px w-7 bg-[#b29469]" />
                                AI-powered archive
                                <span className="h-px w-7 bg-[#b29469]" />
                            </div>

                            <h1 className={visual.title}>
                                Ask the{' '}
                                <span className="text-[#90672f]">
                                    Archive
                                </span>
                            </h1>

                            <p className={visual.description}>
                                Explore Ambedkar&apos;s writings, speeches and
                                historical records through questions grounded
                                in the archive.
                            </p>

                            {/* Feature strip */}
                            <div className={visual.features}>
                                <div className="flex items-center gap-3 text-left">
                                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] border border-[#8f6a38]/30 bg-[#fffaf2]/70 text-lg text-[#936b35] shadow-sm">
                                        <FileText size={28} strokeWidth={1.5} aria-hidden="true" />
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-semibold text-[#40382f]">
                                            Grounded responses
                                        </p>
                                        <p className="mt-1 text-[10px] text-[#938579]">
                                            Based only on archival sources
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-left">
                                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] border border-[#8f6a38]/30 bg-[#fffaf2]/70 text-xl text-[#936b35] shadow-sm">
                                        <Search size={28} strokeWidth={1.5} aria-hidden="true" />
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-semibold text-[#40382f]">
                                            Citations included
                                        </p>
                                        <p className="mt-1 text-[10px] text-[#938579]">
                                            See the original passages
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-left">
                                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] border border-[#8f6a38]/30 bg-[#fffaf2]/70 text-lg text-[#936b35] shadow-sm">
                                        <Layers size={28} strokeWidth={1.5} aria-hidden="true" />
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-semibold text-[#40382f]">
                                            Explore deeper
                                        </p>
                                        <p className="mt-1 text-[10px] text-[#938579]">
                                            Follow sources to full context
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Question form */}
                    <div className="mb-5 flex justify-center">
                        <div
                            className="inline-flex items-center gap-1 rounded-full border border-[#b9a88d]/40 bg-[#fffaf2]/75 p-1 shadow-sm"
                            role="group"
                            aria-label="Answer language"
                        >
                            {[
                                { value: 'en', label: 'English' },
                                { value: 'hi', label: 'हिंदी' },
                                { value: 'mr', label: 'मराठी' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setLanguage(option.value as 'en' | 'hi' | 'mr')}
                                    disabled={loading}
                                    className={`min-h-11 rounded-full px-5 text-sm font-medium transition ${language === option.value
                                        ? 'bg-[#91662e] text-white shadow-sm'
                                        : 'text-[#6f604f] hover:bg-[#eee3d3]'
                                        } disabled:cursor-not-allowed disabled:opacity-60`}
                                    aria-pressed={language === option.value}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={askArchive} className={visual.form}>
                        <div
                            className={visual.askBox}
                        >
                            <div className={visual.inputRow}>
                                <div className={visual.spark}>
                                    <Sparkles size={27} strokeWidth={1.5} aria-hidden="true" />
                                </div>

                                <textarea
                                    value={question}
                                    onChange={(event) =>
                                        setQuestion(event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === 'Enter' &&
                                            !event.shiftKey &&
                                            window.innerWidth >= 768
                                        ) {
                                            event.preventDefault();
                                            void askArchive();
                                        }
                                    }}
                                    placeholder="What would you like to discover?"
                                    rows={1}
                                    disabled={loading}
                                    className="min-h-[82px] flex-1 resize-none bg-transparent px-4 py-5 text-base leading-7 text-[#302b26] outline-none placeholder:text-[#aa9a87] disabled:opacity-60 sm:min-h-[74px] sm:text-[16px]"
                                    aria-label="Ask the archive a question"
                                />

                                <button
                                    type="submit"
                                    disabled={!question.trim() || loading}
                                    aria-label="Ask the Archive"
                                    className="grid h-12 w-12 shrink-0 place-items-center self-end rounded-full bg-[#91662e] text-xl text-white shadow-sm transition hover:scale-105 hover:bg-[#765124] disabled:cursor-not-allowed disabled:opacity-40 sm:self-center"
                                >
                                    {loading ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    ) : (
                                        <ArrowUp size={24} strokeWidth={1.5} aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Suggestions */}
                    {!hasAnswer && !loading && (
                        <div className="mt-8">
                            <div className="mb-4 flex items-center justify-center gap-3 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#96734a]">
                                <span className="h-px w-9 bg-[#d5c2a5]" />
                                Try asking
                                <span className="h-px w-9 bg-[#d5c2a5]" />
                            </div>

                            <div className={visual.suggestions}>
                                {SUGGESTIONS.map((suggestion) => (
                                    <button
                                        key={suggestion.text}
                                        type="button"
                                        onClick={() =>
                                            submitSuggestion(suggestion.text)
                                        }
                                        className={visual.suggestion}
                                    >
                                        <span className={visual.suggestionIcon}>
                                            <suggestion.icon size={24} strokeWidth={1.6} aria-hidden="true" />
                                        </span>

                                        <span className="flex-1">
                                            {suggestion.text}
                                        </span>

                                        <span className="text-lg text-[#9b7548] transition-transform duration-200 group-hover:translate-x-1">
                                            <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="py-20 text-center">
                            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#b9a88d]/50 bg-[#fbf7ef] shadow-sm">
                                <span className="h-5 w-5 animate-pulse rounded-full bg-[#8d7655]" />
                            </div>

                            <h2 className="font-serif text-2xl font-normal text-[#393129]">
                                Searching the archive…
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-center text-sm leading-6 text-[#827363]">
                                Finding relevant passages and building an
                                evidence-grounded response.
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <div className="mt-8 rounded-[24px] border border-[#b98e76]/35 bg-[#fbf1e9] p-7 text-center">
                            <p className="text-sm font-semibold text-[#744b39]">
                                The archive could not answer that question.
                            </p>

                            <p className="mt-2 text-sm text-[#876b5a]">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => void askArchive()}
                                className="mt-5 min-h-12 rounded-full border border-[#9d8064] px-6 text-sm font-semibold text-[#634e3c] transition hover:bg-[#f0e3d5]"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Answer */}
                    {answer && !loading && (
                        <div className="mt-14">
                            {/* Answer heading */}
                            <div className="mb-7 flex flex-col gap-4 border-b border-[#b9a88d]/20 pb-7 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#987346]">
                                        Archive response
                                    </p>

                                    <h2 className="mt-2 max-w-3xl font-serif text-2xl font-normal leading-tight tracking-[-0.02em] text-[#302a24] sm:text-3xl">
                                        {answer.question}
                                    </h2>
                                </div>

                                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#8f6a38]/20 bg-[#f3eadb] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#80633f]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#96703e]" />
                                    Evidence grounded
                                </span>
                            </div>

                            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
                                {/* Main answer */}
                                <article className="rounded-[26px] border border-[#ddccb4] bg-[#fffaf3]/75 p-7 shadow-[0_20px_55px_rgba(88,61,30,0.06)] sm:p-10">
                                    {/* Narration */}
                                    <div
                                        className={`${styles.narration} border-b border-[#b9a88d]/15 pb-5`}
                                    >
                                        <p
                                            className={
                                                styles.label
                                            }
                                        >
                                            AI-generated narration
                                        </p>

                                        <Narration
                                            text={answer.answer}
                                            language={language}
                                            listenLabel="Listen to this answer"
                                        />
                                    </div>

                                    <div className="flex gap-5">
                                        <div
                                            aria-hidden="true"
                                            className="hidden font-serif text-[74px] leading-[0.65] text-[#b69467]/50 sm:block"
                                        >
                                            “
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="whitespace-pre-wrap font-serif text-[17px] leading-8 text-[#51483f] sm:text-[18px]">
                                                {renderAnswer(answer.answer)}
                                            </div>
                                        </div>
                                    </div>
                                </article>

                                {/* Sources */}
                                <aside>
                                    <div className="lg:sticky lg:top-6">
                                        <div className="mb-4 flex items-end justify-between">
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#987346]">
                                                    Archival evidence
                                                </p>

                                                <h3 className="mt-1 font-serif text-2xl font-normal text-[#302a24]">
                                                    Explore the sources
                                                </h3>
                                            </div>

                                            <span className="text-xs text-[#8b7966]">
                                                {answer.sources.length}{' '}
                                                passages
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {answer.sources.map((source) => {
                                                const referenced =
                                                    sourceIds.has(
                                                        source.passage_id,
                                                    );

                                                return (
                                                    <Link
                                                        key={
                                                            source.passage_id
                                                        }
                                                        href={`/documents/${encodeURIComponent(
                                                            source.passage_id,
                                                        )}`}
                                                        className="group block rounded-[18px] border border-[#b9a88d]/30 bg-[#fffaf3]/60 p-5 transition duration-200 hover:-translate-y-1 hover:border-[#927653] hover:bg-[#fffaf3] hover:shadow-[0_12px_30px_rgba(75,55,32,0.08)]"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8d7655]">
                                                                    {source.archive_type ===
                                                                        'cad'
                                                                        ? 'Assembly Debate'
                                                                        : 'Collected Works'}
                                                                </p>

                                                                <p className="mt-2 text-sm font-semibold leading-5 text-[#40372f]">
                                                                    {sourceLabel(
                                                                        source,
                                                                    )}
                                                                </p>
                                                            </div>

                                                            <span className="text-lg text-[#927653] transition-transform duration-200 group-hover:translate-x-1">
                                                                →
                                                            </span>
                                                        </div>

                                                        <p className="mt-3 line-clamp-3 text-xs leading-5 text-[#857565]">
                                                            {source.text}
                                                        </p>

                                                        {referenced && (
                                                            <p className="mt-4 font-mono text-[9px] text-[#9a8369]">
                                                                [
                                                                {
                                                                    source.passage_id
                                                                }
                                                                ]
                                                            </p>
                                                        )}

                                                        <p className="mt-4 text-xs font-semibold text-[#6e5944]">
                                                            Read passage →
                                                        </p>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </div>
                    )}
                </section>

                {/* Footer */}
                <footer className={visual.footer}>
                    <span className="hidden h-px flex-1 bg-[#b9a88d]/10 sm:block" />

                    <p className="text-center text-[10px] text-[#9a8977]">
                        Responses are generated from retrieved archival
                        evidence.
                    </p>

                    <span className="hidden h-px flex-1 bg-[#b9a88d]/10 sm:block" />
                </footer>
            </div>
        </main>
    );
}
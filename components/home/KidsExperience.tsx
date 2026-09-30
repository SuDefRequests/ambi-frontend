'use client';

import { useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Brain,
    FileText,
    Headphones,
    HelpCircle,
    Sparkles,
} from 'lucide-react';

import {
    milestoneYears,
    type HomeCopy,
} from '@/lib/content';

import { KidsQuiz } from '@/components/kids/KidsQuiz';
import { KidsDocuments } from '@/components/kids/KidsDocuments';

type Props = {
    copy: HomeCopy;
};

type ActivityId =
    | 'story'
    | 'ideas'
    | 'documents'
    | 'listen'
    | 'quiz';

const activities: {
    id: ActivityId;
    icon: typeof BookOpen;
    number: string;
    title: string;
    description: string;
}[] = [
        {
            id: 'story',
            icon: BookOpen,
            number: '01',
            title: 'His Story',
            description:
                'Travel through important moments in Dr. Ambedkar’s life.',
        },
        {
            id: 'ideas',
            icon: Brain,
            number: '02',
            title: 'Big Ideas',
            description:
                'Discover ideas about equality, education, rights and democracy.',
        },
        {
            id: 'documents',
            icon: FileText,
            number: '03',
            title: 'Explore Documents',
            description:
                'Look at real documents and discover the stories behind them.',
        },
        {
            id: 'listen',
            icon: Headphones,
            number: '04',
            title: 'Listen & Learn',
            description:
                'Listen to stories and learn through audio.',
        },
        {
            id: 'quiz',
            icon: HelpCircle,
            number: '05',
            title: 'Quiz Time',
            description:
                'Test what you discovered in the archive.',
        },
    ];

export function KidsExperience({ copy }: Props) {
    const [activeActivity, setActiveActivity] =
        useState<ActivityId | null>(null);

    function goBack() {
        setActiveActivity(null);
    }

    return (
        <section
            className="kids-experience"
            aria-labelledby="kids-heading"
        >
            {!activeActivity ? (
                <>
                    <div className="kids-hero">
                        <div
                            className="kids-hero-mark"
                            aria-hidden="true"
                        >
                            <Sparkles size={22} strokeWidth={1.7} />
                        </div>

                        <span className="kids-eyebrow">
                            A SPECIAL WAY TO EXPLORE
                        </span>

                        <h1 id="kids-heading">
                            Welcome, young explorer!
                        </h1>

                        <p>
                            Discover stories, ideas, documents and fascinating
                            moments from Dr. B. R. Ambedkar’s life.
                        </p>
                    </div>

                    <div className="kids-section-heading">
                        <div>
                            <span>CHOOSE YOUR ADVENTURE</span>

                            <h2>
                                Where would you like to explore?
                            </h2>
                        </div>
                    </div>

                    <div className="kids-activities">
                        {activities.map(
                            ({
                                id,
                                icon: Icon,
                                number,
                                title,
                                description,
                            }) => (
                                <button
                                    key={id}
                                    type="button"
                                    className={`kids-card kids-card-${id}`}
                                    onClick={() => setActiveActivity(id)}
                                >
                                    <span className="kids-card-number">
                                        {number}
                                    </span>

                                    <span
                                        className="kids-card-icon"
                                        aria-hidden="true"
                                    >
                                        <Icon
                                            size={34}
                                            strokeWidth={1.6}
                                        />
                                    </span>

                                    <span className="kids-card-content">
                                        <strong>{title}</strong>

                                        <span>{description}</span>
                                    </span>

                                    <span
                                        className="kids-card-arrow"
                                        aria-hidden="true"
                                    >
                                        <ArrowRight
                                            size={22}
                                            strokeWidth={1.6}
                                        />
                                    </span>
                                </button>
                            ),
                        )}
                    </div>
                </>
            ) : (
                <div className="kids-activity-stage">
                    <button
                        type="button"
                        className="kids-back-button"
                        onClick={goBack}
                    >
                        <ArrowLeft size={20} />
                        Back to adventures
                    </button>

                    {activeActivity === 'story' && (
                        <div className="kids-stage-content">
                            <span className="kids-eyebrow">
                                HIS STORY
                            </span>

                            <h2>
                                A journey through time
                            </h2>

                            <p>
                                Explore important moments in Dr. B. R.
                                Ambedkar’s life.
                            </p>

                            <div className="kids-story-timeline">
                                {copy.milestones.map(
                                    (milestone, index) => (
                                        <article
                                            key={`${milestone}-${index}`}
                                            className="kids-story-item"
                                        >
                                            <span className="kids-story-year">
                                                {milestoneYears[index]}
                                            </span>

                                            <div>
                                                <h3>{milestone}</h3>

                                                <p>
                                                    Discover this moment and learn
                                                    why it became part of Ambedkar’s
                                                    remarkable journey.
                                                </p>
                                            </div>
                                        </article>
                                    ),
                                )}
                            </div>
                        </div>
                    )}

                    {activeActivity === 'ideas' && (
                        <div className="kids-stage-content">
                            <span className="kids-eyebrow">
                                BIG IDEAS
                            </span>

                            <h2>
                                Ideas that matter
                            </h2>

                            <p>
                                Explore some of the ideas that shaped
                                Ambedkar’s work and public life.
                            </p>

                            <div className="kids-idea-grid">
                                {[
                                    'Equality',
                                    'Education',
                                    'Rights',
                                    'Democracy',
                                ].map((idea) => (
                                    <article
                                        key={idea}
                                        className="kids-idea-card"
                                    >
                                        <Brain
                                            size={28}
                                            strokeWidth={1.6}
                                        />

                                        <h3>{idea}</h3>

                                        <p>
                                            Explore how this idea appears in
                                            Ambedkar’s writings and public work.
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeActivity === 'documents' && (
                        <KidsDocuments onBack={goBack} />
                    )}

                    {activeActivity === 'listen' && (
                        <div className="kids-stage-content">
                            <span className="kids-eyebrow">
                                LISTEN &amp; LEARN
                            </span>

                            <h2>
                                Hear the archive
                            </h2>

                            <p>
                                Listen to stories from the archive and learn
                                about important moments in history.
                            </p>

                            <div className="kids-coming-card">
                                <Headphones
                                    size={36}
                                    strokeWidth={1.6}
                                />

                                <strong>
                                    Audio stories
                                </strong>

                                <span>
                                    Narrated archive stories will appear here.
                                </span>
                            </div>
                        </div>
                    )}

                    {activeActivity === 'quiz' && (
                        <KidsQuiz onBack={goBack} />
                    )}
                </div>
            )}
        </section>
    );
}
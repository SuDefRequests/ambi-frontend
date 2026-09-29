'use client';
import Link from 'next/link';
export default function ArchiveError({ reset }: { reset: () => void }) { return <section className="archive-empty" role="alert"><p className="eyebrow">ARCHIVE TEMPORARILY UNAVAILABLE</p><h1>We couldn’t open this collection.</h1><p>Please try again, or return to the home screen.</p><button className="primary-button" onClick={reset}>Try again</button><Link className="archive-back" href="/">Return Home</Link></section>; }

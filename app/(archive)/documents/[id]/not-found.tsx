import Link from 'next/link';
export default function MissingPassage() { return <section className="archive-empty"><h1>Passage not found.</h1><p>This archive reference is not available. Choose another passage from the collections.</p><Link className="primary-button" href="/search">Browse the archive</Link></section>; }

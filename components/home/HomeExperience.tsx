'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVisit } from '@/components/archive/VisitPreferences';
import { ArrowLeft, ArrowUpRight, Maximize, RotateCcw, LockKeyhole, X } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { Hero } from './Hero';
import { DiscoveryGrid } from './DiscoveryGrid';
import { TimelinePreview } from './TimelinePreview';
import { QuoteSection } from './QuoteSection';
import { Dialog } from '@/components/ui/Dialog';
import { PreferenceSwitch } from '@/components/ui/PreferenceSwitch';
import { copy, milestoneYears, type Language, type Mode, type Destination } from '@/lib/content';
import { destinationHref } from '@/lib/navigation';
import { KidsExperience } from './KidsExperience';

type Panel = 'accessibility' | 'settings' | 'credits' | 'institution' | null;
export function HomeExperience() {
    const router = useRouter();
    const { language, setLanguage, mode, setMode, query, setQuery, largeText, setLargeText, highContrast, setHighContrast, reduceMotion, setReduceMotion } = useVisit();
    const [panel, setPanel] = useState<Panel>(null);
    const [destination, setDestination] = useState<Destination | null>(null);
    const [speaking, setSpeaking] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [notice, setNotice] = useState('');
    const t = copy[language];
    useEffect(() => { document.documentElement.lang = language; }, [language]);
    useEffect(() => { const sync = () => setFullscreen(Boolean(document.fullscreenElement)); document.addEventListener('fullscreenchange', sync); return () => document.removeEventListener('fullscreenchange', sync); }, []);
    useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);
    useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 6500); return () => clearTimeout(timer); }, [notice]);
    function stopAudio() { window.speechSynthesis?.cancel(); setSpeaking(false); }
    function changeLanguage(next: Language) { stopAudio(); setLanguage(next); }
    function changeMode(next: Mode) { setMode(next); if (next === 'institution') setPanel('institution'); else setNotice(copy[language].modeNote); }
    function navigate(next: Destination) { stopAudio(); if (next.kind === 'search') { const trimmed = next.query.trim(); if (!trimmed) return; next = { kind: 'search', query: trimmed }; setQuery(trimmed); } if (next.kind === 'search' || (next.kind === 'exhibit' && (next.id === 'writings' || next.id === 'manuscripts' || next.id === 'connections'))) { router.push(destinationHref(next)); return; } setDestination(next); }
    function narrate() { if (speaking) { stopAudio(); return; } if (!('speechSynthesis' in window)) { setNotice(t.audioUnavailable); return; } const lang = language === 'en' ? 'en-IN' : `${language}-IN`; const voices = window.speechSynthesis.getVoices(); const voice = voices.find(v => v.lang.toLowerCase() === lang.toLowerCase()) || voices.find(v => v.lang.startsWith(language)); if (voices.length && !voice) { setNotice(t.voiceUnavailable); return; } const utterance = new SpeechSynthesisUtterance(`${t.headline}. ${t.headlineEm} ${t.description}`); utterance.lang = lang; if (voice) utterance.voice = voice; utterance.rate = .88; utterance.onend = () => setSpeaking(false); utterance.onerror = () => { setSpeaking(false); setNotice(t.audioUnavailable); }; window.speechSynthesis.speak(utterance); setSpeaking(true); }
    function reset() { stopAudio(); setLanguage('en'); setMode('visitor'); setLargeText(false); setHighContrast(false); setReduceMotion(false); setQuery(''); setPanel(null); setNotice(''); }
    async function toggleFullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { setNotice('Fullscreen is unavailable in this browser.'); } }
    function closeDialog() { setPanel(null); setDestination(null); }
    const destinationTitle = destination?.kind === 'search' ? t.searchPreview : destination?.kind === 'exhibit' ? t.cards[destination.id][0] : destination?.kind === 'milestone' ? `${destination.year} · ${t.milestones[milestoneYears.indexOf(destination.year)]}` : '';
    const dialogTitle = destination ? destinationTitle : panel === 'accessibility' ? t.accessTitle : panel === 'settings' ? t.settingsTitle : panel === 'institution' ? t.modes.institution[0] : t.credits;
    return <div className={`museum-shell ${largeText ? 'large-text' : ''} ${highContrast ? 'high-contrast' : ''} ${reduceMotion ? 'reduced-motion' : ''}`} data-language={language}>
        <a className="skip-link" href="#main-content">Skip to the archive</a>
        <div className="museum-backdrop" aria-hidden="true" />
        <Header language={language} mode={mode} copy={t} speaking={speaking} onLanguage={changeLanguage} onMode={changeMode} onAudio={narrate} onAccessibility={() => setPanel('accessibility')} onSettings={() => setPanel('settings')} />
        <main id="main-content" className="home-main" tabIndex={-1}>
            {mode === 'kids' ? (
                <KidsExperience copy={t} />
            ) : (
                <>
                    <Hero
                        copy={t}
                        query={query}
                        onQuery={setQuery}
                        onNavigate={navigate}
                    />

                    <DiscoveryGrid
                        copy={t}
                        onNavigate={navigate}
                    />

                    <div className="home-closing">
                        <TimelinePreview
                            copy={t}
                            onNavigate={navigate}
                        />

                        <QuoteSection copy={t} />
                    </div>
                </>
            )}
        </main>
        <footer className="site-footer"><span className="footer-motto"><span className="footer-seal" aria-hidden="true">✦</span>{t.footer}</span><span className="footer-center">SAMVIDHAN <span> / </span> HOME PREVIEW</span><button onClick={() => setPanel('credits')}>{t.credits}<ArrowUpRight size={14} /></button></footer>
        <Dialog open={panel !== null || destination !== null} onClose={closeDialog} title={dialogTitle} closeLabel={t.close}>
            {destination && <div className="destination-preview" data-destination={destinationHref(destination)}><span className="preview-label">{t.previewLabel}</span>{destination.kind === 'search' && <p className="preview-query">“{destination.query}”</p>}<p>{destination.kind === 'search' ? t.searchPreviewDescription : t.previewDescription}</p><button className="primary-button" onClick={closeDialog}><ArrowLeft size={19} />{t.home}</button></div>}
            {panel === 'institution' && <div className="institution-preview"><LockKeyhole size={32} strokeWidth={1.4} /><p>{t.institutionNote}</p><button className="primary-button" onClick={closeDialog}>{t.home}<ArrowLeft size={19} /></button></div>}
            {panel === 'accessibility' && <><p className="dialog-intro">{t.accessIntro}</p><PreferenceSwitch label={t.largeText} description={t.largeTextHelp} checked={largeText} onChange={() => setLargeText(!largeText)} /><PreferenceSwitch label={t.contrast} description={t.contrastHelp} checked={highContrast} onChange={() => setHighContrast(!highContrast)} /><PreferenceSwitch label={t.motion} description={t.motionHelp} checked={reduceMotion} onChange={() => setReduceMotion(!reduceMotion)} /></>}
            {panel === 'settings' && <div className="settings-content"><button className="settings-row" onClick={toggleFullscreen}><Maximize size={24} /><span>{fullscreen ? t.exitFullscreen : t.fullscreen}</span><ArrowUpRight size={20} /></button><button className="settings-row" onClick={reset}><RotateCcw size={24} /><span><strong>{t.reset}</strong><small>{t.resetHelp}</small></span></button><p className="settings-note">Preferences apply to this visit. No personal information is stored.</p></div>}
            {panel === 'credits' && <div className="credits-content"><p>A home-screen preview for an inclusive digital heritage archive. Collections and research experiences will be connected in the next stages.</p><h3>Photography & artwork</h3><p>Historical desk portrait: B. R. Ambedkar, 1950; photographer unknown. <a href="https://commons.wikimedia.org/wiki/File:B.R._Ambedkar_in_1950.jpg" target="_blank" rel="noreferrer">Source and image rights <ArrowUpRight size={14} /></a></p><p>The parchment, Parliament backdrop and exhibit still lifes are AI-generated interpretive illustrations, not archival documents. The ideas diagram is a visual introduction, not a live knowledge graph.</p><h3>Words from the archive</h3><p>“Educate, agitate and organize.” — address of 20 July 1942. <a href="https://www.mea.gov.in/Images/CPV/Volume17_Part_III.pdf" target="_blank" rel="noreferrer">Writings and Speeches, Volume 17, Part III <ArrowUpRight size={14} /></a></p><p>Hindi and Marathi interface translations are editorial drafts for review.</p></div>}
        </Dialog>
        {notice && <div className="visitor-notice" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label={t.close}><X size={19} /></button></div>}
    </div>;
}

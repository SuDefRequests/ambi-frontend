'use client';

import { useEffect, useRef, useState } from 'react';
import { Headphones, Pause, Play, Square } from 'lucide-react';

type Language = 'en' | 'hi' | 'mr';
type State = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export function ReaderNarration({
  passageId,
  text,
}: {
  passageId: string;
  text: string;
}) {
  return <Narration key={passageId} text={text} />;
}

// Mount one instance per displayed text; unmounting cancels and releases audio.
export function Narration({
  text,
  listenLabel = 'Listen to this passage',
  language = 'en',
}: {
  text: string;
  listenLabel?: string;
  language?: Language;
}) {
  const [state, setState] = useState<State>('idle');
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const url = useRef<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const operation = useRef(0);

  function releaseAudio() {
    if (audio.current) {
      audio.current.onended = null;
      audio.current.onerror = null;
      audio.current.pause();
      audio.current.removeAttribute('src');
      audio.current.load();
      audio.current = null;
    }

    if (url.current) URL.revokeObjectURL(url.current);
    url.current = null;
  }

  useEffect(() => () => {
    operation.current++;
    request.current?.abort();
    releaseAudio();
  }, []);

  function stop() {
    operation.current++;
    request.current?.abort();
    request.current = null;

    if (audio.current) {
      audio.current.pause();
      audio.current.currentTime = 0;
    }

    setPlaybackBlocked(false);
    setState('idle');
  }

  async function listen() {
    if (state === 'loading') return;

    if (state === 'playing' && audio.current) {
      audio.current.pause();
      setState('paused');
      return;
    }

    const current = ++operation.current;
    setPlaybackBlocked(false);
    setState('loading');

    if (!audio.current) {
      const controller = new AbortController();
      request.current = controller;

      try {
        const response = await fetch('/api/audio/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: 'alloy',
            language,
          }),
          signal: controller.signal,
        });

        if (
          !response.ok ||
          response.headers.get('content-type')?.split(';')[0] !== 'audio/mpeg'
        ) {
          throw new Error('Narration unavailable');
        }

        const blob = await response.blob();

        if (current !== operation.current) return;
        if (!blob.size) throw new Error('Empty narration');

        url.current = URL.createObjectURL(blob);

        const player = new Audio(url.current);
        audio.current = player;

        player.onended = () => {
          player.currentTime = 0;
          setState('ended');
        };

        player.onerror = () => {
          operation.current++;
          releaseAudio();
          setState('error');
        };
      } catch {
        if (current !== operation.current) return;

        releaseAudio();
        setState('error');
        return;
      } finally {
        if (request.current === controller) {
          request.current = null;
        }
      }
    }

    const player = audio.current;

    if (!player || current !== operation.current) return;

    try {
      await player.play();

      if (current === operation.current) {
        setState('playing');
      }
    } catch {
      if (current === operation.current) {
        setPlaybackBlocked(true);
        setState('paused');
      }
    }
  }

  const label =
    state === 'loading'
      ? 'Preparing audio…'
      : state === 'playing'
        ? 'Pause narration'
        : state === 'paused'
          ? 'Resume narration'
          : listenLabel;

  const Icon =
    state === 'playing'
      ? Pause
      : state === 'paused'
        ? Play
        : Headphones;

  const status =
    state === 'error'
      ? 'Narration is unavailable at the moment. Please try again.'
      : playbackBlocked
        ? 'Playback could not start. Select Resume narration to try again.'
        : state === 'loading'
          ? 'Preparing audio…'
          : state === 'playing'
            ? 'Narration playing.'
            : state === 'paused'
              ? 'Narration paused.'
              : state === 'ended'
                ? 'Narration complete.'
                : '';

  return (
    <div className="reader-narration">
      <div className="narration-controls">
        <button
          type="button"
          className="primary-button"
          onClick={listen}
          disabled={state === 'loading'}
        >
          <Icon size={20} aria-hidden="true" />
          {label}
        </button>

        {['loading', 'playing', 'paused'].includes(state) && (
          <button
            type="button"
            className="narration-stop"
            onClick={stop}
          >
            <Square size={16} aria-hidden="true" />
            Stop narration
          </button>
        )}
      </div>

      <p className="narration-status" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
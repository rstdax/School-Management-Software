import React, { useEffect, useRef, useState } from 'react';

interface PageTransitionProps {
  screenKey: string;
  direction: 'forward' | 'back';
  children: React.ReactNode;
}

/**
 * Wraps any screen with a slide animation whenever `screenKey` changes.
 * - forward  → new page slides in from the right
 * - back     → new page slides in from the left
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  screenKey,
  direction,
  children,
}) => {
  const [displayKey, setDisplayKey] = useState(screenKey);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<'idle' | 'enter'>('idle');
  const pendingRef = useRef<{ key: string; children: React.ReactNode } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (screenKey === displayKey) {
      // Same screen — just update children in place (e.g. step change inside signup)
      setDisplayChildren(children);
      return;
    }

    // Store incoming
    pendingRef.current = { key: screenKey, children };

    // Kick off enter phase on next frame so the browser has painted the old screen
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (pendingRef.current) {
        setDisplayKey(pendingRef.current.key);
        setDisplayChildren(pendingRef.current.children);
        setPhase('enter');
        pendingRef.current = null;
      }
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenKey, children]);

  // After the animation completes, reset to idle
  const handleAnimationEnd = () => setPhase('idle');

  const animClass =
    phase === 'enter'
      ? direction === 'forward'
        ? 'page-slide-from-right'
        : 'page-slide-from-left'
      : '';

  return (
    <div
      key={displayKey}
      className={`page-transition-wrapper ${animClass}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {displayChildren}
    </div>
  );
};

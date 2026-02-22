import { useState, useEffect, useCallback } from 'react';

interface TutorialRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

interface UseTutorialPositionResult {
  rect: TutorialRect | null;
  targetFound: boolean;
}

const PADDING = 4;

function getTargetRect(target: string): TutorialRect | null {
  const el = document.querySelector(`[data-tutorial="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PADDING,
    left: r.left - PADDING,
    width: r.width + PADDING * 2,
    height: r.height + PADDING * 2,
    bottom: r.bottom + PADDING,
    right: r.right + PADDING,
  };
}

function scrollIntoViewIfNeeded(target: string) {
  const el = document.querySelector(`[data-tutorial="${target}"]`);
  if (!el) return;
  const r = el.getBoundingClientRect();
  const inView = r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth;
  if (!inView) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  }
}

export function useTutorialPosition(target: string): UseTutorialPositionResult {
  const [rect, setRect] = useState<TutorialRect | null>(null);
  const [targetFound, setTargetFound] = useState(false);

  const measure = useCallback(() => {
    const r = getTargetRect(target);
    setRect(r);
    setTargetFound(r !== null);
  }, [target]);

  useEffect(() => {
    scrollIntoViewIfNeeded(target);

    // Small delay to allow scroll to settle
    const initialTimeout = setTimeout(measure, 50);

    const handleScroll = () => measure();
    const handleResize = () => measure();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(initialTimeout);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [target, measure]);

  return { rect, targetFound };
}

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';
import { Brain, FileText, GitBranch, HelpCircle, LayoutList, Sparkles, Users } from 'lucide-react';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { HeroBackground } from './HeroBackground';
import { SlideCard } from './SlideCard';

export function AuthHero() {
  const { t } = useTranslation(I18N_NAMESPACES.AUTH);

  const wrapRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);

  // Cursor + sparkles
  const cursorRef = useRef<HTMLDivElement>(null);
  const sp0 = useRef<HTMLDivElement>(null);
  const sp1 = useRef<HTMLDivElement>(null);
  const sp2 = useRef<HTMLDivElement>(null);

  // Panels — each absolutely positioned, independently animated
  const panelPresRef = useRef<HTMLDivElement>(null);
  const panelMapRef = useRef<HTMLDivElement>(null);
  const panelQuizRef = useRef<HTMLDivElement>(null);
  const panelClassRef = useRef<HTMLDivElement>(null);

  // Outline panel ref
  const panelOutlineRef = useRef<HTMLDivElement>(null);
  const outR0 = useRef<HTMLDivElement>(null);
  const outR1 = useRef<HTMLDivElement>(null);
  const outR2 = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  // Slide refs
  const s1 = useRef<HTMLDivElement>(null);
  const s2 = useRef<HTMLDivElement>(null);
  const s3 = useRef<HTMLDivElement>(null);

  // Mindmap refs
  const mapSvgRef = useRef<SVGSVGElement>(null);
  const lineA = useRef<SVGPathElement>(null);
  const lineB = useRef<SVGPathElement>(null);
  const lineC = useRef<SVGPathElement>(null);
  const nodeA = useRef<HTMLDivElement>(null);
  const nodeB = useRef<HTMLDivElement>(null);
  const nodeC = useRef<HTMLDivElement>(null);

  // Quiz refs
  const qOpt0 = useRef<HTMLDivElement>(null);
  const qOpt1 = useRef<HTMLDivElement>(null);
  const qOpt2 = useRef<HTMLDivElement>(null);
  const qCheck = useRef<HTMLDivElement>(null);

  // Class refs
  const cr0 = useRef<HTMLDivElement>(null);
  const cr1 = useRef<HTMLDivElement>(null);
  const cr2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const allPanels = [
        panelPresRef.current,
        panelMapRef.current,
        panelQuizRef.current,
        panelClassRef.current,
      ];

      // ── Hidden state ──────────────────────────────────────────────────
      gsap.set([headerRef.current, promptRef.current], { opacity: 0, y: 14 });
      gsap.set(cursorRef.current, { opacity: 0, x: 0, y: 0 });
      gsap.set([sp0.current, sp1.current, sp2.current], { opacity: 0, scale: 0 });

      const panelFrom = [
        { x: -60, y: -30, scale: 0.75 }, // pres   — top-left
        { x: 60, y: -30, scale: 0.75 }, // map    — top-right
        { x: -60, y: 30, scale: 0.75 }, // quiz   — bottom-left
        { x: 60, y: 30, scale: 0.75 }, // class  — bottom-right
      ];
      allPanels.forEach((el, i) => {
        gsap.set(el, { opacity: 0, ...panelFrom[i] });
      });

      gsap.set(panelOutlineRef.current, { opacity: 0, x: -60, y: -30, scale: 0.75 });
      gsap.set([outR0.current, outR1.current, outR2.current], { opacity: 0, x: -10 });
      gsap.set(arrowRef.current, { opacity: 0, x: -6 });

      gsap.set([s1.current, s2.current, s3.current], { opacity: 0, x: -10 });
      gsap.set([lineA.current, lineB.current, lineC.current], { opacity: 0, strokeDashoffset: 110 });
      gsap.set([nodeA.current, nodeB.current, nodeC.current], {
        opacity: 0,
        scale: 0.3,
        transformOrigin: 'center',
      });
      gsap.set([qOpt0.current, qOpt1.current, qOpt2.current], { opacity: 0, x: -8 });
      gsap.set(qCheck.current, { opacity: 0, scale: 0 });
      gsap.set([cr0.current, cr1.current, cr2.current], { opacity: 0, x: 10 });

      // ── Master timeline ───────────────────────────────────────────────
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2, defaults: { ease: 'power3.out' } });

      // Header
      tl.to(headerRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' });
      tl.to(promptRef.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.15');

      // Cursor click
      tl.to(cursorRef.current, { opacity: 1, duration: 0.12 }, '+=0.2');
      tl.to(cursorRef.current, { x: 38, y: 4, duration: 0.45, ease: 'power2.inOut' });
      tl.to(cursorRef.current, { scale: 0.8, duration: 0.07 });
      tl.to(cursorRef.current, { scale: 1, duration: 0.1 });
      tl.to(
        [sp0.current, sp1.current, sp2.current],
        { opacity: 1, scale: 1, duration: 0.16, stagger: 0.05, ease: 'back.out(3)' },
        '<'
      );
      tl.to(
        [sp0.current, sp1.current, sp2.current],
        { opacity: 0, scale: 0, duration: 0.18, stagger: 0.04 },
        '+=0.08'
      );
      tl.to(cursorRef.current, { opacity: 0, duration: 0.15 });

      // Phase 1 — outline + map + quiz + class fly in together
      tl.to(
        panelOutlineRef.current,
        { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
        '+=0.1'
      );
      tl.to(
        panelMapRef.current,
        { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
        '<'
      );
      tl.to(
        panelQuizRef.current,
        { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
        '<'
      );
      tl.to(
        panelClassRef.current,
        { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
        '<'
      );
      // Outline rows stream in
      tl.to(
        [outR0.current, outR1.current, outR2.current],
        { opacity: 1, x: 0, duration: 0.26, stagger: 0.16 },
        '-=0.1'
      );
      // Hold so user reads the outline
      tl.to({}, { duration: 0.36 });

      // Phase 2 — arrow appears, then presentation flies in
      tl.to(arrowRef.current, { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' });
      tl.to(
        panelPresRef.current,
        { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
        '-=0.1'
      );

      // Slide cards
      tl.to(
        [s1.current, s2.current, s3.current],
        { opacity: 1, x: 0, duration: 0.28, stagger: 0.1 },
        '+=0.1'
      );

      // Mindmap draw
      tl.to(
        [lineA.current, lineB.current, lineC.current],
        { opacity: 1, strokeDashoffset: 0, duration: 0.36, stagger: 0.1, ease: 'power2.inOut' },
        '-=0.05'
      );
      tl.to(
        [nodeA.current, nodeB.current, nodeC.current],
        { opacity: 1, scale: 1, duration: 0.28, stagger: 0.1, ease: 'back.out(1.8)' },
        '-=0.12'
      );

      // Quiz cascade + checkmark
      tl.to(
        [qOpt0.current, qOpt1.current, qOpt2.current],
        { opacity: 1, x: 0, duration: 0.22, stagger: 0.1 },
        '-=0.15'
      );
      tl.to(qCheck.current, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(2.5)' }, '+=0.1');

      // Class rows
      tl.to(
        [cr0.current, cr1.current, cr2.current],
        { opacity: 1, x: 0, duration: 0.22, stagger: 0.1 },
        '-=0.1'
      );

      // Hold
      tl.to({}, { duration: 3.5 });

      // Scatter out — panels fly away in their own directions again
      tl.to(panelPresRef.current, {
        opacity: 0,
        x: -70,
        y: -50,
        scale: 0.75,
        duration: 0.4,
        ease: 'power2.in',
      });
      tl.to(
        panelMapRef.current,
        { opacity: 0, x: 70, y: -55, scale: 0.75, duration: 0.4, ease: 'power2.in' },
        '<+0.06'
      );
      tl.to(
        panelQuizRef.current,
        { opacity: 0, x: -55, y: 70, scale: 0.75, duration: 0.4, ease: 'power2.in' },
        '<+0.06'
      );
      tl.to(
        panelClassRef.current,
        { opacity: 0, x: 60, y: 65, scale: 0.75, duration: 0.4, ease: 'power2.in' },
        '<+0.06'
      );
      tl.to(
        [headerRef.current, promptRef.current],
        { opacity: 0, y: -10, duration: 0.35, ease: 'power2.in' },
        '<+0.05'
      );
      tl.to(
        [panelOutlineRef.current, arrowRef.current],
        { opacity: 0, x: -30, duration: 0.35, ease: 'power2.in' },
        '<'
      );

      // Reset
      tl.set([headerRef.current, promptRef.current], { y: 14 });
      tl.set(cursorRef.current, { x: 0, y: 0 });
      allPanels.forEach((el, i) => tl.set(el, panelFrom[i]));
      tl.set(panelOutlineRef.current, { opacity: 0, x: -60, y: -30, scale: 0.75 });
      tl.set([outR0.current, outR1.current, outR2.current], { opacity: 0, x: -10 });
      tl.set(arrowRef.current, { opacity: 0, x: -6 });
      tl.set([s1.current, s2.current, s3.current], { opacity: 0, x: -10 });
      tl.set([lineA.current, lineB.current, lineC.current], { strokeDashoffset: 110, opacity: 0 });
      tl.set([nodeA.current, nodeB.current, nodeC.current], { scale: 0.3, opacity: 0 });
      tl.set([qOpt0.current, qOpt1.current, qOpt2.current], { x: -8, opacity: 0 });
      tl.set(qCheck.current, { scale: 0, opacity: 0 });
      tl.set([cr0.current, cr1.current, cr2.current], { x: 10, opacity: 0 });

      // Ambient independent float per panel (after they land)
      const floatParams = [
        { y: 8, dur: 3.2 },
        { y: 6, dur: 2.8 },
        { y: 10, dur: 3.6 },
        { y: 7, dur: 3.0 },
      ];
      allPanels.forEach((el, i) => {
        const fp = floatParams[i];
        gsap.to(el, {
          y: `+=${fp.y}`,
          duration: fp.dur,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.5,
        });
      });
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  const classes = [
    { label: t('login.heroClass1'), count: 28 },
    { label: t('login.heroClass2'), count: 31 },
    { label: t('login.heroClass3'), count: 24 },
  ];

  return (
    <div
      ref={wrapRef}
      className="bg-muted relative flex h-full min-h-screen w-full select-none overflow-hidden"
    >
      <HeroBackground />

      {/* ── 3-row layout, cards offset horizontally to break grid feel ── */}
      <div
        className="relative z-10 flex w-full flex-col items-center justify-center gap-6 px-10 py-10"
        style={{ minHeight: '100vh' }}
      >
        {/* Row 1 — outline → pres left-of-centre, mindmap right-leaning */}
        <div className="flex w-full items-end justify-center gap-3">
          {/* Outline panel — mimics the real OutlineCard layout (accent strip left + content right) */}
          <div
            ref={panelOutlineRef}
            className="bg-background/95 w-52 rounded-xl border shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-1.5 border-b px-3 py-2">
              <LayoutList className="text-primary h-3 w-3" />
              <span className="text-[10px] font-semibold">{t('login.heroFeatureOutline')}</span>
            </div>
            <div className="space-y-1.5 p-2">
              {(
                [
                  { ref: outR0, label: t('login.heroOutlineChapter1') },
                  { ref: outR1, label: t('login.heroOutlineChapter2') },
                  { ref: outR2, label: t('login.heroOutlineChapter3') },
                ] as const
              ).map(({ ref, label }, i) => (
                <div key={i} ref={ref} className="flex overflow-hidden rounded-lg border shadow-sm">
                  {/* Left accent strip — like the real card header */}
                  <div className="bg-accent flex w-8 flex-shrink-0 items-center justify-center rounded-l-lg">
                    <span className="text-muted-foreground text-[9px] font-bold">{i + 1}</span>
                  </div>
                  {/* Right content — heading + skeleton bullet lines */}
                  <div className="flex-1 space-y-1 px-2 py-1.5">
                    <p className="text-[9px] font-semibold leading-tight">{label}</p>
                    <div className="space-y-0.5">
                      <div className="bg-muted h-1 w-full rounded-full" />
                      <div className="bg-muted h-1 w-4/5 rounded-full" />
                      <div className="bg-muted h-1 w-3/5 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow connector — only visible when both outline and pres are showing */}
          <div ref={arrowRef} className="text-primary/50 mb-4 flex-shrink-0 self-end pb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10h12M12 6l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div
            ref={panelPresRef}
            className="bg-background/95 w-52 rounded-xl border p-4 shadow-lg backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center gap-1.5">
              <FileText className="text-primary h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold">{t('login.heroFeaturePresentation')}</span>
            </div>
            <div className="space-y-1.5">
              <div ref={s1}>
                <SlideCard title={t('login.heroSlide1')} lines={[75, 55, 65]} />
              </div>
              <div ref={s2}>
                <SlideCard title={t('login.heroSlide2')} lines={[80, 60, 70]} showImage />
              </div>
              <div ref={s3}>
                <SlideCard title={t('login.heroSlide3')} lines={[65, 50]} />
              </div>
            </div>
          </div>

          {/* spacer pushes mindmap rightward */}
          <div className="w-8" />

          <div
            ref={panelMapRef}
            className="bg-background/95 -mb-8 w-56 rounded-xl border p-4 shadow-lg backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center gap-1.5">
              <GitBranch className="text-primary h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold">{t('login.heroFeatureMindmap')}</span>
            </div>
            <div className="relative" style={{ height: '120px' }}>
              <svg
                ref={mapSvgRef}
                viewBox="0 0 200 130"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
              >
                <path
                  ref={lineA}
                  d="M 72 65 Q 120 18 168 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="110"
                  className="text-primary/40"
                />
                <path
                  ref={lineB}
                  d="M 72 65 Q 120 112 168 112"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="110"
                  className="text-primary/40"
                />
                <path
                  ref={lineC}
                  d="M 72 65 Q 44 95 22 105"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="80"
                  className="text-primary/40"
                />
              </svg>
              <div
                className="absolute"
                style={{ top: '50%', left: '36%', transform: 'translate(-50%,-50%)' }}
              >
                <div className="border-primary bg-primary text-primary-foreground rounded-lg border px-2 py-1 text-[10px] font-bold shadow-sm">
                  {t('login.heroNodeRoot')}
                </div>
              </div>
              <div
                ref={nodeA}
                style={{ position: 'absolute', top: '4%', right: '10%', transformOrigin: 'center' }}
              >
                <div className="bg-background/90 rounded-lg border px-2 py-1 text-[10px] font-semibold shadow-sm backdrop-blur-sm">
                  {t('login.heroNodeA')}
                </div>
              </div>
              <div
                ref={nodeB}
                style={{ position: 'absolute', bottom: '4%', right: '10%', transformOrigin: 'center' }}
              >
                <div className="bg-background/90 rounded-lg border px-2 py-1 text-[10px] font-semibold shadow-sm backdrop-blur-sm">
                  {t('login.heroNodeB')}
                </div>
              </div>
              <div
                ref={nodeC}
                style={{ position: 'absolute', bottom: '10%', left: '0%', transformOrigin: 'center' }}
              >
                <div className="bg-background/90 rounded-lg border px-2 py-1 text-[10px] font-semibold shadow-sm backdrop-blur-sm">
                  {t('login.heroNodeC')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 — logo + prompt, centred */}
        <div className="flex flex-col items-center gap-3">
          <div ref={headerRef} className="flex items-center gap-3">
            {/* <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
              <span className="text-xl font-black text-primary-foreground">AI</span>
            </div> */}
            <div className="flex flex-col items-center">
              <p className="text-foreground text-base font-bold leading-tight">E-Learning</p>
              <p className="text-muted-foreground text-xs">{t('login.heroTagline')}</p>
            </div>
          </div>

          <div ref={promptRef} className="relative w-72">
            <div className="bg-background flex items-center gap-2 rounded-xl border px-3 py-2.5 shadow-md">
              <Sparkles className="text-primary h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-muted-foreground truncate text-xs">{t('login.heroPromptTopic')}</span>
              <div className="bg-primary text-primary-foreground ml-auto flex-shrink-0 rounded-md px-2.5 py-1 text-[10px] font-semibold">
                {t('login.heroPromptButton')}
              </div>
            </div>
            <div ref={cursorRef} className="pointer-events-none absolute bottom-1 right-9 h-4 w-4">
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M2 2l10 5-5 1-2 5z" fill="currentColor" className="text-foreground" />
              </svg>
            </div>
            {[
              { ref: sp0, top: '-5px', right: '56px', cls: 'bg-primary' },
              { ref: sp1, top: '0px', right: '47px', cls: 'bg-primary/60' },
              { ref: sp2, top: '4px', right: '62px', cls: 'bg-primary/35' },
            ].map(({ ref, top, right, cls }) => (
              <div
                key={top}
                ref={ref}
                className={`pointer-events-none absolute h-1.5 w-1.5 rounded-full ${cls}`}
                style={{ top, right }}
              />
            ))}
          </div>
        </div>

        {/* Row 3 — quiz right-of-centre, classroom left-leaning */}
        <div className="flex w-full items-start justify-center gap-5">
          <div
            ref={panelClassRef}
            className="bg-background/95 -mt-6 w-52 rounded-xl border p-4 shadow-lg backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center gap-1.5">
              <Users className="text-primary h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold">{t('login.heroFeatureClassroom')}</span>
            </div>
            <div className="space-y-2">
              {classes.map(({ label, count }, i) => (
                <div key={i} ref={[cr0, cr1, cr2][i]} className="flex items-center gap-2">
                  <div className="bg-primary/10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md">
                    <Brain className="text-primary h-3 w-3" />
                  </div>
                  <span className="flex-1 truncate text-[10px] font-medium">{label}</span>
                  <span className="text-muted-foreground text-[9px]">
                    {t('login.heroStudents', { count })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* spacer pushes quiz rightward */}
          <div className="w-20" />

          <div
            ref={panelQuizRef}
            className="bg-background/95 w-52 rounded-xl border p-4 shadow-lg backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center gap-1.5">
              <HelpCircle className="text-primary h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold">{t('login.heroFeatureQuiz')}</span>
            </div>
            <div className="mb-2 space-y-1">
              <div className="bg-muted h-1.5 w-full rounded-full" />
              <div className="bg-muted h-1.5 w-3/4 rounded-full" />
            </div>
            <div className="space-y-1.5">
              {(['A', 'B', 'C'] as const).map((opt, i) => {
                const refs = [qOpt0, qOpt1, qOpt2];
                const correct = i === 1;
                return (
                  <div
                    key={opt}
                    ref={refs[i]}
                    className={`relative flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] ${
                      correct ? 'border-primary/40 bg-primary/10 text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <span className="font-bold">{opt}.</span>
                    <div
                      className={`h-1 flex-1 rounded-full ${correct ? 'bg-primary/40' : 'bg-muted'}`}
                      style={{ maxWidth: `${[60, 85, 50][i]}%` }}
                    />
                    {correct && (
                      <div
                        ref={qCheck}
                        className="bg-primary ml-auto flex h-3.5 w-3.5 items-center justify-center rounded-full"
                      >
                        <svg viewBox="0 0 8 8" className="text-primary-foreground h-2 w-2" fill="none">
                          <path
                            d="M1.5 4l2 2 3-3"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

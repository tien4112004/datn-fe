import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { Button } from '@ui/button';
import {
  ArrowRight,
  FileText,
  GitBranch,
  HelpCircle,
  ClipboardList,
  Users,
  ImageIcon,
  Sparkles,
  Check,
  Menu,
  X,
  Lightbulb,
  GraduationCap,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { LanguageSwitcher } from '@/features/auth/components/LanguageSwitcher';
import { useEffect, useRef, useState } from 'react';

// ── Data ─────────────────────────────────────────────────────────────

const OWNER = { name: 'Nguyen Le Hoang Dung' };

const DEVELOPERS = [
  { name: 'Phan Thanh Tien' },
  { name: 'Nguyen Bui Vuong Tien' },
  { name: 'Luu Thai Toan' },
  { name: 'Hoang Tien Huy' },
  { name: 'Ly Trong Tin' },
] as const;

const STATS = [
  { key: 'presentations' as const, value: 1200, icon: FileText },
  { key: 'mindmaps' as const, value: 850, icon: GitBranch },
  { key: 'questions' as const, value: 5000, icon: HelpCircle },
  { key: 'classes' as const, value: 320, icon: Users },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

// ── Animated counter ─────────────────────────────────────────────────

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return n.toString();
}

// ── Main component ───────────────────────────────────────────────────

export function LandingPage() {
  const { t } = useTranslation(I18N_NAMESPACES.LANDING);
  const year = new Date().getFullYear();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background text-foreground relative min-h-screen overflow-x-hidden">
      <BackgroundDecor />
      <PointerGlow />

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="border-border/40 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-lg">E-Learning</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.features')}
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.howItWorks')}
            </a>
            <a href="#team" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.team')}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">{t('nav.signIn')}</Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/register">{t('nav.getStarted')}</Link>
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground relative z-50 -mr-2 p-2 md:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-background border-border/40 border-t px-6 pb-6 pt-4 md:hidden"
          >
            <nav className="flex flex-col gap-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-foreground text-sm font-medium">
                {t('nav.features')}
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-foreground text-sm font-medium">
                {t('nav.howItWorks')}
              </a>
              <a href="#team" onClick={() => setMobileMenuOpen(false)} className="text-foreground text-sm font-medium">
                {t('nav.team')}
              </a>
              <div className="border-border/40 flex gap-3 border-t pt-4">
                <Button asChild variant="ghost" size="sm" className="flex-1">
                  <Link to="/login">{t('nav.signIn')}</Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link to="/register">{t('nav.getStarted')}</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      <main className="relative z-10">
        {/* ── Hero (Stitch: centered layout with floating cards) ── */}
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — centered text */}
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <span className="border-border/80 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                <span className="bg-primary relative flex h-1.5 w-1.5 rounded-full">
                  <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
                </span>
                {t('hero.badge')}
              </span>

              <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]">
                {t('hero.title').split('AI.')[0]}
                <span className="text-primary">AI</span>.
              </h1>

              <p className="text-muted-foreground mt-6 max-w-lg text-base leading-relaxed sm:text-lg">
                {t('hero.subtitle')}
              </p>

              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="group rounded-xl px-8">
                  <Link to="/register">
                    {t('hero.primaryCta')}
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl px-8">
                  <Link to="/login">{t('hero.secondaryCta')}</Link>
                </Button>
              </div>
            </motion.div>

            {/* Right — GSAP floating mockup cards */}
            <div className="relative hidden lg:block">
              <HeroMockup />
            </div>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────── */}
        <section className="border-border/40 bg-muted/30 border-y">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {STATS.map((stat, i) => (
                <StatCard key={stat.key} stat={stat} index={i} t={t} />
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────── */}
        <section id="how-it-works" className="relative overflow-hidden py-24">
          {/* Dot grid bg */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'radial-gradient(currentColor 0.5px, transparent 0.5px)',
              backgroundSize: '24px 24px',
              color: 'var(--muted-foreground)',
            }}
          />
          <div className="relative mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
              className="mb-16 text-center"
            >
              <span className="text-primary mb-4 block text-[12px] font-bold uppercase tracking-[0.2em]">
                {t('howItWorks.eyebrow')}
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                {t('howItWorks.title')}
              </h2>
            </motion.div>

            <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Connector arrows (desktop) */}
              <div className="pointer-events-none absolute left-1/3 top-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 opacity-20 md:block">
                <ChevronRight className="text-primary h-9 w-9" />
              </div>
              <div className="pointer-events-none absolute left-2/3 top-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 opacity-20 md:block">
                <ChevronRight className="text-primary h-9 w-9" />
              </div>

              {[
                { key: 'create', icon: Lightbulb, step: '01' },
                { key: 'teach', icon: BookOpen, step: '02' },
                { key: 'learn', icon: GraduationCap, step: '03' },
              ].map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="border-border/30 hover:border-primary/20 bg-background group relative z-10 rounded-2xl border p-8 transition-all duration-300 hover:shadow-xl"
                >
                  <span className="text-primary/5 pointer-events-none absolute right-8 top-6 select-none text-5xl font-black">
                    {item.step}
                  </span>
                  <div className="bg-primary/10 text-primary mb-6 flex h-14 w-14 items-center justify-center rounded-xl">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold">{t(`howItWorks.steps.${item.key}.title`)}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(`howItWorks.steps.${item.key}.description`)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features bento grid ──────────────────────────────── */}
        <section id="features" className="bg-muted/30 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
              className="mx-auto mb-16 max-w-2xl text-center"
            >
              <span className="text-primary mb-4 block text-[12px] font-bold uppercase tracking-[0.2em]">
                {t('features.eyebrow')}
              </span>
              <h2 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
                {t('features.title')}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t('features.subtitle')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-6">
              {/* AI Presentations (wide — 4 cols) */}
              <BentoTile eyebrowIcon={FileText} className="flex flex-col overflow-hidden md:col-span-4">
                <h3 className="text-xl font-bold">{t('features.items.presentation.title')}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{t('features.items.presentation.description')}</p>
                <SlidesPreviewStitch />
              </BentoTile>

              {/* Interactive Mindmaps (2 cols) */}
              <BentoTile eyebrowIcon={GitBranch} className="flex flex-col md:col-span-2">
                <h3 className="text-xl font-bold">{t('features.items.mindmap.title')}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{t('features.items.mindmap.description')}</p>
                <MindmapPreviewStitch />
              </BentoTile>

              {/* Question Bank (2 cols) */}
              <BentoTile eyebrowIcon={HelpCircle} className="flex flex-col md:col-span-2">
                <h3 className="text-xl font-bold">{t('features.items.questionBank.title')}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{t('features.items.questionBank.description')}</p>
                <QuizPreviewStitch />
              </BentoTile>

              {/* Assignments & Grading (2 cols) */}
              <BentoTile eyebrowIcon={ClipboardList} className="flex flex-col md:col-span-2">
                <h3 className="text-xl font-bold">{t('features.items.assignment.title')}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{t('features.items.assignment.description')}</p>
                <AssignmentPreviewStitch />
              </BentoTile>

              {/* Classes & Feed (2 cols) */}
              <BentoTile eyebrowIcon={Users} className="flex flex-col md:col-span-2">
                <h3 className="text-xl font-bold">{t('features.items.classes.title')}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{t('features.items.classes.description')}</p>
                <ClassesPreviewStitch />
              </BentoTile>

              {/* Image Generation (full width — 6 cols) */}
              <BentoTile eyebrowIcon={ImageIcon} className="flex flex-col md:col-span-4 lg:col-span-6">
                <h3 className="text-xl font-bold">{t('features.items.image.title')}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{t('features.items.image.description')}</p>
                <ImagePreviewStitch />
              </BentoTile>
            </div>
          </div>
        </section>

        {/* ── Team (Stitch: avatar circles layout) ─────────── */}
        <section id="team" className="border-border/40 border-t">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.2em]">
                {t('team.eyebrow')}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t('team.title')}</h2>
              <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed">
                {t('team.subtitle')}
              </p>
            </motion.div>

            <div className="mt-14 grid gap-16 lg:grid-cols-[auto_1fr]">
              {/* Owner — Stitch style: centered column with large avatar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  {t('team.owner')}
                </p>
                <div className="mt-6 flex flex-col items-center gap-3 lg:items-start">
                  <div className="bg-primary text-primary-foreground flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold shadow-lg">
                    {getInitials(OWNER.name)}
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-lg font-bold">{OWNER.name}</p>
                    <p className="text-muted-foreground text-sm">{t('team.owner')}</p>
                  </div>
                </div>
              </motion.div>

              {/* Developers — Stitch style: grid of circular avatars */}
              <div>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  {t('team.developer')}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                  {DEVELOPERS.map((dev, i) => (
                    <motion.div
                      key={dev.name}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                      className="flex flex-col items-center gap-3 text-center"
                    >
                      <div className="bg-primary/80 text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full text-sm font-bold shadow-md">
                        {getInitials(dev.name)}
                      </div>
                      <p className="text-sm font-semibold leading-tight">{dev.name}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA (Stitch: gradient card with dot overlay) ── */}
        <section className="border-border/40 border-t">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl"
            >
              {/* Gradient bg */}
              <div className="from-primary via-primary/90 to-primary/70 absolute inset-0 bg-gradient-to-br" />
              {/* Dot overlay */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                  backgroundSize: '20px 20px',
                }}
              />
              <div className="relative px-8 py-20 text-center sm:px-16">
                <h2 className="text-primary-foreground text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  {t('cta.title')}
                </h2>
                <p className="text-primary-foreground/80 mx-auto mt-5 max-w-lg text-base leading-relaxed">
                  {t('cta.subtitle')}
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild size="lg" variant="secondary" className="group rounded-xl px-8 font-semibold">
                    <Link to="/register">
                      {t('cta.primary')}
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="rounded-xl border border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Link to="/login">{t('cta.secondary')}</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── Footer (Stitch: 4-col grid) ────────────────────── */}
      <footer className="border-border/40 relative z-10 border-t">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 font-semibold">
                <span className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-lg">E-Learning</span>
              </Link>
              <p className="text-muted-foreground mt-3 max-w-xs text-sm leading-relaxed">
                {t('footer.tagline')}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold">{t('footer.product')}</p>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <a href="#features" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {t('footer.features')}
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {t('footer.howItWorks')}
                  </a>
                </li>
                <li>
                  <a href="#team" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {t('footer.team')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold">{t('footer.resources')}</p>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <Link to="/register" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {t('footer.getStarted')}
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    {t('footer.signIn')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-border/40 text-muted-foreground mt-10 border-t pt-6 text-center text-xs">
            {t('footer.copyright', { year })}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────────────

function StatCard({
  stat,
  index,
  t,
}: {
  stat: (typeof STATS)[number];
  index: number;
  t: (key: string) => string;
}) {
  const { count, ref } = useCountUp(stat.value);
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="text-center"
    >
      <p className="text-primary text-3xl font-bold tracking-tight sm:text-4xl">
        {formatCount(count)}+
      </p>
      <div className="text-muted-foreground mt-2 flex items-center justify-center gap-1.5 text-sm">
        <Icon className="h-4 w-4" />
        <span>{t(`stats.${stat.key}`)}</span>
      </div>
    </motion.div>
  );
}

// ── Pointer glow ─────────────────────────────────────────────────────

function PointerGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.style.opacity = '1';
    };

    const onLeave = () => {
      el.style.opacity = '0';
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden
      className="bg-primary/10 pointer-events-none fixed z-0 rounded-full opacity-0 blur-[80px] transition-opacity duration-500"
      style={{ width: 300, height: 300, marginLeft: -150, marginTop: -150 }}
    />
  );
}

// ── Background decor ─────────────────────────────────────────────────

function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[1000px] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '28px 28px',
          color: 'var(--muted-foreground)',
          maskImage: 'linear-gradient(to bottom, black 10%, transparent 65%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 10%, transparent 65%)',
        }}
      />
      <div className="bg-primary/8 absolute -top-40 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl" />
      <div className="bg-primary/5 absolute -top-20 left-1/4 h-[400px] w-[600px] -translate-x-1/2 rounded-full blur-3xl" />
    </div>
  );
}

// ── Hero Mockup (Stitch-style glass cards composition) ────────────────

function HeroMockup() {
  const wrapRef = useRef<HTMLDivElement>(null);

  const panelPresRef = useRef<HTMLDivElement>(null);
  const panelCourseRef = useRef<HTMLDivElement>(null);
  const panelQuizRef = useRef<HTMLDivElement>(null);
  const aiBadgeRef = useRef<HTMLDivElement>(null);

  // Quiz elements
  const qOpt0 = useRef<HTMLDivElement>(null);
  const qOpt1 = useRef<HTMLDivElement>(null);
  const qOpt2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const allPanels = [panelPresRef.current, panelCourseRef.current, panelQuizRef.current];

      // Hidden state
      gsap.set(panelPresRef.current, { opacity: 0, scale: 0.85, y: 40, rotate: 3 });
      gsap.set(panelCourseRef.current, { opacity: 0, scale: 0.85, x: -50, rotate: -2 });
      gsap.set(panelQuizRef.current, { opacity: 0, scale: 0.85, y: 50, x: 30 });
      gsap.set(aiBadgeRef.current, { opacity: 0, scale: 0, y: 10 });
      gsap.set([qOpt0.current, qOpt1.current, qOpt2.current], { opacity: 0, x: -12 });

      // Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Presentation (back) flies in first
      tl.to(panelPresRef.current, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.3)' });

      // Course structure (middle) flies in
      tl.to(panelCourseRef.current, { opacity: 1, scale: 1, x: 0, duration: 0.6, ease: 'back.out(1.4)' }, '-=0.35');

      // Quiz (front) flies in
      tl.to(panelQuizRef.current, { opacity: 1, scale: 1, y: 0, x: 0, duration: 0.6, ease: 'back.out(1.4)' }, '-=0.3');

      // Quiz options stream in
      tl.to([qOpt0.current, qOpt1.current, qOpt2.current], { opacity: 1, x: 0, duration: 0.3, stagger: 0.07 }, '-=0.2');

      // AI badge pops
      tl.to(aiBadgeRef.current, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(3)' }, '-=0.15');

      // Ambient floating
      allPanels.forEach((el, i) => {
        const params = [
          { y: 8, dur: 3.5 },
          { y: 6, dur: 3.0 },
          { y: 7, dur: 3.3 },
        ][i];
        gsap.to(el, { y: `+=${params.y}`, duration: params.dur, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.5 + i * 0.4 });
      });

      // AI badge gentle bounce
      gsap.to(aiBadgeRef.current, { y: -6, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 3 });
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="relative mx-auto min-h-[500px] w-full max-w-[520px]">
      {/* Panel 1: Presentation (Main, Back — rotated, full width) */}
      <div
        ref={panelPresRef}
        className="absolute right-0 top-0 z-10 w-[80%] rotate-3 overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-4 shadow-2xl backdrop-blur-xl"
      >
        <div className="bg-primary/5 flex h-full flex-col gap-3 rounded-xl p-4">
          <div className="border-primary/10 flex items-center justify-between border-b pb-2">
            <span className="text-primary text-[10px] font-bold uppercase tracking-widest">
              Presentation: Module 04
            </span>
            <div className="flex gap-1">
              <div className="bg-destructive/20 h-2 w-2 rounded-full" />
              <div className="bg-primary/20 h-2 w-2 rounded-full" />
            </div>
          </div>
          <div className="from-primary/20 via-primary/10 to-primary/5 h-32 w-full rounded-lg bg-gradient-to-br" />
          <div className="space-y-1.5">
            <div className="bg-primary/10 h-2 w-3/4 rounded" />
            <div className="bg-primary/10 h-2 w-1/2 rounded" />
          </div>
        </div>
      </div>

      {/* Panel 2: Course Structure / Mindmap (Middle-left) */}
      <div
        ref={panelCourseRef}
        className="absolute bottom-20 left-0 z-20 w-[65%] -rotate-2 rounded-2xl border border-white/30 bg-white/70 p-5 shadow-xl backdrop-blur-xl"
      >
        <div className="mb-3 flex items-center gap-2">
          <GitBranch className="text-primary h-4 w-4" />
          <span className="text-sm font-bold">Course Structure</span>
        </div>
        <svg viewBox="0 0 200 120" className="w-full opacity-70">
          {/* Center node */}
          <circle cx="100" cy="60" r="12" className="fill-primary/20 stroke-primary" strokeWidth="1" />
          {/* Branches */}
          <path d="M100 48 L100 20" className="stroke-primary/30" fill="none" strokeWidth="1.5" />
          <path d="M112 60 L140 60" className="stroke-primary/30" fill="none" strokeWidth="1.5" />
          <path d="M100 72 L100 100" className="stroke-primary/30" fill="none" strokeWidth="1.5" />
          <path d="M88 60 L60 60" className="stroke-primary/30" fill="none" strokeWidth="1.5" />
          {/* Leaf nodes */}
          <circle cx="100" cy="15" r="8" className="fill-muted stroke-primary/40" strokeWidth="1" />
          <circle cx="145" cy="60" r="8" className="fill-muted stroke-primary/40" strokeWidth="1" />
          <circle cx="100" cy="105" r="8" className="fill-muted stroke-primary/40" strokeWidth="1" />
          <circle cx="55" cy="60" r="8" className="fill-muted stroke-primary/40" strokeWidth="1" />
        </svg>
      </div>

      {/* Panel 3: Quiz (Front-right, overlapping) */}
      <div
        ref={panelQuizRef}
        className="absolute bottom-0 right-4 z-30 w-[60%] translate-y-4 rounded-2xl border border-white/30 bg-white/70 p-5 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
              Quiz AI
            </span>
            <span className="text-muted-foreground text-[10px] font-medium">Question 1/5</span>
          </div>
          <h4 className="text-xs font-bold leading-tight">
            Identify the primary catalyst in this chemical reaction?
          </h4>
          <div className="space-y-1.5">
            {[
              { label: 'Option A: Nitrogen Oxide', correct: true },
              { label: 'Option B: Carbon Monoxide', correct: false },
              { label: 'Option C: Hydrogen Peroxide', correct: false },
            ].map((opt, i) => (
              <div
                key={i}
                ref={[qOpt0, qOpt1, qOpt2][i]}
                className={
                  'flex items-center justify-between rounded-lg border p-2 text-[10px] ' +
                  (opt.correct ? 'border-primary/30 bg-primary/5' : 'border-border/30')
                }
              >
                <span>{opt.label}</span>
                {opt.correct && (
                  <Check className="text-primary h-3.5 w-3.5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Badge */}
      <div
        ref={aiBadgeRef}
        className="absolute left-[20%] top-[22%] z-40 flex items-center gap-3 rounded-2xl border border-white/30 bg-white/80 p-3 shadow-lg backdrop-blur-xl"
      >
        <div className="from-primary to-primary/70 text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="text-primary text-[10px] font-bold uppercase">Smart Assistant</div>
          <div className="text-xs font-semibold">Generating content...</div>
        </div>
      </div>
    </div>
  );
}

// ── Bento tile ───────────────────────────────────────────────────────

function BentoTile({
  children,
  className = '',
  eyebrowIcon: Icon,
}: {
  children: React.ReactNode;
  className?: string;
  eyebrowIcon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className={
        'border-border/60 hover:border-primary/30 bg-background group relative flex flex-col overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-lg ' +
        className
      }
    >
      <div className="text-primary mb-4">
        <Icon className="h-5 w-5" />
      </div>
      {children}
    </motion.div>
  );
}

// ── Stitch-style feature previews ────────────────────────────────────

function SlidesPreviewStitch() {
  return (
    <div className="relative mt-8 flex h-48 items-center justify-center">
      {/* Back slide (left, rotated) */}
      <div className="bg-background border-border/30 absolute z-0 flex h-32 w-48 -translate-x-20 -rotate-12 flex-col items-center justify-center rounded-lg border p-4 shadow-md">
        <div className="bg-muted mb-2 h-2 w-full rounded" />
        <div className="bg-muted h-2 w-1/2 rounded" />
      </div>
      {/* Center slide (main) */}
      <div className="bg-background border-border/30 absolute z-10 flex h-32 w-48 flex-col justify-end rounded-lg border p-4 shadow-xl">
        <div className="bg-primary/5 mb-2 flex h-full w-full items-center justify-center rounded">
          <ImageIcon className="text-primary/40 h-10 w-10" />
        </div>
        <div className="bg-primary/20 h-2 w-3/4 rounded" />
      </div>
      {/* Front slide (right, rotated) */}
      <div className="bg-background border-border/30 absolute z-0 h-32 w-48 translate-x-20 rotate-12 rounded-lg border p-4 shadow-md">
        <div className="border-border/40 h-full w-full rounded border-2 border-dashed" />
      </div>
    </div>
  );
}

function MindmapPreviewStitch() {
  return (
    <div className="mt-auto flex items-center justify-center pt-6">
      <svg viewBox="0 0 160 120" width="160" height="120" className="text-primary/20">
        <circle cx="80" cy="60" r="15" fill="currentColor" />
        <path d="M80 45 L80 20 M80 75 L80 100 M65 60 L30 60 M95 60 L130 60" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="80" cy="15" r="8" fill="currentColor" fillOpacity="0.5" />
        <circle cx="80" cy="105" r="8" fill="currentColor" fillOpacity="0.5" />
        <circle cx="25" cy="60" r="8" fill="currentColor" fillOpacity="0.5" />
        <circle cx="135" cy="60" r="8" fill="currentColor" fillOpacity="0.5" />
      </svg>
    </div>
  );
}

function QuizPreviewStitch() {
  return (
    <div className="mt-auto space-y-2 pt-4">
      {/* Option unchecked */}
      <div className="border-border/30 bg-muted/30 flex items-center gap-3 rounded-lg border p-2">
        <div className="border-primary/40 h-5 w-5 flex-shrink-0 rounded-full border-2" />
        <div className="bg-muted-foreground/10 h-2 w-full rounded" />
      </div>
      {/* Correct answer */}
      <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2">
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
          <Check className="h-3 w-3 text-white" />
        </div>
        <div className="h-2 w-full rounded bg-emerald-200" />
      </div>
      {/* Option unchecked */}
      <div className="border-border/30 bg-muted/30 flex items-center gap-3 rounded-lg border p-2">
        <div className="border-primary/40 h-5 w-5 flex-shrink-0 rounded-full border-2" />
        <div className="bg-muted-foreground/10 h-2 w-full rounded" />
      </div>
    </div>
  );
}

function AssignmentPreviewStitch() {
  return (
    <div className="mt-auto pt-4">
      <div className="bg-background border-border/30 relative overflow-hidden rounded-xl border p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="bg-muted h-3 w-24 rounded" />
            <div className="bg-muted/60 h-2 w-16 rounded" />
          </div>
          <span className="rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
            DUE TODAY
          </span>
        </div>
        <div className="flex -space-x-2">
          <div className="bg-primary/20 h-6 w-6 rounded-full border-2 border-white" />
          <div className="bg-primary/30 h-6 w-6 rounded-full border-2 border-white" />
          <div className="bg-primary/40 h-6 w-6 rounded-full border-2 border-white" />
        </div>
      </div>
    </div>
  );
}

function ClassesPreviewStitch() {
  const classes = [
    { code: 'AP', name: 'AP History', students: 24, bg: 'bg-indigo-100', text: 'text-indigo-600' },
    { code: 'B1', name: 'Biology 101', students: 18, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  ];
  return (
    <div className="mt-auto space-y-2 pt-4">
      {classes.map((cls) => (
        <div key={cls.code} className="hover:bg-primary/5 flex items-center justify-between rounded-lg p-2 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`${cls.bg} ${cls.text} flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold`}>
              {cls.code}
            </div>
            <span className="text-sm font-medium">{cls.name}</span>
          </div>
          <span className="text-muted-foreground text-xs">{cls.students} Students</span>
        </div>
      ))}
    </div>
  );
}

function ImagePreviewStitch() {
  return (
    <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div
          key={n}
          className="group/img aspect-[4/3] overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md"
        >
          <img
            src={`/images/landing_page/image-generating${n}.png`}
            alt={`AI generated image ${n}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-110"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}

export default LandingPage;

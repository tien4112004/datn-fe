import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
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
} from 'lucide-react';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { LanguageSwitcher } from '@/features/auth/components/LanguageSwitcher';

const OWNER = { name: 'Nguyen Le Hoang Dung' };

const DEVELOPERS = [
  { name: 'Phan Thanh Tien' },
  { name: 'Nguyen Bui Vuong Tien' },
  { name: 'Luu Thai Toan' },
  { name: 'Hoang Tien Huy' },
  { name: 'Ly Trong Tin' },
] as const;

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export function LandingPage() {
  const { t } = useTranslation(I18N_NAMESPACES.LANDING);
  const year = new Date().getFullYear();

  return (
    <div className="bg-background text-foreground relative min-h-screen overflow-x-hidden">
      <BackgroundDecor />

      <header className="border-border/40 sticky top-0 z-30 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-md">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>E-Learning</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.features')}
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
            <Button asChild size="sm">
              <Link to="/register">{t('nav.getStarted')}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-20 lg:pt-28">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <span className="border-border/80 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                <span className="bg-primary relative flex h-1.5 w-1.5 rounded-full">
                  <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
                </span>
                {t('hero.badge')}
              </span>
              <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                {t('hero.title')}
              </h1>
              <p className="text-muted-foreground mt-6 max-w-xl text-balance text-base leading-relaxed sm:text-lg">
                {t('hero.subtitle')}
              </p>
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="group">
                  <Link to="/register">
                    {t('hero.primaryCta')}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link to="/login">{t('hero.secondaryCta')}</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="relative hidden lg:block"
            >
              <HeroMockup />
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-border/60 border-t">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="max-w-2xl">
              <p className="text-primary text-xs font-semibold uppercase tracking-wider">
                {t('features.eyebrow')}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {t('features.title')}
              </h2>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-6">
              <BentoTile className="md:col-span-3 lg:col-span-4" eyebrowIcon={FileText}>
                <div className="flex flex-col">
                  <div className="grow">
                    <h3 className="text-lg font-semibold">{t('features.items.presentation.title')}</h3>
                    <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
                      {t('features.items.presentation.description')}
                    </p>
                  </div>
                  <SlidesPreview />
                </div>
              </BentoTile>

              <BentoTile className="md:col-span-3 lg:col-span-2" eyebrowIcon={GitBranch}>
                <h3 className="text-lg font-semibold">{t('features.items.mindmap.title')}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {t('features.items.mindmap.description')}
                </p>
                <MindmapPreview />
              </BentoTile>

              <BentoTile className="md:col-span-3 lg:col-span-2" eyebrowIcon={HelpCircle}>
                <h3 className="text-lg font-semibold">{t('features.items.questionBank.title')}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {t('features.items.questionBank.description')}
                </p>
                <QuizPreview />
              </BentoTile>

              <BentoTile className="md:col-span-3 lg:col-span-2" eyebrowIcon={ClipboardList}>
                <h3 className="text-lg font-semibold">{t('features.items.assignment.title')}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {t('features.items.assignment.description')}
                </p>
                <AssignmentPreview />
              </BentoTile>

              <BentoTile className="md:col-span-3 lg:col-span-2" eyebrowIcon={Users}>
                <h3 className="text-lg font-semibold">{t('features.items.classes.title')}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {t('features.items.classes.description')}
                </p>
                <ClassesPreview />
              </BentoTile>

              <BentoTile className="md:col-span-3 lg:col-span-2" eyebrowIcon={ImageIcon}>
                <h3 className="text-lg font-semibold">{t('features.items.image.title')}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {t('features.items.image.description')}
                </p>
                <ImagePreview />
              </BentoTile>
            </div>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="border-border/60 border-t">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="max-w-2xl">
              <p className="text-primary text-xs font-semibold uppercase tracking-wider">
                {t('team.eyebrow')}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t('team.title')}</h2>
              <p className="text-muted-foreground mt-4 text-base">{t('team.subtitle')}</p>
            </div>

            <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_2fr]">
              <div>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  {t('team.owner')}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <TeamAvatar name={OWNER.name} size="lg" highlight />
                  <div>
                    <p className="text-base font-semibold">{OWNER.name}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">{t('team.owner')}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  {t('team.developer')}
                </p>
                <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {DEVELOPERS.map((dev, i) => (
                    <motion.li
                      key={dev.name}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="border-border/60 hover:border-primary/30 group flex items-center gap-3 border-b pb-4 transition-colors"
                    >
                      <TeamAvatar name={dev.name} />
                      <p className="text-sm font-medium">{dev.name}</p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-border/60 border-t">
          <div className="mx-auto max-w-4xl px-6 py-28 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              {t('cta.title')}
            </h2>
            <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-base">{t('cta.subtitle')}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="group">
                <Link to="/register">
                  {t('cta.primary')}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/login">{t('cta.secondary')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-border/60 relative z-10 border-t">
        <div className="text-muted-foreground mx-auto max-w-6xl px-6 py-8 text-center text-xs">
          {t('footer.copyright', { year })}
        </div>
      </footer>
    </div>
  );
}

// ── Decorative background ─────────────────────────────────────────────

function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[900px] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '28px 28px',
          color: 'var(--muted-foreground)',
          maskImage: 'linear-gradient(to bottom, black, transparent 80%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 80%)',
        }}
      />
      <div className="bg-primary/10 absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full blur-3xl" />
    </div>
  );
}

// ── Hero mockup ───────────────────────────────────────────────────────

function HeroMockup() {
  return (
    <div className="relative mx-auto h-[440px] w-full max-w-[480px]">
      {/* Ambient ring */}
      <div className="border-border/60 absolute inset-10 rounded-[32px] border" />
      <div className="border-border/30 absolute inset-4 rounded-[40px] border" />

      {/* Main presentation panel */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-background/90 absolute left-4 top-8 w-60 rounded-2xl border p-4 shadow-xl backdrop-blur"
      >
        <div className="mb-3 flex items-center gap-1.5">
          <FileText className="text-primary h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">Presentation</span>
        </div>
        <div className="bg-muted/60 mb-2 h-24 overflow-hidden rounded-lg">
          <div className="from-primary/30 to-primary/5 h-full w-full bg-gradient-to-br" />
        </div>
        <div className="space-y-1.5">
          <div className="bg-foreground/80 h-1.5 w-4/5 rounded-full" />
          <div className="bg-muted h-1 w-full rounded-full" />
          <div className="bg-muted h-1 w-3/4 rounded-full" />
        </div>
      </motion.div>

      {/* Mindmap panel */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="bg-background/90 absolute right-0 top-2 w-52 rounded-2xl border p-3 shadow-xl backdrop-blur"
      >
        <div className="mb-2 flex items-center gap-1.5">
          <GitBranch className="text-primary h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">Mindmap</span>
        </div>
        <svg viewBox="0 0 180 110" className="h-24 w-full">
          <motion.path
            d="M 30 55 Q 80 20 150 20"
            className="text-primary/50"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
          />
          <motion.path
            d="M 30 55 Q 80 90 150 90"
            className="text-primary/50"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />
          <circle cx="30" cy="55" r="6" className="fill-primary" />
          <circle cx="150" cy="20" r="4" className="fill-foreground" />
          <circle cx="150" cy="90" r="4" className="fill-foreground" />
        </svg>
      </motion.div>

      {/* Quiz panel */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-background/90 absolute bottom-6 left-16 w-60 rounded-2xl border p-3 shadow-xl backdrop-blur"
      >
        <div className="mb-2 flex items-center gap-1.5">
          <HelpCircle className="text-primary h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">Quiz</span>
        </div>
        <div className="space-y-1.5">
          {[
            { correct: false, width: 'w-3/5' },
            { correct: true, width: 'w-4/5' },
            { correct: false, width: 'w-1/2' },
          ].map((opt, i) => (
            <div
              key={i}
              className={
                'flex items-center gap-2 rounded-md border px-2 py-1.5 ' +
                (opt.correct ? 'border-primary/40 bg-primary/10' : 'border-border')
              }
            >
              <span className="text-[9px] font-bold">{String.fromCharCode(65 + i)}.</span>
              <div className={'h-1 flex-1 rounded-full ' + (opt.correct ? 'bg-primary/40' : 'bg-muted')}>
                <div className={'h-full rounded-full bg-current ' + opt.width} />
              </div>
              {opt.correct && (
                <div className="bg-primary text-primary-foreground flex h-3.5 w-3.5 items-center justify-center rounded-full">
                  <Check className="h-2 w-2" />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating sparkle badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="bg-primary text-primary-foreground absolute bottom-16 right-6 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-lg"
      >
        <Sparkles className="h-3 w-3" />
        AI
      </motion.div>
    </div>
  );
}

// ── Bento tile ────────────────────────────────────────────────────────

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
        'border-border/70 hover:border-primary/40 group relative flex flex-col overflow-hidden rounded-2xl border p-6 transition-colors ' +
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

// ── Mini previews ─────────────────────────────────────────────────────

function SlidesPreview() {
  return (
    <div className="mt-6 flex items-end gap-3">
      {[
        { rot: '-rotate-2', delay: 0 },
        { rot: 'rotate-0', delay: 0.05 },
        { rot: 'rotate-2', delay: 0.1 },
      ].map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: s.delay }}
          className={
            'bg-background border-border/70 group-hover:border-primary/30 flex-1 rounded-lg border p-3 shadow-sm transition-all ' +
            s.rot
          }
        >
          <div className="bg-muted/60 mb-2 h-10 rounded" />
          <div className="bg-foreground/70 h-1 w-3/4 rounded-full" />
          <div className="bg-muted mt-1 h-1 w-1/2 rounded-full" />
        </motion.div>
      ))}
    </div>
  );
}

function MindmapPreview() {
  return (
    <svg viewBox="0 0 200 120" className="mt-6 h-28 w-full">
      <path
        d="M 40 60 Q 90 20 160 25"
        className="text-primary/40"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M 40 60 Q 90 100 160 95"
        className="text-primary/40"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M 40 60 Q 20 90 10 105"
        className="text-primary/40"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="40" cy="60" r="8" className="fill-primary" />
      <circle cx="160" cy="25" r="5" className="fill-foreground" />
      <circle cx="160" cy="95" r="5" className="fill-foreground" />
      <circle cx="10" cy="105" r="4" className="fill-foreground" />
    </svg>
  );
}

function QuizPreview() {
  return (
    <div className="mt-6 space-y-1.5">
      {[
        { label: 'A', correct: false },
        { label: 'B', correct: true },
        { label: 'C', correct: false },
      ].map((opt) => (
        <div
          key={opt.label}
          className={
            'flex items-center gap-2 rounded-md border px-2 py-1.5 text-[10px] ' +
            (opt.correct
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border text-muted-foreground')
          }
        >
          <span className="font-bold">{opt.label}.</span>
          <div className={'h-1 flex-1 rounded-full ' + (opt.correct ? 'bg-primary/40' : 'bg-muted')} />
          {opt.correct && <Check className="h-3 w-3" />}
        </div>
      ))}
    </div>
  );
}

function AssignmentPreview() {
  return (
    <div className="border-border/70 mt-6 rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="bg-foreground/70 h-1.5 w-16 rounded-full" />
        <span className="bg-primary/15 text-primary rounded-full px-1.5 py-0.5 text-[8px] font-semibold">
          DUE
        </span>
      </div>
      <div className="space-y-1">
        <div className="bg-muted h-1 w-full rounded-full" />
        <div className="bg-muted h-1 w-4/5 rounded-full" />
        <div className="bg-muted h-1 w-3/5 rounded-full" />
      </div>
    </div>
  );
}

function ClassesPreview() {
  return (
    <div className="mt-6 space-y-2">
      {[28, 31, 24].map((count, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="bg-primary/15 h-5 w-5 rounded-md" />
          <div className="bg-muted h-1 flex-1 rounded-full" />
          <span className="text-muted-foreground text-[9px] font-semibold">{count}</span>
        </div>
      ))}
    </div>
  );
}

function ImagePreview() {
  return (
    <div className="mt-6 grid grid-cols-3 gap-1.5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="from-primary/25 via-primary/10 aspect-square rounded-md bg-gradient-to-br to-transparent"
          style={{ backgroundPosition: `${i * 20}% ${i * 15}%` }}
        />
      ))}
    </div>
  );
}

// ── Team avatar ───────────────────────────────────────────────────────

function TeamAvatar({
  name,
  highlight = false,
  size = 'md',
}: {
  name: string;
  highlight?: boolean;
  size?: 'md' | 'lg';
}) {
  const dim = size === 'lg' ? 'h-14 w-14 text-base' : 'h-11 w-11 text-sm';
  return (
    <div
      className={
        'flex flex-shrink-0 items-center justify-center rounded-full border font-semibold ' +
        dim +
        ' ' +
        (highlight ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-muted/30')
      }
    >
      {getInitials(name)}
    </div>
  );
}

export default LandingPage;

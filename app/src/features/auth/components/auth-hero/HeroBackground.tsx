import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  BookOpen,
  Calculator,
  GraduationCap,
  Lightbulb,
  Music,
  Palette,
  Ruler,
  Star,
  Trophy,
  FlaskConical,
  Globe,
  BarChart2,
  Compass,
  Sigma,
  Atom,
  Microscope,
  Brain,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: LucideIcon[] = [
  BookOpen,
  Star,
  Calculator,
  Lightbulb,
  Ruler,
  Globe,
  BarChart2,
  GraduationCap,
  Atom,
  Music,
  Compass,
  Sigma,
  Palette,
  Trophy,
  FlaskConical,
  Microscope,
  Brain,
];

// Deterministic LCG so positions are stable across re-renders
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// Animation behaviour type assigned per particle
type AnimBehaviour = 'float' | 'spin' | 'orbit' | 'scalePulse' | 'zigzag';

interface Particle {
  id: string;
  Icon: LucideIcon;
  x: number;
  y: number;
  size: number;
  opacity: number;
  behaviour: AnimBehaviour;
  duration: number;
  delay: number;
  floatY: number;
  driftX: number;
  rotateStart: number;
  rotateDelta: number;
  // orbit params
  orbitRx: number;
  orbitRy: number;
}

const BEHAVIOURS: AnimBehaviour[] = ['float', 'spin', 'orbit', 'scalePulse', 'zigzag'];

function buildParticles(): Particle[] {
  const rand = lcg(42);
  return Array.from({ length: 90 }, (_, i) => ({
    id: `p-${i}`,
    Icon: ICONS[i % ICONS.length],
    x: 2 + rand() * 96,
    y: 2 + rand() * 96,
    size: 18 + rand() * 26,
    opacity: 0.06 + rand() * 0.08,
    behaviour: BEHAVIOURS[i % BEHAVIOURS.length],
    duration: 3 + rand() * 6,
    delay: rand() * 7,
    floatY: 20 + rand() * 35,
    driftX: (rand() - 0.5) * 30,
    rotateStart: rand() * 60 - 30,
    rotateDelta: rand() * 40 - 20,
    orbitRx: 12 + rand() * 20,
    orbitRy: 8 + rand() * 14,
  }));
}

const PARTICLES = buildParticles();

export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      PARTICLES.forEach((p) => {
        const el = containerRef.current?.querySelector(`[data-pid="${p.id}"]`);
        if (!el) return;

        gsap.set(el, { rotate: p.rotateStart, opacity: p.opacity });

        switch (p.behaviour) {
          // Simple vertical float with horizontal drift
          case 'float':
            gsap.to(el, {
              y: `-=${p.floatY}`,
              x: `+=${p.driftX}`,
              rotate: `+=${p.rotateDelta}`,
              duration: p.duration,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: p.delay,
            });
            break;

          // Continuous slow spin
          case 'spin':
            gsap.to(el, {
              rotate: '+=360',
              duration: p.duration * 2.5,
              repeat: -1,
              ease: 'none',
              delay: p.delay,
            });
            // Also gentle float
            gsap.to(el, {
              y: `-=${p.floatY * 0.5}`,
              duration: p.duration * 1.4,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: p.delay,
            });
            break;

          // Elliptical orbit using a timeline
          case 'orbit': {
            const orbitTl = gsap.timeline({ repeat: -1, delay: p.delay });
            orbitTl
              .to(el, {
                x: `+=${p.orbitRx}`,
                y: `-=${p.orbitRy}`,
                duration: p.duration * 0.25,
                ease: 'sine.inOut',
              })
              .to(el, {
                x: `+=${p.orbitRx}`,
                y: `+=${p.orbitRy}`,
                duration: p.duration * 0.25,
                ease: 'sine.inOut',
              })
              .to(el, {
                x: `-=${p.orbitRx}`,
                y: `+=${p.orbitRy}`,
                duration: p.duration * 0.25,
                ease: 'sine.inOut',
              })
              .to(el, {
                x: `-=${p.orbitRx}`,
                y: `-=${p.orbitRy}`,
                duration: p.duration * 0.25,
                ease: 'sine.inOut',
              });
            break;
          }

          // Scale pulse — breathes in and out
          case 'scalePulse':
            gsap.to(el, {
              scale: 1.6,
              duration: p.duration,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: p.delay,
              transformOrigin: 'center',
            });
            gsap.to(el, {
              y: `-=${p.floatY * 0.6}`,
              x: `+=${p.driftX * 0.5}`,
              duration: p.duration * 1.3,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: p.delay,
            });
            break;

          // Zigzag — alternates x direction each cycle
          case 'zigzag': {
            const zigTl = gsap.timeline({ repeat: -1, delay: p.delay });
            zigTl
              .to(el, {
                x: `+=${p.orbitRx}`,
                y: `-=${p.floatY * 0.5}`,
                rotate: `+=${p.rotateDelta}`,
                duration: p.duration * 0.5,
                ease: 'power1.inOut',
              })
              .to(el, {
                x: `-=${p.orbitRx * 2}`,
                y: `-=${p.floatY * 0.5}`,
                rotate: `-=${p.rotateDelta * 2}`,
                duration: p.duration,
                ease: 'power1.inOut',
              })
              .to(el, {
                x: `+=${p.orbitRx}`,
                y: `+=${p.floatY}`,
                rotate: `+=${p.rotateDelta}`,
                duration: p.duration * 0.5,
                ease: 'power1.inOut',
              });
            break;
          }
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {PARTICLES.map((p) => {
        const Icon = p.Icon;
        return (
          <div
            key={p.id}
            data-pid={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.opacity,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Icon size={p.size} className="text-foreground" strokeWidth={1.5} />
          </div>
        );
      })}
    </div>
  );
}

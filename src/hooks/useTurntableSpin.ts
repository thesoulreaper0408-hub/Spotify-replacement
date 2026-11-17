import { useLayoutEffect, useRef, useState } from 'react';
import {
  TURNTABLE_COAST_DOWN_MS,
  TURNTABLE_SPIN_UP_MS,
  advanceTurntableAngle,
  computeTurntablePlaybackRate,
} from '../utils/turntablePhysics';

export type TurntableMotorState = 'paused' | 'spinning' | 'coasting';

/**
 * Drives physical turntable platter rotation in real time with motor torque ease-in
 * when playback starts and bearing friction ease-out when playback pauses, preserving
 * the exact resting platter angle across pause/resume cycles.
 */
export function useTurntableSpin<T extends HTMLElement = HTMLElement>(isSpinning: boolean) {
  const rotorRef = useRef<T | null>(null);
  const [isCoasting, setIsCoasting] = useState(false);

  const wasSpinningRef = useRef(false);
  const currentRateRef = useRef(0);
  const angleDegRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = rotorRef.current;
    if (!el) return;

    const cancelLoop = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const applyTransform = (angle: number, rate: number) => {
      el.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      el.setAttribute('data-motor-rate', rate.toFixed(3));
    };

    const reducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      cancelLoop();
      currentRateRef.current = 0;
      wasSpinningRef.current = isSpinning;
      setIsCoasting(false);
      applyTransform(angleDegRef.current, 0);
      return;
    }

    if (isSpinning) {
      cancelLoop();
      wasSpinningRef.current = true;
      setIsCoasting(false);

      const startRate = currentRateRef.current;
      const startTime = performance.now();
      let lastFrameTime = startTime;

      const tickSpin = (now: number) => {
        const dt = now - lastFrameTime;
        lastFrameTime = now;

        const step = computeTurntablePlaybackRate(
          'spin-up',
          now - startTime,
          startRate,
          1,
          TURNTABLE_SPIN_UP_MS
        );
        currentRateRef.current = step.rate;
        angleDegRef.current = advanceTurntableAngle(angleDegRef.current, step.rate, dt);
        applyTransform(angleDegRef.current, step.rate);

        rafIdRef.current = requestAnimationFrame(tickSpin);
      };

      applyTransform(angleDegRef.current, startRate);
      rafIdRef.current = requestAnimationFrame(tickSpin);
      return () => cancelLoop();
    }

    // Transitioning out of spinning -> coast gracefully to a stop at current angle
    const wasSpinning = wasSpinningRef.current;
    wasSpinningRef.current = false;

    if (!wasSpinning || currentRateRef.current <= 0.005) {
      cancelLoop();
      currentRateRef.current = 0;
      setIsCoasting(false);
      applyTransform(angleDegRef.current, 0);
      return;
    }

    cancelLoop();
    setIsCoasting(true);

    const startRate = currentRateRef.current;
    const startTime = performance.now();
    let lastFrameTime = startTime;

    const tickCoast = (now: number) => {
      const dt = now - lastFrameTime;
      lastFrameTime = now;

      const step = computeTurntablePlaybackRate(
        'coast-down',
        now - startTime,
        startRate,
        0,
        TURNTABLE_COAST_DOWN_MS
      );
      currentRateRef.current = step.rate;
      angleDegRef.current = advanceTurntableAngle(angleDegRef.current, step.rate, dt);
      applyTransform(angleDegRef.current, step.rate);

      if (!step.done) {
        rafIdRef.current = requestAnimationFrame(tickCoast);
      } else {
        rafIdRef.current = null;
        currentRateRef.current = 0;
        applyTransform(angleDegRef.current, 0);
        setIsCoasting(false);
      }
    };

    applyTransform(angleDegRef.current, startRate);
    rafIdRef.current = requestAnimationFrame(tickCoast);
    return () => cancelLoop();
  }, [isSpinning]);

  const motorState: TurntableMotorState = isSpinning
    ? 'spinning'
    : isCoasting
      ? 'coasting'
      : 'paused';

  const rotorClassName = isSpinning
    ? 'vinyl-disc-rotor vinyl-disc-turntable vinyl-disc-spinning'
    : isCoasting
      ? 'vinyl-disc-rotor vinyl-disc-turntable vinyl-disc-coasting'
      : 'vinyl-disc-rotor vinyl-disc-turntable';

  return {
    rotorRef,
    isCoasting,
    motorState,
    rotorClassName,
  };
}

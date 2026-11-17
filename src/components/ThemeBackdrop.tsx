import { useEffect, useMemo, useRef, useState } from 'react';
import type { SceneryDensity, ThemeId } from '../types/music';
import {
  computeBandEnergies,
  computePropAudioTransformVars,
  getPropAudioMapping,
  getVisibleSceneryProps,
  smoothBandEnergies,
  ZERO_BAND_ENERGIES,
  type FrequencyBandEnergies,
} from '../utils/scenery';
import { SceneryPropSvg } from './SceneryPropSvg';

interface ThemeBackdropProps {
  theme: ThemeId;
  isPlaying: boolean;
  density: SceneryDensity;
  analyser: AnalyserNode | null;
  layer?: 'all' | 'background' | 'foreground';
}

const DEPTH_STYLE: Record<'far' | 'mid' | 'near', { opacity: number; filter?: string; zClass: string }> = {
  far: { opacity: 0.42, filter: 'blur(0.7px)', zClass: 'z-0' },
  mid: { opacity: 0.72, zClass: 'z-0' },
  near: { opacity: 0.92, zClass: 'z-20' },
};

function resetPropAudioVars(node: HTMLDivElement | null): void {
  if (!node) return;
  node.style.setProperty('--audio-bounce-y', '0px');
  node.style.setProperty('--audio-scale', '1');
  node.style.setProperty('--audio-scale-x', '1');
  node.style.setProperty('--audio-scale-y', '1');
  node.style.setProperty('--audio-tilt', '0deg');
  node.style.setProperty('--audio-glow', '0px');
  node.style.setProperty('--audio-brightness', '1');
}

/**
 * Lively World background scenery engine:
 * - Respects 3-level SceneryDensity ('off' | 'cozy' | 'packed')
 * - Renders multi-depth parallax layers ('far', 'mid', 'near')
 * - Maps specific scenery elements to Web Audio AnalyserNode frequency bands
 *   (subBass bounce, bass kick-tilt, mid pulsate, high shimmer) via direct DOM refs
 * - Pops/spins individual props when clicked in empty background areas
 */
export function ThemeBackdrop({
  theme,
  isPlaying,
  density,
  analyser,
  layer = 'all',
}: ThemeBackdropProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const propNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const smoothedEnergiesRef = useRef<FrequencyBandEnergies>(ZERO_BAND_ENERGIES);
  const [poppedIds, setPoppedIds] = useState<Record<string, boolean>>({});
  const popTimeoutsRef = useRef<Record<string, number>>({});

  const visibleProps = useMemo(() => {
    const all = getVisibleSceneryProps(theme, density);
    if (layer === 'background') return all.filter((p) => p.depth !== 'near');
    if (layer === 'foreground') return all.filter((p) => p.depth === 'near');
    return all;
  }, [theme, density, layer]);

  // Per-element Web Audio frequency band reactivity -> CSS custom properties (no 60Hz setState)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resetAll = () => {
      smoothedEnergiesRef.current = ZERO_BAND_ENERGIES;
      container.style.setProperty('--bass-energy', '0');
      for (const prop of visibleProps) {
        resetPropAudioVars(propNodeRefs.current[prop.id]);
      }
    };

    if (!isPlaying || !analyser || density === 'off') {
      resetAll();
      return;
    }

    const bins = new Uint8Array(analyser.frequencyBinCount);
    let rafId = 0;

    const tick = () => {
      analyser.getByteFrequencyData(bins);
      const rawEnergies = computeBandEnergies(bins);
      const smoothed = smoothBandEnergies(smoothedEnergiesRef.current, rawEnergies);
      smoothedEnergiesRef.current = smoothed;

      container.style.setProperty('--bass-energy', smoothed.subBass.toFixed(3));

      for (const prop of visibleProps) {
        const node = propNodeRefs.current[prop.id];
        if (!node) continue;

        if (!prop.bassReactive) {
          resetPropAudioVars(node);
          continue;
        }

        const mapping = getPropAudioMapping(prop.kind);
        const vars = computePropAudioTransformVars(mapping, smoothed, true);

        node.style.setProperty('--audio-bounce-y', `${vars.bounceY.toFixed(2)}px`);
        node.style.setProperty('--audio-scale', vars.scale.toFixed(3));
        node.style.setProperty('--audio-scale-x', vars.scaleX.toFixed(3));
        node.style.setProperty('--audio-scale-y', vars.scaleY.toFixed(3));
        node.style.setProperty('--audio-tilt', `${vars.tiltDeg.toFixed(2)}deg`);
        node.style.setProperty('--audio-glow', `${vars.glowPx.toFixed(1)}px`);
        node.style.setProperty('--audio-brightness', vars.brightness.toFixed(3));
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
      resetAll();
    };
  }, [analyser, density, isPlaying, visibleProps]);

  useEffect(() => {
    return () => {
      Object.values(popTimeoutsRef.current).forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const handlePropClick = (propId: string) => {
    if (popTimeoutsRef.current[propId]) {
      window.clearTimeout(popTimeoutsRef.current[propId]);
    }
    setPoppedIds((prev) => ({ ...prev, [propId]: true }));
    popTimeoutsRef.current[propId] = window.setTimeout(() => {
      setPoppedIds((prev) => {
        const next = { ...prev };
        delete next[propId];
        return next;
      });
    }, 850);
  };

  const showAtmosphere = layer !== 'foreground';

  if (density === 'off') {
    return (
      <div
        ref={containerRef}
        data-testid={layer === 'foreground' ? 'theme-backdrop-foreground' : 'theme-backdrop'}
        data-density="off"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      data-testid={layer === 'foreground' ? 'theme-backdrop-foreground' : 'theme-backdrop'}
      data-density={density}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
    >
      {/* Theme Ambient Atmosphere Layers */}
      {showAtmosphere && theme === 'classic-dark' && (
        <div
          className={`absolute -top-24 left-1/4 w-[480px] h-[320px] rounded-full blur-3xl transition-opacity duration-700 ${
            isPlaying ? 'opacity-28' : 'opacity-12'
          }`}
          style={{
            background:
              'radial-gradient(circle, rgba(29, 185, 84, 0.55) 0%, rgba(29, 185, 84, 0) 70%)',
          }}
        />
      )}

      {showAtmosphere && theme === 'pixel-retro' && (
        <svg className="w-full h-full opacity-35" shapeRendering="crispEdges">
          <rect x="8%" y="12%" width="4" height="4" fill="#ffd500" />
          <rect x="24%" y="28%" width="4" height="4" fill="#00e5ff" />
          <rect x="42%" y="16%" width="6" height="6" fill="#ff4ecd" />
          <rect x="64%" y="22%" width="4" height="4" fill="#ffd500" />
          <rect x="82%" y="14%" width="6" height="6" fill="#00e5ff" />
          <rect x="91%" y="36%" width="4" height="4" fill="#7dff6b" />
          <rect x="16%" y="68%" width="4" height="4" fill="#ff4ecd" />
          <rect x="74%" y="78%" width="6" height="6" fill="#ffd500" />
          <rect x="52%" y="86%" width="4" height="4" fill="#00e5ff" />
        </svg>
      )}

      {showAtmosphere && theme === 'cyberpunk-neon' && (
        <>
          <div className="cyber-scanlines absolute inset-0" />
          <div className="cyber-horizon absolute inset-x-0 bottom-0 h-44 opacity-45" />
        </>
      )}

      {showAtmosphere && theme === 'vaporwave' && (
        <div className="vapor-grid absolute inset-x-0 bottom-0 h-52 opacity-45" />
      )}

      {showAtmosphere && theme === 'blueprint' && (
        <>
          <div className="blueprint-ruler-top absolute top-14 inset-x-0 h-3 opacity-55" />
          <div className="blueprint-ruler-left absolute top-14 bottom-0 left-0 w-3 opacity-45" />
        </>
      )}

      {showAtmosphere && theme === 'terminal' && (
        <>
          <div className="terminal-scanlines absolute inset-0" />
          <div className="terminal-rain absolute inset-0 opacity-22">
            <span>01001101 01010101 01010011 01001001 01000011</span>
            <span>10110010 00101101 11010010 01101001 10010110</span>
            <span>01101100 01101111 01101111 01110000 00110011</span>
            <span>11100101 01000110 10101010 00111001 11001010</span>
          </div>
        </>
      )}

      {/* Multi-Layered Interactive & Audio-Band-Mapped Scenery Props */}
      {visibleProps.map((prop) => {
        const depthSpec = DEPTH_STYLE[prop.depth];
        const isPopped = Boolean(poppedIds[prop.id]);
        const audioMapping = prop.bassReactive ? getPropAudioMapping(prop.kind) : null;

        return (
          <div
            key={prop.id}
            ref={(el) => {
              propNodeRefs.current[prop.id] = el;
            }}
            data-testid={`scenery-prop-${prop.id}`}
            data-depth={prop.depth}
            data-popped={isPopped ? 'true' : 'false'}
            data-audio-band={audioMapping ? audioMapping.band : 'none'}
            data-audio-motion={audioMapping ? audioMapping.motion : 'none'}
            onClick={(e) => {
              e.stopPropagation();
              handlePropClick(prop.id);
            }}
            className="scenery-prop pointer-events-auto absolute cursor-pointer"
            style={{
              left: `${prop.xPercent}%`,
              top: `${prop.yPercent}%`,
              opacity: depthSpec.opacity,
              filter: depthSpec.filter,
              transform: `translate(-50%, -50%) scale(${prop.scale})`,
            }}
          >
            <div
              className={`scenery-motion-${prop.driftVariant}`}
              style={{
                animationDuration: `${prop.durationSec}s`,
                animationDelay: `${prop.delaySec}s`,
              }}
            >
              <div
                className={`${prop.bassReactive ? 'scenery-bass-reactive' : ''} ${
                  isPopped ? 'scenery-pop-active' : ''
                }`}
              >
                <SceneryPropSvg prop={prop} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

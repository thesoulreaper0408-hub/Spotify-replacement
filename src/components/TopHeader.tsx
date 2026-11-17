import {
  Check,
  ChevronDown,
  Layers,
  Menu,
  Minimize2,
  PanelRight,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { THEME_OPTIONS } from '../themes/themes';
import type { SceneryDensity, ThemeId } from '../types/music';
import { SCENERY_DENSITY_OPTIONS } from '../utils/scenery';

interface TopHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  sceneryDensity: SceneryDensity;
  onSceneryDensityChange: (density: SceneryDensity) => void;
  onOpenMobileMenu: () => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  onEnterMiniPlayer: () => void;
}

export function TopHeader({
  searchQuery,
  onSearchChange,
  activeTheme,
  onThemeChange,
  sceneryDensity,
  onSceneryDensityChange,
  onOpenMobileMenu,
  rightPanelOpen,
  onToggleRightPanel,
  onEnterMiniPlayer,
}: TopHeaderProps) {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const currentThemeMeta =
    THEME_OPTIONS.find((t) => t.id === activeTheme) ?? THEME_OPTIONS[0];

  useEffect(() => {
    if (!themeMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setThemeMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setThemeMenuOpen(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [themeMenuOpen]);

  return (
    <header
      className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3"
      style={{
        backgroundColor: 'var(--bg-app)',
        borderBottom: 'var(--border-width) var(--border-style) var(--border-color)',
      }}
    >
      {/* Left: Mobile Menu + Search Filter */}
      <div className="flex items-center gap-2.5 flex-1 min-w-[180px] max-w-md">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2.5 shrink-0 cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) var(--border-style) var(--border-color)',
          }}
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative flex-1 min-w-0">
          <Search
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tracks, artists, or albums..."
            aria-label="Search tracks, artists, or albums"
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: 'var(--border-width) var(--border-style) var(--border-color)',
              borderRadius: 'var(--radius-pill)',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Clean Spotify-style Theme Switcher + Mini-Player + Queue Panel Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative" ref={menuContainerRef}>
          <button
            type="button"
            onClick={() => setThemeMenuOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={themeMenuOpen}
            aria-label={`Theme Switcher: ${currentThemeMeta.label} (${sceneryDensity} scenery)`}
            data-testid="theme-switcher-button"
            className="theme-btn-secondary flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap"
          >
            <span className="text-base leading-none shrink-0" aria-hidden="true">
              {currentThemeMeta.emoji}
            </span>
            <span className="hidden sm:inline truncate max-w-[130px]">{currentThemeMeta.shortLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden="true" />
          </button>

          {themeMenuOpen && (
            <div
              role="listbox"
              aria-label="Choose visual theme and world scenery"
              className="absolute right-0 mt-2 w-[310px] sm:w-[460px] max-h-[75vh] overflow-y-auto p-3 z-50"
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                border: 'var(--border-width) var(--border-style) var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex items-center justify-between px-1 pb-2.5 mb-2.5 border-b border-[var(--border-color)]">
                <span
                  className="font-theme-display text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Select Theme ({THEME_OPTIONS.length})
                </span>
                <button
                  type="button"
                  onClick={() => setThemeMenuOpen(false)}
                  aria-label="Close theme menu"
                  className="p-1 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div
                role="group"
                aria-label="World scenery density"
                className="flex items-center justify-between gap-2 px-1 pb-2.5 mb-2.5 border-b border-[var(--border-color)]"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Layers
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: 'var(--accent-primary)' }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-xs font-semibold truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    World Scenery
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {SCENERY_DENSITY_OPTIONS.map((opt) => {
                    const active = sceneryDensity === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onSceneryDensityChange(opt.id)}
                        aria-pressed={active}
                        title={opt.description}
                        data-testid={`scenery-density-${opt.id}`}
                        className="px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        style={{
                          backgroundColor: active
                            ? 'var(--accent-primary)'
                            : 'var(--bg-surface)',
                          color: active ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                          border: active
                            ? '1px solid var(--accent-primary)'
                            : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {THEME_OPTIONS.map((opt) => {
                  const selected = opt.id === activeTheme;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onThemeChange(opt.id);
                        setThemeMenuOpen(false);
                      }}
                      className="flex items-center gap-2.5 p-2.5 text-left transition-colors cursor-pointer"
                      style={{
                        backgroundColor: selected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                        border: selected
                          ? 'var(--border-width) var(--border-style) var(--accent-primary)'
                          : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <span
                        className="w-9 h-9 flex items-center justify-center text-xl shrink-0"
                        style={{
                          backgroundColor: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        aria-hidden="true"
                      >
                        {opt.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs font-bold truncate"
                          style={{
                            color: selected ? 'var(--accent-primary)' : 'var(--text-primary)',
                          }}
                        >
                          {opt.label}
                        </p>
                        <p
                          className="text-[11px] truncate"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {opt.tagline}
                        </p>
                      </div>
                      {selected && (
                        <Check
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: 'var(--accent-primary)' }}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onEnterMiniPlayer}
          aria-label="Enter Mini-Player mode"
          title="Mini-Player Mode"
          className="theme-btn-secondary p-2.5 cursor-pointer shrink-0"
        >
          <Minimize2 className="w-4 h-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onToggleRightPanel}
          aria-label={rightPanelOpen ? 'Hide Now Playing panel' : 'Show Now Playing panel'}
          aria-pressed={rightPanelOpen}
          title="Toggle Now Playing & Queue"
          className="theme-btn-secondary p-2.5 cursor-pointer shrink-0"
          style={{
            color: rightPanelOpen ? 'var(--accent-primary)' : 'var(--text-primary)',
          }}
        >
          <PanelRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

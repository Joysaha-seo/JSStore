import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { TranslationPack } from '../i18n/translations';
import { DevWorkspaceTab } from '../types/dev';

interface DevHeaderProps {
  brandName: string;
  activeTab: DevWorkspaceTab;
  t: TranslationPack;
  onSelectTab: (tab: DevWorkspaceTab) => void;
  onOpenInquiry: () => void;
}

export function DevHeader({
  brandName,
  activeTab,
  t,
  onSelectTab,
  onOpenInquiry,
}: DevHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: DevWorkspaceTab; label: string }> = [
    { id: 'work', label: t.nav.work },
    { id: 'services', label: t.nav.services },
    { id: 'clients', label: t.nav.clients },
    { id: 'ai-studio', label: t.nav.aiStudio },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('work')}
          className="font-display text-lg font-bold tracking-tight text-zinc-950 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-700 focus-visible:outline-offset-4"
        >
          {brandName}
        </button>

        {/* Zone 2: 4 single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-5 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-700 ${
                  isActive ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-950'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-700"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenInquiry}
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-950 hover:bg-blue-700 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-700 focus-visible:outline-offset-2"
          >
            {t.nav.startProject}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 text-zinc-700 border border-zinc-200 rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-zinc-100 text-zinc-950'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

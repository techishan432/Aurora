'use client';

import type { TabId } from '../types';
import { NAV_ITEMS } from './nav-items';

type BottomNavProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      <ul className="bottom-nav-list">
        {NAV_ITEMS.map(({ id, label, icon: ItemIcon }) => (
          <li key={id}>
            <button
              type="button"
              className="bottom-nav-tab"
              aria-current={activeTab === id ? 'page' : undefined}
              onClick={() => onTabChange(id)}
            >
              <ItemIcon size={20} />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

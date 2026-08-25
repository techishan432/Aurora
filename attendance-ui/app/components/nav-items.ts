import type { ComponentType } from 'react';
import type { TabId } from '../types';
import { IconDashboard, IconHome } from './icons';

export type NavItem = {
  id: TabId;
  label: string;
  icon: ComponentType<{ size?: number }>;
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: IconHome },
  { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
];

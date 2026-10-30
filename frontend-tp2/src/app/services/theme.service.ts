import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly selected = signal<ThemePreference>(this.readPreference());
  readonly preference = this.selected.asReadonly();

  constructor() {
    this.apply();

  }

  setPreference(value: string): void {
    if (value !== 'light' && value !== 'dark') return;
    this.selected.set(value);
    try { this.window?.localStorage.setItem('velocity-theme', value); } catch { /* Storage can be blocked. */ }
    this.apply();
  }

  private readPreference(): ThemePreference {
    try {
      const value = this.window?.localStorage.getItem('velocity-theme');
      if (value === 'light' || value === 'dark') return value;
    } catch { /* Keep dark mode when storage is unavailable. */ }
    return 'dark';
  }

  private apply(): void {
    const theme = this.selected();
    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.style.colorScheme = theme;
  }
}

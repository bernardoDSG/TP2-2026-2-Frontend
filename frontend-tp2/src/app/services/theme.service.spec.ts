import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { EntityMenu } from '../components/entity-menu/entity-menu';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    });
    TestBed.configureTestingModule({});
  });
  afterEach(() => { TestBed.resetTestingModule(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('offers only sun and moon buttons and persists their selection', async () => {
    TestBed.configureTestingModule({ imports: [EntityMenu], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(EntityMenu);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('select')).toBeNull();
    const buttons = host.querySelectorAll<HTMLButtonElement>('.theme-button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].getAttribute('aria-label')).toBe('Modo claro');
    expect(buttons[1].getAttribute('aria-label')).toBe('Modo escuro');
    expect(buttons[0].querySelector('svg')).toBeTruthy();
    expect(buttons[1].querySelector('svg')).toBeTruthy();
    buttons[0].click();
    await fixture.whenStable();
    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(localStorage.getItem('velocity-theme')).toBe('light');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
    buttons[1].click();
    await fixture.whenStable();
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(localStorage.getItem('velocity-theme')).toBe('dark');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
  });
  it('uses dark as the default', () => {
    expect(TestBed.inject(ThemeService).preference()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });
  it('restores a saved light theme', () => {
    localStorage.setItem('velocity-theme', 'light');
    expect(TestBed.inject(ThemeService).preference()).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });
  it('migrates the removed system option to dark and ignores invalid selections', () => {
    localStorage.setItem('velocity-theme', 'system');
    const theme = TestBed.inject(ThemeService);
    expect(theme.preference()).toBe('dark');
    theme.setPreference('light');
    theme.setPreference('system');
    expect(theme.preference()).toBe('light');
  });
  it('still switches themes when browser storage is unavailable', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const theme = TestBed.inject(ThemeService);
    theme.setPreference('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
  });
});

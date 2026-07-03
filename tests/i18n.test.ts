import { expect, test, describe, beforeEach, vi } from 'vitest';
import { i18n, I18nManager } from '../src/i18n';

describe('I18nManager', () => {
  beforeEach(() => {
    // Reset global i18n instance before each test
    i18n.setLocale('en');
  });

  test('should resolve translations in English by default', () => {
    expect(i18n.getLocale()).toBe('en');
    expect(i18n.translate('welcome')).toBe('Welcome to Bakudan');
  });

  test('should switch locale and resolve translations correctly', () => {
    i18n.setLocale('zh');
    expect(i18n.getLocale()).toBe('zh');
    expect(i18n.translate('welcome')).toBe('欢迎来到幕弹');

    i18n.setLocale('ja');
    expect(i18n.getLocale()).toBe('ja');
    expect(i18n.translate('welcome')).toBe('幕弾へようこそ');
  });

  test('should trigger registered callbacks when locale changes', () => {
    const callback = vi.fn();
    i18n.onChange(callback);

    expect(callback).not.toHaveBeenCalled();

    i18n.setLocale('zh');
    expect(callback).toHaveBeenCalledTimes(1);

    i18n.setLocale('ja');
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('should support multiple independent managers', () => {
    const manager = new I18nManager();
    expect(manager.getLocale()).toBe('en');

    const callback = vi.fn();
    manager.onChange(callback);

    manager.setLocale('zh');
    expect(manager.getLocale()).toBe('zh');
    expect(callback).toHaveBeenCalledTimes(1);

    // Global one should remain unchanged
    expect(i18n.getLocale()).toBe('en');
  });
});

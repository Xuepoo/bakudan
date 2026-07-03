export type Locale = 'en' | 'zh' | 'ja';

const translations = {
  en: { welcome: 'Welcome to Bakudan' },
  zh: { welcome: '欢迎来到幕弹' },
  ja: { welcome: '幕弾へようこそ' },
};

export class I18nManager {
  private currentLocale: Locale = 'en';
  private listeners: (() => void)[] = [];

  public setLocale(locale: Locale) {
    this.currentLocale = locale;
    this.listeners.forEach((fn) => fn());
  }

  public translate(key: keyof typeof translations.en): string {
    return translations[this.currentLocale][key] || key;
  }

  public onChange(callback: () => void) {
    this.listeners.push(callback);
  }

  public getLocale(): Locale {
    return this.currentLocale;
  }
}

export const i18n = new I18nManager();

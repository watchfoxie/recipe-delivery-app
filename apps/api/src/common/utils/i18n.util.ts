import { I18nContext, I18nService } from 'nestjs-i18n';

export async function translateMessage(
  i18n: I18nService,
  key: string,
  lang?: string,
): Promise<string> {
  const ctx = I18nContext.current();

  if (ctx) {
    const translated = await Promise.resolve(
      ctx.t(key as Parameters<typeof ctx.t>[0], {
        defaultValue: key,
      }),
    );

    if (typeof translated === 'string' && translated !== key) {
      return translated;
    }
  }

  const serviceWithDefaults = i18n as unknown as {
    getDefaultLanguage?: () => string;
    fallbackLanguage?: string;
  };

  const resolvedLang =
    lang ??
    ctx?.lang ??
    serviceWithDefaults.getDefaultLanguage?.() ??
    serviceWithDefaults.fallbackLanguage ??
    'ro';

  const result = await i18n.translate<string>(
    key as Parameters<I18nService['translate']>[0],
    {
      lang: resolvedLang,
      defaultValue: key,
    },
  );

  return typeof result === 'string' ? result : key;
}
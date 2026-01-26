import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export interface SafeTextOptions {
  allowNewlines?: boolean;
  allowHtml?: boolean;
  allowSqlMeta?: boolean;
  blacklistPattern?: RegExp;
}

const DANGEROUS_UNICODE_REGEX = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/;
const HTML_ANGLE_REGEX = /[<>]/;
const SQL_META_REGEX = /(;|--|\/\*|\*\/|\\)/;
const NEWLINE_REGEX = /[\r\n]/;

export interface SanitizeTextOptions {
  normalize?: boolean;
  trim?: boolean;
}

export function sanitizeText(
  value: unknown,
  options: SanitizeTextOptions = {}
): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = options.normalize === false ? value : value.normalize('NFKC');
  return options.trim === false ? normalized : normalized.trim();
}

export function sanitizeTextArray(
  value: unknown,
  options: SanitizeTextOptions = {}
): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.map((item) => sanitizeText(item, options));
}

export function isSafeText(value: unknown, options: SafeTextOptions = {}): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  if (hasControlChars(value)) {
    return false;
  }

  if (DANGEROUS_UNICODE_REGEX.test(value)) {
    return false;
  }

  if (options.allowNewlines !== true && NEWLINE_REGEX.test(value)) {
    return false;
  }

  if (options.allowHtml !== true && HTML_ANGLE_REGEX.test(value)) {
    return false;
  }

  if (options.allowSqlMeta !== true && SQL_META_REGEX.test(value)) {
    return false;
  }

  if (options.blacklistPattern?.test(value)) {
    return false;
  }

  return true;
}

function hasControlChars(value: string): boolean {
  for (let index = 0; index < value.length; ) {
    const codePoint = value.codePointAt(index);
    if (codePoint === undefined) {
      index += 1;
      continue;
    }
    if ((codePoint >= 0 && codePoint <= 31) || (codePoint >= 127 && codePoint <= 159)) {
      return true;
    }
    index += codePoint > 0xffff ? 2 : 1;
  }

  return false;
}

export function SafeText(
  options: SafeTextOptions = {},
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'SafeText',
      target: target.constructor,
      propertyName: propertyName.toString(),
      constraints: [options],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [safeTextOptions] = args.constraints as [SafeTextOptions];
          return isSafeText(value, safeTextOptions);
        },
      },
    });
  };
}

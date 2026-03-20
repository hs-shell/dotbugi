import { vi } from 'vitest';

// Mock i18n - 키를 그대로 반환하되, interpolation 값이 있으면 포함
vi.mock('@/i18n', () => ({
  default: {
    t: (key: string, options?: Record<string, unknown>) => {
      const opts = { ...options };
      delete opts.ns;
      const params = Object.entries(opts)
        .map(([k, v]) => `${k}:${v}`)
        .join(',');
      return params ? `${key}{${params}}` : key;
    },
  },
}));

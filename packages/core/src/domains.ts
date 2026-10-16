export const DOMAINS = ['memory', 'focus', 'speed', 'logic', 'math'] as const;
export type Domain = (typeof DOMAINS)[number];

export const DOMAIN_LABELS: Record<Domain, string> = {
  memory: 'Memory',
  focus: 'Focus',
  speed: 'Speed',
  logic: 'Logic',
  math: 'Math',
};

export function isDomain(value: unknown): value is Domain {
  return typeof value === 'string' && (DOMAINS as readonly string[]).includes(value);
}

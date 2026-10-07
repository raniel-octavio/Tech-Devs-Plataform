import type { Profile } from '@/lib/types';

export function displayName(p?: Profile | null): string {
  return p?.full_name || p?.email || 'Sem nome';
}

export function Avatar({ profile, size = 24 }: { profile?: Profile | null; size?: number }) {
  if (!profile) {
    return (
      <span
        title="Sem responsável"
        className="inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-slate-500 text-slate-500"
        style={{ width: size, height: size, fontSize: size * 0.45 }}
      >
        ?
      </span>
    );
  }
  const name = displayName(profile);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
  return (
    <span
      title={name}
      className="inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold text-ink-950"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: profile.avatar_color || '#2F7BFF',
      }}
    >
      {initials}
    </span>
  );
}

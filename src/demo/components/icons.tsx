export function StackOverflowIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.36 20.2v-5.38h1.79V22H3v-7.18h1.8v5.38h12.56zM6.77 14.32l.37-1.76 8.79 1.85-.37 1.76-8.79-1.85zm1.16-4.21l.76-1.61 8.14 3.78-.76 1.62-8.14-3.79zm2.26-4.01l1.15-1.38 6.9 5.76-1.15 1.37-6.9-5.75zM14.64 2l-1.47 1.11 5.35 7.18 1.47-1.11L14.64 2zM6.59 18.4h9v-1.8h-9v1.8z" />
    </svg>
  );
}

export function GravatarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0a2.4 2.4 0 0 0-2.4 2.4v8.4c0 1.324 1.074 2.398 2.4 2.398s2.4-1.074 2.4-2.398V5.21a7.204 7.204 0 0 1 4.799 6.789 7.2 7.2 0 1 1-12.29-5.09 2.4 2.4 0 1 0-3.396-3.396A11.978 11.978 0 0 0 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12S18.627 0 12 0" />
    </svg>
  );
}

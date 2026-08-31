import { useEffect, useState } from 'react';

export const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

export default function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () =>
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.(query).matches)
  );

  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, [query]);

  return matches;
}

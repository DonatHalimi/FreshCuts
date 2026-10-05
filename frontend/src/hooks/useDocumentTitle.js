import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · FreshCuts` : 'FreshCuts';
    return () => {
      document.title = 'FreshCuts';
    };
  }, [title]);
}
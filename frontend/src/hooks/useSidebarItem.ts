import { useMemo } from 'react';
import { useGetSidebarQuery } from '../store/api';
import type { SidebarItem } from '../types/sidebar';

/**
 * Resolves a sidebar item by its slug. Returns `undefined` until the sidebar
 * data is loaded or if the slug isn't in any section.
 */
export function useSidebarItem(slug: string | undefined): SidebarItem | undefined {
  const { data: sections } = useGetSidebarQuery();
  return useMemo(() => {
    if (!slug || !sections) return undefined;
    return sections
      .flatMap((section) => section.items)
      .find((item) => item.slug === slug);
  }, [sections, slug]);
}

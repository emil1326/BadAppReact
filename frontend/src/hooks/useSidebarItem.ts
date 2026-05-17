import { useMemo } from 'react';
import { useGetSidebarQuery } from '../store/api';
import type { SidebarItem } from '../types/sidebar';

export function useSidebarItem(slug: string | undefined): SidebarItem | undefined {
  const { data: sections } = useGetSidebarQuery();
  return useMemo(() => {
    if (!slug || !sections) return undefined;
    return sections
      .flatMap((section) => section.items)
      .find((item) => item.slug === slug);
  }, [sections, slug]);
}

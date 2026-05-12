import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useGetSidebarQuery } from '../store/api';
import type { SidebarItem } from '../types/sidebar';

const DOSSIER_TITLE = 'MON DOSSIER';
const SHUFFLE_MIN_MS = 5_000;
const SHUFFLE_MAX_MS = 14_000;

function shuffleSubset(items: SidebarItem[]): SidebarItem[] {
  if (items.length < 2) return items;
  const count = Math.min(2 + Math.floor(Math.random() * 7), items.length);
  const pool = items.map((_, i) => i);
  const indices: number[] = [];
  for (let i = 0; i < count; i++) {
    const pick = Math.floor(Math.random() * pool.length);
    indices.push(pool.splice(pick, 1)[0]);
  }
  const picked = indices.map((i) => items[i]);
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  const next = [...items];
  indices.forEach((idx, i) => { next[idx] = picked[i]; });
  return next;
}

export function Sidebar() {
  const { data: sections } = useGetSidebarQuery();
  const [dossierItems, setDossierItems] = useState<SidebarItem[] | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize local copy of MON DOSSIER items once data arrives.
  useEffect(() => {
    if (!sections) return;
    setDossierItems((prev) => {
      if (prev !== null) return prev;
      const section = sections.find((s) => s.title === DOSSIER_TITLE);
      return section ? [...section.items] : null;
    });
  }, [sections]);

  // Start the shuffle loop once items are available.
  const isLoaded = dossierItems !== null;
  useEffect(() => {
    if (!isLoaded) return;

    const tick = () => {
      setDossierItems((prev) => (prev ? shuffleSubset(prev) : prev));
      const delay = SHUFFLE_MIN_MS + Math.random() * (SHUFFLE_MAX_MS - SHUFFLE_MIN_MS);
      timerRef.current = setTimeout(tick, delay);
    };

    const delay = SHUFFLE_MIN_MS + Math.random() * (SHUFFLE_MAX_MS - SHUFFLE_MIN_MS);
    timerRef.current = setTimeout(tick, delay);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [isLoaded]);

  return (
    <aside className="colnet-sidebar">
      {sections?.map((section) => {
        const items =
          section.title === DOSSIER_TITLE && dossierItems !== null
            ? dossierItems
            : section.items;

        return (
          <section key={section.title}>
            <h2 className="colnet-sidebar__section-title">{section.title}</h2>
            <ul className="colnet-sidebar__list">
              {items.map((item) => (
                <li key={item.slug} className="colnet-sidebar__item">
                  <NavLink
                    to={`/${item.slug}`}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </aside>
  );
}

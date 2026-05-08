import { NavLink } from 'react-router-dom';
import { useGetSidebarQuery } from '../store/api';

export function Sidebar() {
  const { data: sections } = useGetSidebarQuery();

  return (
    <aside className="colnet-sidebar">
      {sections?.map((section) => (
        <section key={section.title}>
          <h2 className="colnet-sidebar__section-title">{section.title}</h2>
          <ul className="colnet-sidebar__list">
            {section.items.map((item) => (
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
      ))}
    </aside>
  );
}

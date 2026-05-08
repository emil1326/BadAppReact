import { useParams } from 'react-router-dom';
import { useSidebarItem } from '../hooks/useSidebarItem';
import { PageShell } from '../layout/PageShell';

export function StubPage() {
  const { slug } = useParams<{ slug: string }>();
  const matchedItem = useSidebarItem(slug);
  const title = matchedItem?.label ?? slug ?? 'Page';

  return (
    <PageShell title={title}>
      <p className="colnet-stub">Cette section est en construction. À venir.</p>
    </PageShell>
  );
}

import { useParams } from 'react-router-dom';
import { useGetSidebarQuery } from '../store/api';
import { PageShell } from '../layout/PageShell';

export function StubPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: sections } = useGetSidebarQuery();

  const matchedItem = sections
    ?.flatMap((section) => section.items)
    .find((item) => item.slug === slug);

  const title = matchedItem?.label ?? slug ?? 'Page';

  return (
    <PageShell title={title}>
      <p className="colnet-stub">Cette section est en construction. À venir.</p>
    </PageShell>
  );
}

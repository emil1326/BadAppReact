import { useGetSidebarQuery } from '../store/api';
import { PORTAL_NAME, PORTAL_VERSION } from '../config/branding';

type InfoStripProps = {
  pathname: string;
};

export function InfoStrip({ pathname }: InfoStripProps) {
  const { data: sections } = useGetSidebarQuery();

  const slug = pathname.replace(/^\/+/, '').split('/')[0];
  const matchedItem = sections
    ?.flatMap((section) => section.items)
    .find((item) => item.slug === slug);

  const breadcrumb = matchedItem
    ? `${PORTAL_NAME} > ${matchedItem.label}`
    : PORTAL_NAME;

  return (
    <div className="colnet-info-strip">
      <span className="colnet-info-strip__breadcrumb">{breadcrumb}</span>
      <span className="colnet-info-strip__meta">{PORTAL_VERSION}</span>
    </div>
  );
}

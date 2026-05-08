import type { ReactNode } from 'react';
import { PORTAL_NAME, PORTAL_SECTION } from '../config/branding';

type PageShellProps = {
  title: string;
  children: ReactNode;
};

export function PageShell({ title, children }: PageShellProps) {
  return (
    <>
      <div className="colnet-main__titlebar">
        {title.toUpperCase()} - {PORTAL_NAME} {PORTAL_SECTION}
      </div>
      <div className="colnet-main__content">{children}</div>
    </>
  );
}

export type SidebarItem = {
  label: string;
  slug: string;
};

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

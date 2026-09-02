/**
 * Layout for the main website. Chrome (header, nav, footer) and the site's
 * own stylesheet are added here in a later step; the device views never load
 * any of it.
 */
export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div data-testid="main-site">{children}</div>;
}

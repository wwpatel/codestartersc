export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mx-auto mt-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-muted md:flex-row">
      <p>© {year} CodeStarters. All rights reserved.</p>
      <a
        href="https://codestarters.org"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-foreground"
      >
        codestarters.org
      </a>
    </footer>
  );
}

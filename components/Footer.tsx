export default function Footer() {
  return (
    <footer
      className="
        border-t
        border-hk-border
        bg-hk-surface
        text-hk-text-secondary
      "
    >
      <div
        className="
          mx-auto
          flex
          min-h-12
          w-full
          max-w-7xl
          items-center
          justify-center
          px-4
          text-center
          text-xs
          sm:px-6
          sm:text-sm
          lg:px-8
        "
      >
        <span>
          © 2026 Hating Kapatid
          <span className="mx-2 text-hk-text-muted">·</span>
          Built with Next.js & React
        </span>
      </div>
    </footer>
  );
}
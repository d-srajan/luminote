import { Link, List, Clock } from "lucide-react";

export function RightSidebar() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--color-border)] px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Inspector
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Backlinks placeholder */}
        <section className="mb-4">
          <div className="mb-2 flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <Link size={14} />
            <h3 className="text-xs font-medium">Backlinks</h3>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            No backlinks found.
          </p>
        </section>

        {/* Outline placeholder */}
        <section className="mb-4">
          <div className="mb-2 flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <List size={14} />
            <h3 className="text-xs font-medium">Outline</h3>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            Headings will appear here.
          </p>
        </section>

        {/* Recent activity placeholder */}
        <section>
          <div className="mb-2 flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <Clock size={14} />
            <h3 className="text-xs font-medium">Recent Activity</h3>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            Coming soon.
          </p>
        </section>
      </div>
    </div>
  );
}

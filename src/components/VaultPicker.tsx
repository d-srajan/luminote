import { FolderOpen, Plus, Loader2 } from "lucide-react";
import { useVaultStore } from "@/store/vaultStore";

export function VaultPicker() {
  const { openVault, loading } = useVaultStore();

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="flex w-80 flex-col items-center gap-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 shadow-lg">
        {/* Logo area */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)]/15">
            <FolderOpen size={24} className="text-[var(--color-accent)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-accent)]">
            Luminote
          </h1>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            v0.1.0
          </p>
        </div>

        <p className="text-center text-xs leading-relaxed text-[var(--color-text-secondary)]">
          Open a folder to use as your vault. Your notes are stored locally as
          Markdown files — no cloud, no accounts.
        </p>

        {/* Open vault button */}
        <button
          onClick={openVault}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-6 py-2.5 text-sm font-medium text-[var(--color-bg-primary)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Opening...
            </>
          ) : (
            <>
              <FolderOpen size={16} />
              Open Vault
            </>
          )}
        </button>

        <button
          onClick={openVault}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)]"
        >
          <Plus size={14} />
          Create new vault folder
        </button>
      </div>
    </div>
  );
}

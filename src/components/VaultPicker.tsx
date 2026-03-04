import { FolderOpen, Plus } from "lucide-react";
import { useVaultStore } from "@/store/vaultStore";

export function VaultPicker() {
  const { openVault, loading, error, clearError } = useVaultStore();

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg-primary)]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--color-accent)]">Luminote</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Open a folder to use as your vault
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          <span>{error}</span>
          <button onClick={clearError} className="ml-2 text-xs underline">
            dismiss
          </button>
        </div>
      )}

      <button
        onClick={openVault}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-[var(--color-bg-primary)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
      >
        <FolderOpen size={18} />
        {loading ? "Opening..." : "Open Vault"}
      </button>

      <button
        onClick={openVault}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)]"
      >
        <Plus size={14} />
        Create new vault folder
      </button>

      <p className="max-w-xs text-center text-xs text-[var(--color-text-muted)]">
        A vault is just a folder on your computer where your notes are stored as
        Markdown files.
      </p>
    </div>
  );
}

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VaultPicker } from "@/components/VaultPicker";
import { useVaultStore } from "@/store/vaultStore";

// Mock the fs module to prevent actual Tauri calls
vi.mock("@/utils/fs", () => ({
  fs: {
    openVault: vi.fn().mockResolvedValue("/mock-vault"),
    listFiles: vi.fn().mockResolvedValue([]),
    getSavedVaultPath: vi.fn().mockReturnValue(null),
    clearVaultPath: vi.fn(),
  },
}));

describe("VaultPicker", () => {
  beforeEach(() => {
    // Reset vault store to initial state
    useVaultStore.setState({
      vaultPath: null,
      fileTree: [],
      loading: false,
    });
  });

  it("renders Luminote heading", () => {
    render(<VaultPicker />);
    expect(screen.getByText("Luminote")).toBeInTheDocument();
  });

  it("renders Open Vault button", () => {
    render(<VaultPicker />);
    expect(screen.getByText("Open Vault")).toBeInTheDocument();
  });

  it("renders version number", () => {
    render(<VaultPicker />);
    expect(screen.getByText("v0.1.0")).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<VaultPicker />);
    expect(
      screen.getByText(/Your notes are stored locally as Markdown files/),
    ).toBeInTheDocument();
  });

  it("renders create new vault option", () => {
    render(<VaultPicker />);
    expect(screen.getByText("Create new vault folder")).toBeInTheDocument();
  });

  it("shows loading state when loading is true", () => {
    useVaultStore.setState({ loading: true });
    render(<VaultPicker />);
    expect(screen.getByText("Opening...")).toBeInTheDocument();
  });

  it("disables buttons when loading", () => {
    useVaultStore.setState({ loading: true });
    render(<VaultPicker />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("calls openVault on button click", async () => {
    const user = userEvent.setup();
    const openVaultSpy = vi.fn();
    useVaultStore.setState({ openVault: openVaultSpy } as never);

    render(<VaultPicker />);
    await user.click(screen.getByText("Open Vault"));

    expect(openVaultSpy).toHaveBeenCalledTimes(1);
  });
});

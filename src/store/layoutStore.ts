import { create } from "zustand";

interface LayoutStore {
  leftSidebarOpen: boolean;
  leftSidebarWidth: number;
  rightSidebarOpen: boolean;
  rightSidebarWidth: number;

  toggleLeftSidebar: () => void;
  setLeftSidebarWidth: (width: number) => void;
  toggleRightSidebar: () => void;
  setRightSidebarWidth: (width: number) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  leftSidebarOpen: true,
  leftSidebarWidth: 260,
  rightSidebarOpen: false,
  rightSidebarWidth: 280,

  toggleLeftSidebar: () =>
    set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),

  setLeftSidebarWidth: (width) =>
    set({ leftSidebarWidth: Math.min(400, Math.max(200, width)) }),

  toggleRightSidebar: () =>
    set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),

  setRightSidebarWidth: (width) =>
    set({ rightSidebarWidth: Math.min(400, Math.max(200, width)) }),
}));

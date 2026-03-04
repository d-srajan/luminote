interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="group relative z-10 w-1 shrink-0 cursor-col-resize"
    >
      <div className="absolute inset-y-0 -left-0.5 w-2 transition-colors group-hover:bg-[var(--color-accent)]/20" />
      <div className="absolute inset-y-0 left-0 w-px bg-[var(--color-border)] transition-colors group-hover:bg-[var(--color-accent)]/60" />
    </div>
  );
}

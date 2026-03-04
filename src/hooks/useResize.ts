import { useCallback, useRef } from "react";

interface UseResizeOptions {
  direction: "left" | "right";
  onResize: (width: number) => void;
  initialWidth: number;
}

export function useResize({ direction, onResize, initialWidth }: UseResizeOptions) {
  const startX = useRef(0);
  const startWidth = useRef(initialWidth);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const delta = e.clientX - startX.current;
      const newWidth =
        direction === "left"
          ? startWidth.current + delta
          : startWidth.current - delta;
      onResize(newWidth);
    },
    [direction, onResize],
  );

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [handleMouseMove]);

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startX.current = e.clientX;
      startWidth.current = initialWidth;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [initialWidth, handleMouseMove, handleMouseUp],
  );

  return { startResize };
}

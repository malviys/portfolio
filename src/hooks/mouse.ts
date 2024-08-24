import { useEffect, useState } from "react";

export function useMouse() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mouseMoveListener = (ev: MouseEvent) => {
      const { clientX: x, clientY: y } = ev;

      setCoords({ x, y });
    };

    window.addEventListener("mousemove", mouseMoveListener);

    return () => {
      window.removeEventListener("mousemove", mouseMoveListener);
    };
  }, []);

  return { ...coords };
}

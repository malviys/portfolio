import { useEffect, useState } from "react";

export function useScroll() {
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    // TODO:  implement scroll throttling

    const scrollListener = (_ev: Event) => {
      setScrolling(true);
    };

    const scrollEndListener = (_ev: Event) => {
      setScrolling(false);
    };

    document.addEventListener("scroll", scrollListener);
    document.addEventListener("scrollend", scrollEndListener);

    return () => {
      document.removeEventListener("scroll", scrollListener);
      document.removeEventListener("scrollend", scrollEndListener);
    };
  }, []);

  return { scrolling };
}

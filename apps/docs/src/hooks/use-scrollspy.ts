import * as React from "react";

export function useScrollSpy(
  selectors: string[],
  options?: IntersectionObserverInit
) {
  const [activeId, setActiveId] = React.useState<string>();
  const observer = React.useRef<IntersectionObserver | null>(null);
  React.useEffect(() => {
    const elements = selectors.map((selector) =>
      document.querySelector(selector)
    );
    observer.current?.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry?.isIntersecting) {
          const id = entry.target.getAttribute("id");
          if (id) {
            setActiveId(id);
          }
        }
      });
    }, options);
    elements.forEach((el) => {
      if (el) observer.current?.observe(el);
    });
    return () => observer.current?.disconnect();
  }, [selectors, options]);

  return activeId;
}

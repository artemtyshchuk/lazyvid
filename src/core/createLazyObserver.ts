type LazyObserverOptions = {
  element: HTMLElement;
  onIntersect: () => void;
  options?: IntersectionObserverInit;
};

export const createLazyObserver = ({
  element,
  onIntersect,
  options,
}: LazyObserverOptions) => {
  if (typeof window === "undefined") return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      onIntersect();
      observer.unobserve(element);
    }
  }, options);

  observer.observe(element);

  return () => observer.disconnect();
};

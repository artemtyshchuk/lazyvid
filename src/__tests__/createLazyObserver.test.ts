import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLazyObserver } from "../core/createLazyObserver";

let observerCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;
const observeMock = vi.fn();
const unobserveMock = vi.fn();
const disconnectMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(function (this: any, cb: typeof observerCallback) {
      observerCallback = cb;
      this.observe = observeMock;
      this.unobserve = unobserveMock;
      this.disconnect = disconnectMock;
    })
  );
  vi.clearAllMocks();
});

describe("createLazyObserver", () => {
  it("observes the given element", () => {
    const element = document.createElement("div");
    createLazyObserver({ element, onIntersect: vi.fn() });

    expect(observeMock).toHaveBeenCalledWith(element);
  });

  it("calls onIntersect when element becomes visible", () => {
    const element = document.createElement("div");
    const onIntersect = vi.fn();
    createLazyObserver({ element, onIntersect });

    observerCallback([{ isIntersecting: true }]);

    expect(onIntersect).toHaveBeenCalledOnce();
  });

  it("does not call onIntersect when element is not visible", () => {
    const element = document.createElement("div");
    const onIntersect = vi.fn();
    createLazyObserver({ element, onIntersect });

    observerCallback([{ isIntersecting: false }]);

    expect(onIntersect).not.toHaveBeenCalled();
  });

  it("unobserves element after first intersection", () => {
    const element = document.createElement("div");
    createLazyObserver({ element, onIntersect: vi.fn() });

    observerCallback([{ isIntersecting: true }]);

    expect(unobserveMock).toHaveBeenCalledWith(element);
  });

  it("returns a cleanup function that disconnects", () => {
    const element = document.createElement("div");
    const cleanup = createLazyObserver({ element, onIntersect: vi.fn() });

    cleanup?.();

    expect(disconnectMock).toHaveBeenCalledOnce();
  });

  it("passes options to IntersectionObserver", () => {
    const element = document.createElement("div");
    const options = { threshold: 0.5, rootMargin: "100px" };
    createLazyObserver({ element, onIntersect: vi.fn(), options });

    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      options
    );
  });
});

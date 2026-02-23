import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { LazyVideo } from "../react/LazyVideo";

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

const sources = [
  { src: "/video.webm", type: "video/webm" },
  { src: "/video.mp4", type: "video/mp4" },
];

describe("LazyVideo", () => {
  it("renders a video element", () => {
    const { container } = render(<LazyVideo sources={sources} />);
    const video = container.querySelector("video");

    expect(video).toBeInTheDocument();
  });

  it("renders without source tags initially", () => {
    const { container } = render(<LazyVideo sources={sources} />);
    const sourceTags = container.querySelectorAll("source");

    expect(sourceTags).toHaveLength(0);
  });

  it("passes native video attributes", () => {
    const { container } = render(
      <LazyVideo sources={sources} muted loop className="test-video" />
    );
    const video = container.querySelector("video") as HTMLVideoElement;

    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveAttribute("class", "test-video");
  });

  it("inserts source tags on intersection", () => {
    const { container } = render(<LazyVideo sources={sources} />);

    observerCallback([{ isIntersecting: true }]);

    const sourceTags = container.querySelectorAll("source");
    expect(sourceTags).toHaveLength(2);
    expect(sourceTags[0]).toHaveAttribute("src", "/video.webm");
    expect(sourceTags[0]).toHaveAttribute("type", "video/webm");
    expect(sourceTags[1]).toHaveAttribute("src", "/video.mp4");
    expect(sourceTags[1]).toHaveAttribute("type", "video/mp4");
  });

  it("calls onLoaded after intersection", () => {
    const onLoaded = vi.fn();
    render(<LazyVideo sources={sources} onLoaded={onLoaded} />);

    observerCallback([{ isIntersecting: true }]);

    expect(onLoaded).toHaveBeenCalledOnce();
  });

  it("does not insert source tags when not intersecting", () => {
    const { container } = render(<LazyVideo sources={sources} />);

    observerCallback([{ isIntersecting: false }]);

    const sourceTags = container.querySelectorAll("source");
    expect(sourceTags).toHaveLength(0);
  });
});

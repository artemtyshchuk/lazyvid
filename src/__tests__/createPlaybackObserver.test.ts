import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPlaybackObserver } from "../core/createPlaybackObserver";

let observerCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;
const observeMock = vi.fn();
const disconnectMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(function (this: any, cb: typeof observerCallback) {
      observerCallback = cb;
      this.observe = observeMock;
      this.disconnect = disconnectMock;
    })
  );
  vi.clearAllMocks();
});

function createMockVideo() {
  const video = document.createElement("video");
  video.play = vi.fn().mockResolvedValue(undefined);
  video.pause = vi.fn();
  return video;
}

describe("createPlaybackObserver", () => {
  it("observes the video element", () => {
    const video = createMockVideo();
    createPlaybackObserver({ video });

    expect(observeMock).toHaveBeenCalledWith(video);
  });

  it("calls play when video enters viewport", () => {
    const video = createMockVideo();
    createPlaybackObserver({ video });

    observerCallback([{ isIntersecting: true }]);

    expect(video.play).toHaveBeenCalledOnce();
  });

  it("calls pause when video leaves viewport", () => {
    const video = createMockVideo();
    createPlaybackObserver({ video });

    observerCallback([{ isIntersecting: false }]);

    expect(video.pause).toHaveBeenCalledOnce();
  });

  it("handles play rejection silently", () => {
    const video = createMockVideo();
    video.play = vi.fn().mockRejectedValue(new Error("autoplay blocked"));
    createPlaybackObserver({ video });

    expect(() => {
      observerCallback([{ isIntersecting: true }]);
    }).not.toThrow();
  });

  it("returns a cleanup function that disconnects", () => {
    const video = createMockVideo();
    const cleanup = createPlaybackObserver({ video });

    cleanup?.();

    expect(disconnectMock).toHaveBeenCalledOnce();
  });
});

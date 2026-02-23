type PlaybackObserverOptions = {
  video: HTMLVideoElement;
  options?: IntersectionObserverInit;
};

export const createPlaybackObserver = ({
  video,
  options,
}: PlaybackObserverOptions) => {
  if (typeof window === "undefined") return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, options);

  observer.observe(video);

  return () => observer.disconnect();
};

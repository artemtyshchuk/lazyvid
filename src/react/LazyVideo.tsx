import { useEffect, useRef, useState } from "react";
import { createLazyObserver } from "../core/createLazyObserver";
import { createPlaybackObserver } from "../core/createPlaybackObserver";
import { VideoSource } from "../types/VideoSource";

type LazyVideoProps = {
  sources: VideoSource[];
  threshold?: number;
  rootMargin?: string;
  pauseOnLeave?: boolean;
  onLoaded?: () => void;
} & React.VideoHTMLAttributes<HTMLVideoElement>;

export const LazyVideo = ({
  sources,
  threshold = 0,
  rootMargin = "200px",
  pauseOnLeave = false,
  onLoaded,
  ...videoProps
}: LazyVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sourcesRef = useRef(sources);
  const onLoadedRef = useRef(onLoaded);
  const [loaded, setLoaded] = useState(false);

  sourcesRef.current = sources;
  onLoadedRef.current = onLoaded;

  useEffect(() => {
    const elem = videoRef.current;
    if (!elem) return;

    return createLazyObserver({
      element: elem,
      options: { threshold, rootMargin },
      onIntersect: () => {
        if (sourcesRef.current.length === 0) return;

        sourcesRef.current.forEach(({ src, type }) => {
          const source = document.createElement("source");
          source.src = src;
          source.type = type;
          elem.appendChild(source);
        });

        elem.load();
        setLoaded(true);
        onLoadedRef.current?.();
      },
    });
  }, [threshold, rootMargin]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !loaded || !pauseOnLeave) return;

    return createPlaybackObserver({ video });
  }, [loaded, pauseOnLeave]);

  return <video ref={videoRef} {...videoProps} />;
};

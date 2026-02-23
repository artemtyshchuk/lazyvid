# lazyvid

Lazy-load `<video>` sources with predictable behavior.

`lazyvid` renders an empty `<video>` element and injects `<source>` tags only when the element enters the viewport.  
Until then — nothing downloads.

It relies on IntersectionObserver for visibility tracking and lets the browser handle native format selection (`webm`, `mp4`, etc).

~2 KB (ESM bundle). Zero dependencies. Full TypeScript support.

```tsx
<LazyVideo
  sources={[
    { src: "/hero.webm", type: "video/webm" },
    { src: "/hero.mp4", type: "video/mp4" },
  ]}
  muted
  autoPlay
  loop
/>
```

Single component. No additional setup.

## Why?

Browsers start fetching `<video>` sources as soon as `<source>` elements are present in the DOM.
On media-heavy pages, this means unnecessary bandwidth usage and background CPU activity — even if the user never scrolls to the video.

`lazyvid` avoids that by delaying source injection until the element becomes visible (with configurable preload offset).

- No user-agent checks.
- No format guessing.

The browser still decides which source to play.

## What it does

- Renders an empty `<video>`
- Observes it with IntersectionObserver
- Injects `<source>` elements when it enters the viewport
- Optionally pauses playback when it leaves

That’s it.

## Install

```bash
npm install lazyvid
```

Requires React 18 or 19.

## Usage

### Basic — just lazy load it

```tsx
import { LazyVideo } from "lazyvid";

<LazyVideo
  sources={[
    { src: "/promo.webm", type: "video/webm" },
    { src: "/promo.mp4", type: "video/mp4" },
  ]}
  controls
/>;
```

Sources are listed in priority order. The browser takes the first format it supports — put your lightest format first.

### Background video that pauses off-screen

```tsx
<LazyVideo
  sources={[
    { src: "/bg.webm", type: "video/webm" },
    { src: "/bg.mp4", type: "video/mp4" },
  ]}
  autoPlay
  muted
  loop
  pauseOnLeave
  style={{ width: "100%", objectFit: "cover" }}
/>
```

When the user scrolls away — video pauses. Scrolls back — resumes. No wasted CPU on invisible playback.

### With poster and loading callback

```tsx
const [ready, setReady] = useState(false);

<div style={{ position: "relative" }}>
  {!ready && <div className="skeleton" />}
  <LazyVideo
    sources={[{ src: "/intro.mp4", type: "video/mp4" }]}
    poster="/intro-thumb.jpg"
    controls
    onLoaded={() => setReady(true)}
  />
</div>;
```

### Start loading earlier

By default, loading starts 200px before the video is visible. Want more buffer?

```tsx
<LazyVideo
  sources={[{ src: "/hero.mp4", type: "video/mp4" }]}
  rootMargin="500px"
  muted
  autoPlay
/>
```

## Props

| Prop           | Type                  | Default   | Description                                     |
| -------------- | --------------------- | --------- | ----------------------------------------------- |
| `sources`      | `VideoSource[]`       | required  | `{ src, type }` objects in priority order       |
| `threshold`    | `number`              | `0`       | How much of the element should be visible (0–1) |
| `rootMargin`   | `string`              | `"200px"` | Start loading before the element is in view     |
| `pauseOnLeave` | `boolean`             | `false`   | Pause when out of viewport, resume when back    |
| `onLoaded`     | `() => void`          | —         | Fires when sources are injected                 |
| `...rest`      | `VideoHTMLAttributes` | —         | Any native `<video>` attribute works            |

## How it works

1. Renders an empty `<video>` — nothing downloads
2. IntersectionObserver watches it (with `rootMargin` for early preloading)
3. Element enters viewport → `<source>` tags injected → browser picks best format → loading starts
4. Observer disconnects (one-time job)
5. If `pauseOnLeave` is on, a second observer manages play/pause on scroll

## Types

```ts
import { LazyVideo, type VideoSource } from "lazyvid";
```

## License

MIT

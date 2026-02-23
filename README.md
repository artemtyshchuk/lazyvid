# lazy-video

Stop loading videos your users never see.

`lazy-video` is a tiny React component that defers video loading until the element is actually in the viewport. Drop it in, pass your sources, and forget about it — the browser does the rest.

```tsx
<LazyVideo
  sources={[
    { src: '/hero.webm', type: 'video/webm' },
    { src: '/hero.mp4', type: 'video/mp4' },
  ]}
  muted
  autoPlay
  loop
/>
```

No config files. No providers. No hooks to wire up. Just a component.

## Why?

You have a landing page with a beautiful background video. Problem: the browser starts downloading it immediately, even if the user never scrolls that far. Multiply that by 3-4 videos on a page and you're burning bandwidth for nothing.

`lazy-video` solves this with IntersectionObserver under the hood:

- Video stays empty until it enters the viewport
- Sources are injected on demand — browser picks the best format
- Optional auto-pause when the user scrolls past

~2 KB. Zero dependencies. Full TypeScript support.

## Install

```bash
npm install lazy-video
```

Requires React 18 or 19.

## Usage

### Basic — just lazy load it

```tsx
import { LazyVideo } from 'lazy-video';

<LazyVideo
  sources={[
    { src: '/promo.webm', type: 'video/webm' },
    { src: '/promo.mp4', type: 'video/mp4' },
  ]}
  controls
/>
```

Sources are listed in priority order. The browser takes the first format it supports — put your lightest format first.

### Background video that pauses off-screen

```tsx
<LazyVideo
  sources={[
    { src: '/bg.webm', type: 'video/webm' },
    { src: '/bg.mp4', type: 'video/mp4' },
  ]}
  autoPlay
  muted
  loop
  pauseOnLeave
  style={{ width: '100%', objectFit: 'cover' }}
/>
```

When the user scrolls away — video pauses. Scrolls back — resumes. No wasted CPU on invisible playback.

### With poster and loading callback

```tsx
const [ready, setReady] = useState(false);

<div style={{ position: 'relative' }}>
  {!ready && <div className="skeleton" />}
  <LazyVideo
    sources={[{ src: '/intro.mp4', type: 'video/mp4' }]}
    poster="/intro-thumb.jpg"
    controls
    onLoaded={() => setReady(true)}
  />
</div>
```

### Start loading earlier

By default, loading starts 200px before the video is visible. Want more buffer?

```tsx
<LazyVideo
  sources={[{ src: '/hero.mp4', type: 'video/mp4' }]}
  rootMargin="500px"
  muted
  autoPlay
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sources` | `VideoSource[]` | required | `{ src, type }` objects in priority order |
| `threshold` | `number` | `0` | How much of the element should be visible (0–1) |
| `rootMargin` | `string` | `"200px"` | Start loading before the element is in view |
| `pauseOnLeave` | `boolean` | `false` | Pause when out of viewport, resume when back |
| `onLoaded` | `() => void` | — | Fires when sources are injected |
| `...rest` | `VideoHTMLAttributes` | — | Any native `<video>` attribute works |

## How it works

1. Renders an empty `<video>` — nothing downloads
2. IntersectionObserver watches it (with `rootMargin` for early preloading)
3. Element enters viewport → `<source>` tags injected → browser picks best format → loading starts
4. Observer disconnects (one-time job)
5. If `pauseOnLeave` is on, a second observer manages play/pause on scroll

## Types

```ts
import { LazyVideo, type VideoSource } from 'lazy-video';
```

## License

MIT

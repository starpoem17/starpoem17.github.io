<script>
  // Holographic card: tilts toward the pointer, glare follows the pointer, foil shine shifts with it.
  // `foil` picks the foil effect: 'rainbow' (rainbow over the whole card), 'v' (Pokemon V style foil)
  // or 'rainbow-rare' (Pokemon Rainbow Rare style: broad rainbow and glitter).
  // `foilMask` (image URL) limits the foil and its glare to the mask's opaque area; the rest gets a soft glare.
  // `active` moves the card to the screen center and enlarges it; the parent owns that state.
  import { Spring } from 'svelte/motion';

  let { image, name, active = false, ontoggle, foil = 'rainbow', foilMask } = $props();

  const INTERACT = { stiffness: 0.066, damping: 0.25 };
  const SNAP_BACK = { stiffness: 0.01, damping: 0.06 };
  const POPOVER = { stiffness: 0.033, damping: 0.45 };

  const rotate = new Spring({ x: 0, y: 0 }, INTERACT);
  const glare = new Spring({ x: 50, y: 50, o: 0 }, INTERACT);
  const shine = new Spring({ x: 50, y: 50 }, INTERACT);
  const pop = new Spring({ x: 0, y: 0, s: 1 }, POPOVER);

  let card, translater;
  let leaveTimer;

  const clamp = (v) => Math.min(100, Math.max(0, v));

  function setPointerSprings({ stiffness, damping }) {
    for (const s of [rotate, glare, shine]) {
      s.stiffness = stiffness;
      s.damping = damping;
    }
  }

  function onpointermove(e) {
    clearTimeout(leaveTimer);
    setPointerSprings(INTERACT);
    const r = translater.getBoundingClientRect();
    const px = clamp(((e.clientX - r.left) / r.width) * 100);
    const py = clamp(((e.clientY - r.top) / r.height) * 100);
    rotate.target = { x: -(px - 50) / 3.5, y: (py - 50) / 2 };
    glare.target = { x: px, y: py, o: 1 };
    shine.target = { x: 37 + px * 0.26, y: 33 + py * 0.34 };
  }

  function onpointerleave() {
    leaveTimer = setTimeout(() => {
      setPointerSprings(SNAP_BACK);
      rotate.target = { x: 0, y: 0 };
      glare.target = { x: 50, y: 50, o: 0 };
      shine.target = { x: 50, y: 50 };
    }, 500);
  }

  $effect(() => {
    if (active) {
      // The outer element is never transformed by this component, so its rect is the resting place.
      const r = card.getBoundingClientRect();
      const s = Math.min((innerWidth * 0.85) / r.width, (innerHeight * 0.85) / r.height);
      pop.target = {
        x: innerWidth / 2 - (r.left + r.width / 2),
        y: innerHeight / 2 - (r.top + r.height / 2),
        s,
      };
    } else {
      pop.target = { x: 0, y: 0, s: 1 };
      // The shrinking card may leave the pointer outside without a pointerleave event.
      onpointerleave();
    }
  });

  const fromCenter = $derived(
    Math.min(1, Math.hypot(glare.current.x - 50, glare.current.y - 50) / 50),
  );
</script>

<div
  class="card"
  class:active
  bind:this={card}
  style:--rotate-x="{rotate.current.x}deg"
  style:--rotate-y="{rotate.current.y}deg"
  style:--pointer-x="{glare.current.x}%"
  style:--pointer-y="{glare.current.y}%"
  style:--card-opacity={glare.current.o}
  style:--from-center={fromCenter}
  style:--shine-x="{shine.current.x}%"
  style:--shine-y="{shine.current.y}%"
  style:--translate-x="{pop.current.x}px"
  style:--translate-y="{pop.current.y}px"
  style:--scale={pop.current.s}
  style:--foil-mask={foilMask ? `url(${foilMask})` : undefined}
>
  <button
    class="translater"
    bind:this={translater}
    aria-label={name}
    aria-pressed={active}
    {onpointermove}
    {onpointerleave}
    onclick={ontoggle}
  >
    <div class="rotator">
      <img class="art" src={image} alt={name} />
      {#if foilMask}<div class="soft-glare"></div>{/if}
      <div class="shine {foil}"></div>
      {#if foil === 'rainbow-rare'}<div class="sparkle"></div>{/if}
      <div class="glare {foil}"></div>
    </div>
  </button>
</div>

<style>
  .card {
    width: 100%;
    height: 100%;
  }

  .translater {
    all: unset;
    display: block;
    width: 100%;
    height: 100%;
    cursor: pointer;
    /* No will-change here or on .rotator: with it, Chrome may keep the bitmap drawn at the resting size
       and stretch it when the card is enlarged (up to ~2.9x), which blurs the enlarged card. */
    transform: translate3d(var(--translate-x), var(--translate-y), 0) scale(var(--scale));
  }
  /* While enlarged, dragging on a touch screen tilts the card instead of scrolling. */
  .active .translater {
    touch-action: none;
  }

  .rotator {
    position: relative;
    width: 100%;
    height: 100%;
    transform: perspective(600px) rotateY(var(--rotate-x)) rotateX(var(--rotate-y));
    box-shadow: 0 calc(10 * var(--u)) calc(30 * var(--u)) rgb(0 0 0 / 0.5);
    /* The card image includes the Figma border, whose outer corners are rounded by 10px;
       clip the shadow, shine and glare to the same corners. */
    border-radius: calc(10 * var(--u));
    overflow: hidden;
  }

  .art,
  .soft-glare,
  .shine,
  .sparkle,
  .glare {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  /* Each blended layer is masked itself: a masked wrapper would isolate the layers from the art. */
  .shine,
  .sparkle,
  .glare {
    mask-image: var(--foil-mask, none);
    mask-size: 100% 100%;
  }

  .art {
    display: block;
    object-fit: cover;
    object-position: top;
  }

  /* Rainbow foil: two gradients blended, shifted by the pointer, brightened onto the art. */
  .shine.rainbow {
    background-image:
      repeating-linear-gradient(
        110deg,
        hsl(0 100% 60%) 0%,
        hsl(50 100% 60%) 6%,
        hsl(120 100% 60%) 12%,
        hsl(190 100% 60%) 18%,
        hsl(260 100% 60%) 24%,
        hsl(330 100% 60%) 30%,
        hsl(0 100% 60%) 36%
      ),
      repeating-linear-gradient(
        -45deg,
        #0e152e 0%,
        hsl(180 10% 60%) 3.8%,
        hsl(180 29% 66%) 4.5%,
        hsl(180 10% 60%) 5.2%,
        #0e152e 10%,
        #0e152e 12%
      );
    background-size: 400% 400%, 300% 300%;
    background-position:
      var(--shine-x) var(--shine-y),
      var(--shine-x) var(--shine-y);
    background-blend-mode: overlay;
    mix-blend-mode: color-dodge;
    filter: brightness(calc(0.4 + var(--from-center) * 0.25)) contrast(1.4) saturate(1.1);
    opacity: calc(var(--card-opacity) * 0.55);
  }

  /* Light spot under the pointer; edges far from the pointer darken slightly. */
  .glare.rainbow {
    background: radial-gradient(
      farthest-corner circle at var(--pointer-x) var(--pointer-y),
      hsl(0 0% 100% / 0.8) 10%,
      hsl(0 0% 100% / 0.4) 25%,
      hsl(0 0% 0% / 0.45) 90%
    );
    mix-blend-mode: overlay;
    opacity: var(--card-opacity);
  }

  /* Pokemon V style foil: horizontal pastel rainbow bands colored onto diagonal foil lines, with a
     shadow away from the pointer; a second copy moves the other way and is mixed in with soft-light.
     The layer is screened rather than color-dodged: like color-dodge, dark foil lines leave the card
     unchanged and light ones brighten it, but screen also changes fully saturated colors (color-dodge
     and soft-light cannot change a 0 or 255 channel, e.g. the pure red card border). User choice,
     2026-11-14, over hard-light (border turned almost black) and color (border turned gray). */
  .shine.v,
  .shine.v::after {
    background-image:
      repeating-linear-gradient(
        0deg,
        hsl(0 95% 75%) 5%,
        hsl(50 95% 70%) 10%,
        hsl(100 90% 70%) 15%,
        hsl(170 95% 75%) 20%,
        hsl(225 95% 75%) 25%,
        hsl(285 90% 75%) 30%,
        hsl(0 95% 75%) 35%
      ),
      repeating-linear-gradient(
        130deg,
        hsl(225 50% 12%) 0%,
        hsl(185 12% 58%) 4%,
        hsl(185 30% 68%) 4.6%,
        hsl(185 12% 58%) 5.2%,
        hsl(225 50% 12%) 9.5%,
        hsl(225 50% 12%) 12%
      ),
      radial-gradient(
        farthest-corner circle at var(--pointer-x) var(--pointer-y),
        hsl(0 0% 0% / 0.1) 10%,
        hsl(0 0% 0% / 0.3) 110%
      );
    background-blend-mode: hue, hard-light;
  }
  .shine.v {
    background-size: 200% 700%, 300% 100%, 200% 100%;
    background-position:
      0% var(--shine-y),
      var(--shine-x) var(--shine-y),
      var(--shine-x) var(--shine-y);
    filter: brightness(0.8) contrast(2.5) saturate(0.8);
    mix-blend-mode: screen;
    opacity: var(--card-opacity);
  }
  .shine.v::after {
    content: '';
    position: absolute;
    inset: 0;
    background-size: 200% 400%, 200% 100%, 200% 100%;
    background-position:
      0% var(--shine-y),
      calc(100% - var(--shine-x)) calc(100% - var(--shine-y)),
      var(--shine-x) var(--shine-y);
    filter: contrast(2.5) saturate(1.5);
    mix-blend-mode: soft-light;
  }
  /* Pokemon Rainbow Rare style foil: two broad rainbow gradients at -30 and -60 degrees moving in
     opposite directions with the pointer. Screened like the 'v' foil, so it adds colored light even
     on the pure red border. */
  .shine.rainbow-rare {
    --rr-stops: hsl(0 90% 55%), hsl(40 95% 55%), hsl(90 80% 50%), hsl(180 80% 50%), hsl(220 85% 60%),
      hsl(280 80% 60%), hsl(330 85% 58%);
    background-image:
      linear-gradient(-30deg, var(--rr-stops), var(--rr-stops), var(--rr-stops), hsl(0 90% 55%)),
      linear-gradient(-60deg, var(--rr-stops), var(--rr-stops), var(--rr-stops), hsl(0 90% 55%));
    background-size: 400% 400%;
    background-position:
      var(--pointer-x) var(--pointer-y),
      calc(100% - var(--pointer-x)) calc(100% - var(--pointer-y));
    background-blend-mode: soft-light;
    mix-blend-mode: screen;
    opacity: calc(var(--card-opacity) * 0.8);
  }
  /* Glitter: a tiling sparkle texture (public/images/foil/glitter.png, black = neutral), lit by a
     radial light at the pointer and shifted slightly with it, screened onto the card. */
  .sparkle {
    background-image:
      radial-gradient(
        farthest-corner circle at var(--pointer-x) var(--pointer-y),
        hsl(0 0% 100%) 0%,
        hsl(0 0% 60%) 25%,
        hsl(0 0% 15%) 60%
      ),
      url('/images/foil/glitter.png');
    background-size: 100% 100%, calc(160 * var(--u)) calc(160 * var(--u));
    background-position:
      center,
      calc(var(--shine-x) * 0.3) calc(var(--shine-y) * 0.3);
    background-blend-mode: multiply;
    mix-blend-mode: screen;
    opacity: var(--card-opacity);
  }

  /* Bright spot at the pointer, darker away from it; hard-light so it shows on the red border. */
  .glare.v,
  .glare.rainbow-rare {
    background: radial-gradient(
      farthest-corner circle at var(--pointer-x) var(--pointer-y),
      hsl(0 0% 100%) 0%,
      hsl(210 5% 55% / 0.35) 45%,
      hsl(0 0% 20% / 0.85) 130%
    );
    mix-blend-mode: hard-light;
    filter: contrast(1.6);
    opacity: calc(var(--card-opacity) * 0.5);
  }

  /* Outside the foil mask (the manga panels): only a faint light spot, so the art stays readable.
     overlay leaves white unchanged and lightens gray tones slightly. */
  .soft-glare {
    background: radial-gradient(
      farthest-corner circle at var(--pointer-x) var(--pointer-y),
      hsl(0 0% 100% / 0.7) 10%,
      hsl(0 0% 100% / 0.3) 30%,
      transparent 70%
    );
    mix-blend-mode: overlay;
    opacity: calc(var(--card-opacity) * 0.35);
  }
</style>

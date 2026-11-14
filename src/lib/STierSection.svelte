<script>
  // S tier intro (Figma frames 1-9): one pinned section whose GSAP timeline is scrubbed by scroll.
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import HoloCard from './HoloCard.svelte';

  gsap.registerPlugin(ScrollTrigger);

  let { data } = $props();
  // The intro turns the tier letter into the first letter of the title, so the title must start with it.
  const rest = $derived.by(() => {
    if (!data.title.startsWith(data.tier)) {
      throw new Error(`Title "${data.title}" must start with the tier letter "${data.tier}"`);
    }
    return data.title.slice(data.tier.length);
  });

  let section, intro, title, base, lightRest, suffix, shade, cardsRow;
  let openCard = $state(null);

  function buildTimeline() {
    const tierLetters = title.querySelectorAll('.tier');
    const slots = cardsRow.querySelectorAll('.slot');
    const letter = tierLetters[0];
    // Frame 4 shows "S Tier" centered at x=959.5 (Figma), on the title line.
    // toStart: distance from the tier letter's place in the title to that start, in design units (--u).
    // Everything scales with --u, so this stays valid after a resize.
    const u = Math.min(innerWidth / 1920, innerHeight / 1080);
    const letterLeft = (base.getBoundingClientRect().left + letter.offsetLeft - innerWidth / 2) / u;
    // The suffix's padding only widens its mask box (see the CSS); exclude it from the text width.
    const suffixWidth = suffix.offsetWidth - 2 * parseFloat(getComputedStyle(suffix).paddingLeft);
    const startWidth = (letter.offsetWidth + suffixWidth) / u;
    const toStart = 959.5 - 960 - startWidth / 2 - letterLeft;
    const startDy = 0;

    // Moves are CSS variables in design units, so no tween depends on the viewport size.
    // Every tween states its start values so scrubbing back restores each frame exactly.
    const intro1 = { '--i0': '-100%', '--i1': '0%' };
    const intro2 = { '--i0': '0%', '--i1': '100%' };
    const intro3 = { '--i0': '100%', '--i1': '200%' };
    const restHidden = { '--g0': '-100%', '--g1': '0%' };
    const restHalf = { '--g0': '0%', '--g1': '100%' };
    const restFull = { '--g0': '100%', '--g1': '200%' };
    const shadeBlack = { '--l': 1, '--r': 1 };
    const shadeHalf = { '--l': 0.5, '--r': 1 };
    const shadeNone = { '--l': 0, '--r': 0 };
    const shadeDim = { '--l': 0.5, '--r': 0.5 };
    const letterStart = { '--dx': toStart, '--dy': startDy };
    const suffixShown = { '--t0': '100%', '--t1': '200%' };
    const suffixGone = { '--t0': '-100%', '--t1': '0%' };
    const slotHidden = { opacity: 0, '--rise': 120 };

    gsap.set(intro, intro1);
    gsap.set(lightRest, restHidden);
    gsap.set(shade, shadeBlack);
    gsap.set(tierLetters, { opacity: 0, ...letterStart });
    gsap.set(suffix, suffixShown);
    gsap.set(title, { '--ty': 0 });
    gsap.set(slots, slotHidden);

    const tl = gsap.timeline({
      defaults: { ease: 'power1.inOut', immediateRender: false },
      scrollTrigger: { trigger: section, start: 'top top', end: '+=700%', pin: true, scrub: 1 },
    });

    const linear = { duration: 1, ease: 'none' };

    tl.to({}, { duration: 0.5 }) // frame 1: "Tier List"
      .fromTo(intro, intro1, { ...intro2, ...linear }) // frame 2: fades from the left
      .fromTo(intro, intro2, { ...intro3, ...linear }) // frame 3: black
      .fromTo(tierLetters, { opacity: 0 }, { opacity: 1, duration: 0.6 }, '+=0.3') // frame 4: "S Tier"
      .addLabel('move', '+=0.3')
      // frame 5 in between, frame 6 at the end: "S" reaches its place, " Tier" is wiped from the right
      .fromTo(tierLetters, letterStart, { '--dx': 0, '--dy': 0, duration: 1 }, 'move')
      .fromTo(suffix, suffixShown, { ...suffixGone, ...linear }, 'move')
      .addLabel('reveal')
      .fromTo(lightRest, restHidden, { ...restHalf, ...linear }, 'reveal') // frame 7
      .fromTo(shade, shadeBlack, { ...shadeHalf, ...linear }, 'reveal')
      .addLabel('reveal2')
      .fromTo(lightRest, restHalf, { ...restFull, ...linear }, 'reveal2') // frame 8
      .fromTo(shade, shadeHalf, { ...shadeNone, ...linear }, 'reveal2')
      .addLabel('cards', '+=0.4')
      .fromTo(title, { '--ty': 0 }, { '--ty': 158 - 540, duration: 1.2 }, 'cards') // frame 9
      .fromTo(shade, shadeNone, { ...shadeDim, duration: 1.2 }, 'cards')
      .fromTo(slots, slotHidden, { opacity: 1, '--rise': 0, duration: 0.8, stagger: 0.1 }, 'cards+=0.3')
      .to({}, { duration: 0.5 });
  }

  onMount(() => {
    let ctx;
    let destroyed = false;
    // Text widths are measured, so wait for the Knewave font.
    document.fonts.ready.then(() => {
      if (!destroyed) ctx = gsap.context(buildTimeline);
    });
    return () => {
      destroyed = true;
      ctx?.revert();
    };
  });

  function onscroll() {
    openCard = null;
  }
  function onkeydown(e) {
    if (e.key === 'Escape') openCard = null;
  }
</script>

<svelte:window onscroll={openCard === null ? undefined : onscroll} {onkeydown} />

<section class="s-tier" bind:this={section}>
  <img class="background" src={data.background} alt="" />
  <div class="shade" bind:this={shade}></div>

  <h1 class="intro" bind:this={intro}>Tier List</h1>

  <div class="title" bind:this={title}>
    <h2 class="title-base" bind:this={base}><span class="tier">{data.tier}</span>{rest}</h2>
    <div class="title-light" aria-hidden="true">
      <span class="tier">{data.tier}<span class="suffix" bind:this={suffix}>{' Tier'}</span></span><span class="rest" bind:this={lightRest}>{rest}</span>
    </div>
  </div>

  <div class="cards" bind:this={cardsRow}>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="backdrop" class:show={openCard !== null} onclick={() => (openCard = null)}></div>
    {#each data.cards as card, i}
      <div class="slot" class:raised={openCard === i}>
        <HoloCard
          image={card.image}
          name={card.name}
          foil={data.cardFoil}
          foilMask={data.cardFoilMask}
          active={openCard === i}
          ontoggle={() => (openCard = openCard === i ? null : i)}
        />
      </div>
    {/each}
  </div>
</section>

<style>
  .s-tier {
    position: relative;
    height: 100vh;
    overflow: hidden;
    background: #000;
  }

  .background,
  .shade {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  /* Figma shows the top 1472x828 of the 1472x980 image (16:9). */
  .background {
    object-fit: cover;
    object-position: top;
  }
  .shade {
    background: linear-gradient(90deg, rgb(0 0 0 / var(--l)), rgb(0 0 0 / var(--r)));
  }

  .intro,
  .title {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    margin: 0;
  }

  .intro,
  .title-base,
  .title-light {
    margin: 0;
    font: 400 calc(200 * var(--u)) / normal 'Knewave', sans-serif;
    white-space: nowrap;
  }

  /* Above the title: the title's black layer sits in the same place and would cover "Tier List". */
  .intro {
    z-index: 1;
    color: #fff;
    mask-image: linear-gradient(90deg, transparent var(--i0), #000 var(--i1));
  }

  .title-base,
  .title-light {
    grid-area: 1 / 1;
    position: relative;
  }
  .title-base {
    color: #000;
    /* Figma: 10px black stroke outside the glyphs. Half of a centered stroke is hidden behind the fill. */
    -webkit-text-stroke: calc(20 * var(--u)) #000;
    paint-order: stroke fill;
  }
  .title {
    translate: 0 calc(var(--ty, 0) * var(--u));
  }
  .title-light {
    color: #fff;
  }
  /* Knewave glyphs slant past their advance width (up to 12px at 200px), and a mask clips to the box.
     Padding widens the masked box without moving the text, so the glyph ends are not cut off. */
  .title-light .rest,
  .suffix {
    padding-inline: 0.1em;
    margin-inline: -0.1em;
  }
  .title-light .rest {
    mask-image: linear-gradient(90deg, #000 var(--g0), transparent var(--g1));
  }
  .tier {
    position: relative;
    display: inline-block;
    translate: calc(var(--dx, 0) * var(--u)) calc(var(--dy, 0) * var(--u));
  }
  /* " Tier" after the letter in frames 4-5; absolute so it never shifts the title's letters.
     Svelte trims whitespace at the start of an element, so the space is an expression and kept with pre. */
  .suffix {
    position: absolute;
    left: 100%;
    top: 0;
    white-space: pre;
    mask-image: linear-gradient(90deg, #000 var(--t0), transparent var(--t1));
  }

  /* No transform here: it would make the fixed backdrop relative to this row instead of the viewport. */
  /* Figma frame 9: cards 310x430 at y=325 with 59px gaps; each card image includes its 10px border,
     so a slot is 330x450 at y=315 with 39px gaps. */
  .cards {
    position: absolute;
    top: calc(50% + (315 - 540) * var(--u));
    left: 0;
    right: 0;
    z-index: 2;
    display: flex;
    justify-content: center;
    gap: calc(39 * var(--u));
  }
  .slot {
    position: relative;
    translate: 0 calc(var(--rise, 0) * var(--u));
    width: calc(330 * var(--u));
    height: calc(450 * var(--u));
  }
  .slot.raised {
    z-index: 2;
  }

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 1;
    background: rgb(0 0 0 / 0.7);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s;
  }
  .backdrop.show {
    opacity: 1;
    pointer-events: auto;
  }
</style>

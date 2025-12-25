export let isReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

mq.addEventListener("change", (e) => {
  isReducedMotion = e.matches;
});

// Moves the light to the cursor position on every .spotlight-card.
document.querySelectorAll('.spotlight-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
    card.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
  });
});

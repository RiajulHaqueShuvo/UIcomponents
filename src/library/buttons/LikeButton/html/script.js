// Toggles every .like-button on click and updates its counter.
document.querySelectorAll('.like-button').forEach((button) => {
  const countEl = button.querySelector('.like-button__count');
  let count = Number(button.dataset.count) || 0;
  countEl.textContent = count.toLocaleString();

  button.addEventListener('click', () => {
    const liked = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(liked));
    count += liked ? 1 : -1;
    countEl.textContent = count.toLocaleString();

    if (liked) {
      // Restart the burst animation even on quick repeat clicks.
      button.classList.remove('is-bursting');
      void button.offsetWidth;
      button.classList.add('is-bursting');
    }
  });
});

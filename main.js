const rangeClass = (value) => {
  if (value <= 9) return 'range-1';
  if (value <= 19) return 'range-2';
  if (value <= 29) return 'range-3';
  if (value <= 39) return 'range-4';
  return 'range-5';
};

const applyRanges = () => {
  document.querySelectorAll('[data-n]').forEach((ball) => {
    const value = Number(ball.dataset.n);
    if (!Number.isNaN(value)) {
      ball.classList.add(rangeClass(value));
    }
  });
};

const setupReveal = () => {
  const items = [
    document.querySelector('.hero'),
    ...document.querySelectorAll('.stat-card'),
    ...document.querySelectorAll('.draw-card'),
  ].filter(Boolean);

  items.forEach((item, index) => {
    item.classList.add('reveal');
    item.style.animationDelay = `${index * 0.08}s`;
  });
};

const setupButtons = () => {
  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;

      if (action === 'highlight') {
        document.body.classList.toggle('show-ranges');
      }

      if (action === 'copy') {
        const firstNumbers = document.querySelector('[data-numbers]');
        if (!firstNumbers) return;
        const values = Array.from(firstNumbers.querySelectorAll('.ball'))
          .map((ball) => ball.textContent.trim())
          .join(' ');

        navigator.clipboard?.writeText(values).then(() => {
          button.textContent = '복사 완료';
          setTimeout(() => {
            button.textContent = '이번 회차 복사';
          }, 1500);
        });
      }
    });
  });
};

applyRanges();
setupReveal();
setupButtons();

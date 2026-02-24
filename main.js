const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xlgwaeod';

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

const randomSet = () => {
  const numbers = new Set();
  while (numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

const makeBallsHtml = (numbers) =>
  numbers.map((value) => `<span class="ball" data-n="${value}">${value}</span>`).join('');

const renderHeroSet = (numbers) => {
  const heroNumbers = document.querySelector('.hero-card [data-numbers]');
  if (!heroNumbers) return;
  heroNumbers.innerHTML = makeBallsHtml(numbers);
};

const updateStats = (numbers) => {
  const range = [0, 0, 0, 0, 0];
  let odd = 0;
  let sum = 0;

  numbers.forEach((value) => {
    if (value <= 9) range[0] += 1;
    else if (value <= 19) range[1] += 1;
    else if (value <= 29) range[2] += 1;
    else if (value <= 39) range[3] += 1;
    else range[4] += 1;

    if (value % 2 === 1) odd += 1;
    sum += value;
  });

  const rangeText = `1-9: ${range[0]}개 · 10-19: ${range[1]}개 · 20-29: ${range[2]}개 · 30-39: ${range[3]}개 · 40-45: ${range[4]}개`;
  const oddEvenText = `홀수 ${odd}개 · 짝수 ${numbers.length - odd}개`;

  const rangeEl = document.querySelector('[data-stat="range"]');
  const oddEvenEl = document.querySelector('[data-stat="odd-even"]');
  const sumEl = document.querySelector('[data-stat="sum"]');

  if (rangeEl) rangeEl.textContent = rangeText;
  if (oddEvenEl) oddEvenEl.textContent = oddEvenText;
  if (sumEl) sumEl.textContent = String(sum);
};

const renderList = (sets) => {
  const list = document.querySelector('[data-result-list]');
  if (!list) return;

  list.innerHTML = sets
    .map(
      (numbers, index) => `
        <article class="draw-card">
          <div class="draw-head"><span>세트 #${index + 1}</span></div>
          <div class="numbers" data-numbers>
            ${makeBallsHtml(numbers)}
          </div>
        </article>
      `
    )
    .join('');
};

const generate = (count = 1) => {
  const sets = Array.from({ length: count }, () => randomSet());
  const firstSet = sets[0];

  const drawId = document.querySelector('.draw-id');
  if (drawId) drawId.textContent = '세트 #1';

  renderHeroSet(firstSet);
  updateStats(firstSet);
  renderList(sets);
  applyRanges();
};

const setupReveal = () => {
  const items = [
    document.querySelector('.hero'),
    ...document.querySelectorAll('.stat-card'),
    ...document.querySelectorAll('.draw-card'),
    document.querySelector('.contact-section'),
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

      if (action === 'generate') {
        generate(1);
      }

      if (action === 'generate-multi') {
        generate(5);
      }

      if (action === 'copy') {
        const firstNumbers = document.querySelector('.hero-card [data-numbers]');
        if (!firstNumbers) return;
        const values = Array.from(firstNumbers.querySelectorAll('.ball'))
          .map((ball) => ball.textContent.trim())
          .join(' ');

        navigator.clipboard?.writeText(values).then(() => {
          button.textContent = '복사 완료';
          setTimeout(() => {
            button.textContent = '번호 복사';
          }, 1500);
        });
      }
    });
  });
};

const setupInquiryForm = () => {
  const form = document.querySelector('[data-inquiry-form]');
  const message = document.querySelector('[data-form-message]');
  const submitButton = document.querySelector('[data-submit-btn]');
  if (!form || !message || !submitButton) return;

  form.setAttribute('action', FORMSPREE_ENDPOINT);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    submitButton.disabled = true;
    submitButton.textContent = '전송 중...';
    message.textContent = '';

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      form.reset();
      message.textContent = '문의가 접수되었습니다. 빠르게 확인 후 연락드리겠습니다.';
      message.classList.remove('error');
      message.classList.add('success');
    } catch (error) {
      message.textContent = '전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
      message.classList.remove('success');
      message.classList.add('error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = '문의 보내기';
    }
  });
};

generate(1);
setupButtons();
setupInquiryForm();
setupReveal();

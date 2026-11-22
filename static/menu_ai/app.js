(() => {
  const form = document.querySelector('#generator-form');
  const results = document.querySelector('#results');
  const preview = document.querySelector('#menu-preview');
  const posterContent = document.querySelector('#poster-content');
  const toast = document.querySelector('#kami-toast');
  let latest = [];

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const csrf = () => document.cookie.split('; ').find(part => part.startsWith('csrftoken='))?.split('=')[1] || '';
  const price = value => `${Number(value).toLocaleString('ru-RU')} ₸`;
  const typeIcon = item => /кофе|матча|чай|раф|латте/i.test(item.name) ? '☕' : /бургер/i.test(item.name) ? '🍔' : /пицц/i.test(item.name) ? '🍕' : /десерт|торт|тарт|пахлав|чизкейк|медовик/i.test(item.name) ? '🍰' : /боул|поке/i.test(item.name) ? '🥣' : '🥐';

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function itemMarkup(item) {
    return `<article class="poster-item"><span class="poster-orb">${typeIcon(item)}</span><div class="poster-item-copy"><h4>${esc(item.name)}</h4><p>${esc(item.description)}</p></div><strong class="poster-price">${price(item.price)}</strong></article>`;
  }

  function itemsMarkup(items, layout = 'poster-list') {
    if (!items.length) return '<p class="poster-empty">Сгенерированные позиции появятся здесь</p>';
    if (items.length === 1) layout = layout.replace('poster-two-columns', 'poster-one-column');
    return `<div class="poster-items ${layout}">${items.map(itemMarkup).join('')}</div>`;
  }

  function svgBarista() {
    return `<svg class="poster-svg" viewBox="0 0 360 190" role="img" aria-label="Линейная иллюстрация бариста с кофе"><g fill="none" stroke="#171717" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M114 164c2-23 6-42 18-53l-9-31c-2-24 17-45 42-45s42 19 39 43l-5 28c17 11 27 30 29 58M139 81c12 8 34 8 49-1M145 65c2-13 12-23 25-24M187 61c8-2 14-7 17-14M137 115l-34 27m73-24 34 18 30-30M64 123h42l-5 34H69zm6-9h30m-17-13c0-9 13-9 13 0M241 111h39v42h-39zm39 9h11c11 0 11 18 0 18h-11M245 103h31m-24-8c0-7 10-7 10 0"/><path d="M149 75h4m30 0h4M157 91q12 9 23 0"/></g></svg>`;
  }

  function svgHappyBurger() {
    return `<svg class="poster-art" viewBox="0 0 190 145" role="img" aria-label="Улыбающийся бургер"><g stroke="#315b3d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M25 68c0-35 31-55 70-55s70 20 70 55H25Z" fill="#f7c65c"/><path d="M24 76h142l-10 14H35z" fill="#72a76c"/><path d="M34 93h124l-9 14H43z" fill="#e98b4e"/><path d="M44 112h104c-6 18-24 23-52 23s-46-5-52-23Z" fill="#f7c65c"/><path d="M77 58v2m35-2v2m-29 14q12 12 24 0" fill="none"/></g><g fill="#e98b4e"><path d="m23 21 4 9 10 1-7 6 2 10-9-5-8 5 2-10-8-6 10-1z"/><path d="m164 25 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z"/></g></svg>`;
  }

  function svgCobaltCafe() {
    return `<svg class="poster-svg cobalt-art" viewBox="0 0 360 150" role="img" aria-label="Синие иллюстрации кофе и круассана"><g fill="none" stroke="#1457c5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M58 45h66l-8 60H66zM124 59h13c19 0 19 27 0 27h-16M68 36h49m-38-10c0-10 15-10 15 0m-4 0c0-10 15-10 15 0M222 99c-10-14-2-27 12-31 2-15 21-21 33-13 11-8 29-2 31 12 14 2 21 17 13 31-22 16-70 18-89 1Zm9-6c22 6 42 7 65 0M250 48l-4-10m30 9 5-10"/><path d="M82 122h-9m24 0h-9m-37 8h79m111-2h70"/></g></svg>`;
  }

  function svgChalkFoods() {
    return `<svg class="chalk-sketch" viewBox="0 0 390 115" role="img" aria-label="Меловые скетчи круассана и сэндвича"><g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M35 77c15-43 54-61 93-43l13 22-14 34-40 9-39-6Zm12-3 19-14 12 20m5-27 17-17 12 25m-15 27 14-24m102-27 79 3 29 23-15 33-89-3-24-27zm4 21h94m-84-17 12 16 12-15 12 17 13-15 12 17 13-14m-4-33 7-11m25 13 8-12M20 35l8 4m319 42 11-4"/><circle cx="337" cy="20" r="3"/><circle cx="169" cy="79" r="3"/></g></svg>`;
  }

  function svgKawaiiTreats() {
    return `<svg class="kawaii-art" viewBox="0 0 340 160" role="img" aria-label="Мороженое и пакетик сока"><g stroke="#ba5b8e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m67 73 30 69 32-69" fill="#f5d4e5"/><path d="M62 72c-7-19 10-38 29-32 14-28 52-11 43 17 21 4 23 32 5 42H72c-9-5-13-15-10-27Z" fill="#ffb5d4"/><path d="M87 80v2m27 0v2m-23 11q9 8 18 0" fill="none"/><path d="M99 38c0-14 12-19 19-15 8-11 24-3 22 9-11 6-27 9-41 6Z" fill="#e94d65"/><path d="M207 45h77l-8 100h-62Z" fill="#ffdf7f"/><path d="m225 45 39-24 16 4-9 20" fill="#f5a1c2"/><path d="M276 21h18v-14" fill="none"/><path d="M229 92v2m34 0v2m-25 13q10 9 20 0" fill="none"/><circle cx="239" cy="90" r="2" fill="#ba5b8e"/><circle cx="256" cy="90" r="2" fill="#ba5b8e"/></g><path d="m156 35 5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z" fill="#ef91be"/></svg>`;
  }

  function svgDonut() {
    return `<svg class="donut-illustration" viewBox="0 0 190 130" role="img" aria-label="Пончик в цветной глазури"><ellipse cx="95" cy="72" rx="73" ry="48" fill="#f6bd39" stroke="#fff3a6" stroke-width="5"/><path d="M27 68c8-28 31-34 45-27 17-22 45-20 55-5 22-11 47 5 35 31-9 20-37 13-56 12-28 1-70 21-79-11Z" fill="#f27b95"/><ellipse cx="96" cy="70" rx="18" ry="13" fill="#df2633"/><g fill="#fff"><rect x="55" y="54" width="12" height="4" rx="2" transform="rotate(25 55 54)"/><rect x="127" y="55" width="12" height="4" rx="2" transform="rotate(-23 127 55)"/><rect x="75" y="96" width="12" height="4" rx="2" transform="rotate(-20 75 96)"/><rect x="123" y="87" width="12" height="4" rx="2" transform="rotate(22 123 87)"/></g></svg>`;
  }

  function svgCroissant() {
    return `<svg class="espresso-croissant" viewBox="0 0 150 80" role="img" aria-label="Круассан"><path d="M18 52c8-28 34-42 57-34 19-18 46-9 57 14l-14 22-22 5-19-12-20 17-22-2Z" fill="#ddb47b" stroke="#53392d" stroke-width="3" stroke-linejoin="round"/><path d="m31 47 12 13m9-30 9 20m23-31 1 26m27-16-11 21" fill="none" stroke="#fff0ce" stroke-width="4" stroke-linecap="round"/></svg>`;
  }

  function svgKidsStars() {
    return `<div class="star-doodles" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div><svg class="kids-cloud" viewBox="0 0 200 70" role="img" aria-label="Облачко и звёздочки"><path d="M44 54h112a20 20 0 0 0 0-40 33 33 0 0 0-62-1 24 24 0 0 0-50 7 17 17 0 0 0 0 34Z" fill="#fff" stroke="#e8c65e" stroke-width="3"/><path d="m98 25 4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="#f4d35e"/></svg>`;
  }

  function svgSummerSplash() {
    return `<svg class="summer-splash-art" viewBox="0 0 360 110" role="img" aria-label="Летние фрукты и свежие блюда"><g opacity=".9"><circle cx="55" cy="55" r="36" fill="#f18b70"/><path d="M22 52q33-44 66 0M22 57q33 43 66 0" fill="#ef705d"/><circle cx="44" cy="44" r="2" fill="#fff"/><circle cx="58" cy="38" r="2" fill="#fff"/><circle cx="70" cy="48" r="2" fill="#fff"/><circle cx="178" cy="57" r="38" fill="#f2cb69"/><circle cx="178" cy="57" r="18" fill="#fff8dc"/><circle cx="178" cy="57" r="10" fill="#f0a74d"/><circle cx="303" cy="56" r="36" fill="#88b77a"/><path d="M273 52q30-34 60 0m-60 8q30 34 60 0" fill="#f2cb69"/><path d="M303 19q-5-17 12-18" fill="none" stroke="#488653" stroke-width="5" stroke-linecap="round"/></g></svg>`;
  }

  function svgSunnyFoods() {
    return `<svg class="sunny-foods" viewBox="0 0 90 420" role="img" aria-label="Арбуз, глазунья, овощной боул и лапша"><g><circle cx="45" cy="48" r="35" fill="#f4c5a2"/><path d="M15 52q30-54 60 0Q45 99 15 52Z" fill="#e95e59"/><path d="M17 54q28 35 56 0" fill="none" stroke="#43885b" stroke-width="7"/><g fill="#4b342d"><ellipse cx="35" cy="49" rx="2" ry="4"/><ellipse cx="46" cy="61" rx="2" ry="4"/><ellipse cx="54" cy="45" rx="2" ry="4"/></g><circle cx="45" cy="153" r="35" fill="#f7dfad"/><circle cx="45" cy="153" r="24" fill="#fffdf6"/><circle cx="48" cy="151" r="12" fill="#f2a33b"/><circle cx="45" cy="258" r="35" fill="#95bc7d"/><circle cx="45" cy="258" r="26" fill="#f0c37a"/><circle cx="36" cy="250" r="8" fill="#e46e53"/><circle cx="54" cy="250" r="8" fill="#d88250"/><path d="M30 268q15-22 30 0" fill="none" stroke="#6c944d" stroke-width="7"/><circle cx="45" cy="365" r="35" fill="#eab884"/><path d="M21 357q23-26 48 0m-48 8q23-26 48 0m-44 9q20-18 40 0" fill="none" stroke="#b95539" stroke-width="4"/><circle cx="35" cy="345" r="5" fill="#77a85b"/><circle cx="53" cy="350" r="5" fill="#e5c34f"/></g></svg>`;
  }

  function posterMarkup(items) {
    const heading = '<h2 class="poster-title">МЕНЮ</h2>';
    const list = layout => itemsMarkup(items, layout);
    if (preview.classList.contains('red-diner')) return `${heading}${list('poster-two-columns red-diner-items')}`;
    if (preview.classList.contains('pink-wave')) return `${heading}${svgBarista()}${list('poster-two-columns')}`;
    if (preview.classList.contains('green-orange')) return `<h2 class="poster-title">НАШЕ МЕНЮ</h2>${svgHappyBurger()}${list('poster-two-columns green-items')}`;
    if (preview.classList.contains('vintage-calligraphy')) return `<h2 class="poster-title">НАШЕ МЕНЮ</h2>${list('poster-two-columns vintage-items')}`;
    if (preview.classList.contains('cobalt-cafe')) return `${heading}${svgCobaltCafe()}${list('poster-two-columns')}`;
    if (preview.classList.contains('blue-chalk')) return `${heading}${svgChalkFoods()}${list('poster-two-columns chalk-items')}`;
    if (preview.classList.contains('sunny-bowls')) return `${heading}${svgSunnyFoods()}${list('poster-two-columns sunny-items')}`;
    if (preview.classList.contains('kawaii-check')) return `${heading}${svgKawaiiTreats()}${list('poster-two-columns kawaii-items')}`;
    if (preview.classList.contains('pastel-stripes')) return `${heading}${list('poster-two-columns stripes-items')}`;
    if (preview.classList.contains('espresso-frame')) return `${svgCroissant()}${heading}${list('poster-two-columns espresso-items')}`;
    if (preview.classList.contains('donut-pop')) return `${heading}${svgDonut()}${list('poster-two-columns donut-items')}`;
    if (preview.classList.contains('kids-sky')) return `${heading}${svgKidsStars()}${list('poster-two-columns kids-items')}`;
    if (preview.classList.contains('red-grid-burger')) return `${heading}${list('poster-two-columns grid-items')}${svgHappyBurger()}`;
    if (preview.classList.contains('mint-leaf')) return `${heading}${list('poster-two-columns mint-items')}`;
    if (preview.classList.contains('summer-fresh')) return `${heading}${svgSummerSplash()}${list('poster-two-columns summer-items')}`;
    if (preview.classList.contains('matcha')) return `${heading}${list('poster-two-columns matcha-items')}`;
    if (preview.classList.contains('esentai')) return `${heading}${list('poster-two-columns esentai-items')}`;
    return `${heading}${list('poster-two-columns')}`;
  }

  function drawPoster() { posterContent.innerHTML = posterMarkup(latest); }

  function render(items) {
    latest = items;
    results.innerHTML = items.map((item, index) => `<article class="dish-card">
      <div class="flex justify-between gap-3 items-start"><span class="text-[10px] tracking-[.18em] uppercase text-leaf">${esc(item.category)}</span><span class="font-semibold whitespace-nowrap">${price(item.price)}</span></div>
      ${item.choice ? '<div class="kami-choice">Выбор Ками 🤍</div>' : ''}
      <h3 class="font-serif text-3xl mt-4">${esc(item.name)}</h3><p class="text-sm text-ink/65 leading-relaxed mt-2">${esc(item.description)}</p>
      <div class="flex flex-wrap justify-between gap-3 mt-4 text-xs text-ink/50"><span>${esc(item.nutrition)}</span><button class="save-item text-leaf hover:underline" data-index="${index}">${window.USER_AUTH ? 'Сохранить в моё меню' : 'Войти, чтобы сохранить'}</button></div>
      <div class="mt-5 pt-4 border-t border-ink/10 flex justify-between items-center gap-3"><span class="text-[10px] uppercase tracking-widest text-ink/40">для ваших соцсетей</span><button class="copy-post rounded-full border border-ink/15 px-4 py-2 text-xs hover:bg-sage" data-index="${index}">Скопировать для соцсетей</button></div><p class="copy-feedback hidden text-xs text-leaf mt-2">Скопировано!</p>
    </article>`).join('');
    drawPoster();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = document.querySelector('#generate-btn');
    button.disabled = true;
    button.textContent = 'Подбираем вкусы… ✦';
    results.innerHTML = '<div class="rounded-3xl bg-white p-12 text-center text-ink/50 animate-pulse">Ищем сочетание с настроением Алматы…</div>';
    try {
      const payload = Object.fromEntries(new FormData(form));
      payload.inspiration = form.dataset.inspiration === 'true';
      const response = await fetch('/api/generate/', {method:'POST',headers:{'Content-Type':'application/json','X-CSRFToken':csrf()},body:JSON.stringify(payload)});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ошибка генерации');
      render(data.items);
    } catch (error) {
      results.innerHTML = `<div class="rounded-3xl bg-rose p-7">${esc(error.message)}</div>`;
    } finally {
      form.dataset.inspiration = 'false';
      button.disabled = false;
      button.innerHTML = 'Сгенерировать идеи <span class="ml-2">✦</span>';
    }
  });

  results.addEventListener('click', async event => {
    const copyButton = event.target.closest('.copy-post');
    if (copyButton) {
      try { await navigator.clipboard.writeText(latest[Number(copyButton.dataset.index)].social_post); copyButton.textContent = 'Скопировано!'; }
      catch { copyButton.textContent = 'Не удалось скопировать'; }
      copyButton.closest('.dish-card').querySelector('.copy-feedback').classList.remove('hidden');
      setTimeout(() => copyButton.textContent = 'Скопировать для соцсетей', 1800);
    }
    const saveButton = event.target.closest('.save-item');
    if (!saveButton) return;
    if (!window.USER_AUTH) { location.href = '/accounts/login/?next=' + encodeURIComponent('/#generator'); return; }
    const response = await fetch('/api/save/', {method:'POST',headers:{'Content-Type':'application/json','X-CSRFToken':csrf()},body:JSON.stringify(latest[Number(saveButton.dataset.index)])});
    const data = await response.json();
    if (response.ok) { saveButton.textContent = '✓ Сохранено'; saveButton.disabled = true; }
    else alert(data.error || 'Не удалось сохранить');
  });

  const templates = ['blue-chalk','matcha','esentai','red-diner','pink-wave','green-orange','vintage-calligraphy','cobalt-cafe','sunny-bowls','kawaii-check','pastel-stripes','espresso-frame','donut-pop','kids-sky','red-grid-burger','mint-leaf','summer-fresh'];
  document.querySelectorAll('.template-tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.template-tab').forEach(button => button.classList.remove('active'));
    tab.classList.add('active');
    preview.className = `menu-poster ${templates.includes(tab.dataset.template) ? tab.dataset.template : templates[0]}`;
    drawPoster();
  }));
  document.querySelector('#cafe-name').addEventListener('input', drawPoster);

  document.querySelector('#kami-inspiration').addEventListener('click', () => {
    form.querySelector('[name="prompt"]').value = 'Вдохновение Ками: уютный тёплый десерт с алматинским апортом и корицей';
    form.dataset.inspiration = 'true';
    showToast('Секретное блюдо дня уже готовится ✨');
    form.dispatchEvent(new Event('submit', {bubbles:true,cancelable:true}));
  });

  document.querySelector('#poster-stamp').addEventListener('click', () => showToast('Маленькая подсказка Ками: красивое меню начинается с любимого вкуса 🤍'));
  document.querySelector('#print-menu').addEventListener('click', () => window.print());
  document.querySelector('#download-menu').addEventListener('click', async () => {
    const button = document.querySelector('#download-menu');
    button.textContent = 'Готовим изображение…';
    try {
      const canvas = await html2canvas(preview, {scale:2,backgroundColor:null});
      const link = document.createElement('a');
      link.download = 'menu-generator-poster.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch { alert('Не удалось подготовить PNG. Попробуйте печать / PDF.'); }
    finally { button.textContent = 'Скачать меню · PNG'; }
  });

  drawPoster();
})();

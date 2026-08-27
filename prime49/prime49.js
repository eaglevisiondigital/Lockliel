(() => {
  const calc = document.querySelector('[data-p49-calculator]');
  if (!calc) return;

  const slider = calc.querySelector('#p49-volume');
  const VOLUME_INCREMENT = 5000;
  const PAYOUT_PER_INCREMENT = 20;
  const DEFAULT_VOLUME = 15000;
  const money = n => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(n);

  const update = () => {
    const volume = Number(slider.value || DEFAULT_VOLUME);
    const annualVolume = volume * 12;
    const monthlyPayout = (volume / VOLUME_INCREMENT) * PAYOUT_PER_INCREMENT;
    const annualPayout = monthlyPayout * 12;

    slider.setAttribute('aria-valuenow', String(volume));
    slider.setAttribute('aria-valuetext', `${money(volume)} monthly card volume; ${money(monthlyPayout)} estimated monthly payout`);

    document.querySelectorAll('[data-p49-volume],[data-p49-monthly],[data-p49-result-volume]')
      .forEach(el => el.textContent = money(volume));
    document.querySelectorAll('[data-p49-annual]')
      .forEach(el => el.textContent = money(annualVolume));
    document.querySelectorAll('[data-p49-monthly-payout],[data-p49-result-monthly],[data-p49-hero-payout]')
      .forEach(el => el.textContent = money(monthlyPayout));
    document.querySelectorAll('[data-p49-annual-payout],[data-p49-result-annual]')
      .forEach(el => el.textContent = money(annualPayout));

    document.querySelectorAll('[data-p49-form-volume]')
      .forEach(el => el.value = money(volume));
    document.querySelectorAll('[data-p49-form-monthly-payout]')
      .forEach(el => el.value = money(monthlyPayout));
    document.querySelectorAll('[data-p49-form-annual-payout]')
      .forEach(el => el.value = money(annualPayout));

    const hero = document.getElementById('hero-monthly-volume');
    if (hero) hero.textContent = money(volume);
  };

  slider.addEventListener('input', update);
  slider.addEventListener('change', update);
  update();

  document.querySelectorAll('.p49-accordion details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.p49-accordion details').forEach(other => {
        if (other !== detail) other.open = false;
      });
    });
  });
})();

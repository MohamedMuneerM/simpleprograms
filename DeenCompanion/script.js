(() => {
  'use strict';

  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;
  const PRAYER_METHOD = 2; // ISNA
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const pad = (n) => String(n).padStart(2, '0');
  const ddmmyyyy = (d) => `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;

  function to12h(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${pad(m)} ${period}`;
  }

  /* ---------------- Prayer Times ---------------- */

  const prayerStatus = document.getElementById('prayer-status');
  const prayerGrid = document.getElementById('prayer-grid');
  const nextPrayerEl = document.getElementById('next-prayer');
  const locateBtn = document.getElementById('locate-btn');
  const cityInput = document.getElementById('city-input');
  const cityBtn = document.getElementById('city-btn');

  const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  function renderPrayerTimings(timings) {
    prayerGrid.hidden = false;
    nextPrayerEl.hidden = false;
    const now = new Date();
    let nextName = null;
    let nextDiffMinutes = Infinity;

    const cards = prayerGrid.querySelectorAll('.prayer-card');
    cards.forEach((card) => {
      const name = card.dataset.name;
      const raw = timings[name];
      if (!raw) return;
      const clean = raw.split(' ')[0];
      card.querySelector('.p-time').textContent = to12h(clean);
      card.classList.remove('active');

      const [h, m] = clean.split(':').map(Number);
      const prayerDate = new Date(now);
      prayerDate.setHours(h, m, 0, 0);
      let diff = (prayerDate - now) / 60000;
      if (diff < 0) diff += 24 * 60;
      if (diff < nextDiffMinutes) {
        nextDiffMinutes = diff;
        nextName = name;
      }
    });

    const activeCard = prayerGrid.querySelector(`[data-name="${nextName}"]`);
    if (activeCard) activeCard.classList.add('active');

    const hrs = Math.floor(nextDiffMinutes / 60);
    const mins = Math.round(nextDiffMinutes % 60);
    const inText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    nextPrayerEl.textContent = `Next: ${nextName} in ${inText}`;
  }

  async function fetchTimingsByCoords(lat, lng) {
    prayerStatus.textContent = 'Fetching prayer times…';
    const url = `https://api.aladhan.com/v1/timings/${ddmmyyyy(new Date())}?latitude=${lat}&longitude=${lng}&method=${PRAYER_METHOD}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Prayer times request failed');
    const json = await res.json();
    renderPrayerTimings(json.data.timings);
    const place = json.data.meta && json.data.meta.timezone ? json.data.meta.timezone : '';
    prayerStatus.textContent = place ? `Showing times for timezone: ${place}` : 'Showing today’s prayer times.';
  }

  async function fetchTimingsByCity(city) {
    prayerStatus.textContent = `Looking up ${city}…`;
    const url = `https://api.aladhan.com/v1/timingsByAddress/${ddmmyyyy(new Date())}?address=${encodeURIComponent(city)}&method=${PRAYER_METHOD}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('City lookup failed');
    const json = await res.json();
    if (json.code !== 200) throw new Error('City not found');
    renderPrayerTimings(json.data.timings);
    prayerStatus.textContent = `Showing prayer times for ${city}.`;
  }

  locateBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      prayerStatus.textContent = 'Geolocation is not supported by your browser.';
      return;
    }
    prayerStatus.textContent = 'Requesting your location…';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchTimingsByCoords(pos.coords.latitude, pos.coords.longitude).catch(() => {
          prayerStatus.textContent = 'Could not fetch prayer times. Please try again.';
        });
        window.__lastCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      },
      () => {
        prayerStatus.textContent = 'Location access denied. Try searching a city instead.';
      }
    );
  });

  cityBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (!city) return;
    fetchTimingsByCity(city).catch(() => {
      prayerStatus.textContent = 'Could not find that city. Try “City, Country”.';
    });
  });
  cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') cityBtn.click();
  });

  /* ---------------- Qibla ---------------- */

  const qiblaBtn = document.getElementById('qibla-btn');
  const qiblaStatus = document.getElementById('qibla-status');
  const qiblaDegreeEl = document.getElementById('qibla-degree');
  const needle = document.getElementById('needle');
  const orientationBtn = document.getElementById('orientation-btn');

  let qiblaBearing = null;
  let deviceHeadingActive = false;

  function bearingToQibla(lat, lng) {
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const phi1 = toRad(lat);
    const phi2 = toRad(KAABA_LAT);
    const deltaLambda = toRad(KAABA_LNG - lng);
    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
    let theta = toDeg(Math.atan2(y, x));
    return (theta + 360) % 360;
  }

  async function findQibla() {
    if (!navigator.geolocation) {
      qiblaStatus.textContent = 'Geolocation is not supported by your browser.';
      return;
    }
    qiblaStatus.textContent = 'Locating you…';
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`);
          const json = await res.json();
          qiblaBearing = json.data && typeof json.data.direction === 'number'
            ? json.data.direction
            : bearingToQibla(latitude, longitude);
        } catch {
          qiblaBearing = bearingToQibla(latitude, longitude);
        }
        qiblaDegreeEl.hidden = false;
        qiblaDegreeEl.textContent = `${qiblaBearing.toFixed(1)}° from true North`;
        qiblaStatus.textContent = 'Point the top of your phone toward the needle direction below.';
        if (!deviceHeadingActive) {
          needle.style.transform = `translate(-50%, -50%) rotate(${qiblaBearing}deg)`;
        }
        orientationBtn.hidden = false;
      },
      () => {
        qiblaStatus.textContent = 'Location access denied. Enable it to find your Qibla direction.';
      }
    );
  }

  qiblaBtn.addEventListener('click', findQibla);

  function handleOrientation(e) {
    let heading = null;
    if (typeof e.webkitCompassHeading === 'number') {
      heading = e.webkitCompassHeading;
    } else if (typeof e.alpha === 'number') {
      heading = 360 - e.alpha;
    }
    if (heading === null || qiblaBearing === null) return;
    deviceHeadingActive = true;
    const rotation = (qiblaBearing - heading + 360) % 360;
    needle.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
  }

  orientationBtn.addEventListener('click', async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceOrientationEvent.requestPermission();
        if (perm !== 'granted') {
          qiblaStatus.textContent = 'Compass permission denied.';
          return;
        }
      } catch {
        qiblaStatus.textContent = 'Compass not available on this device.';
        return;
      }
    }
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
    qiblaStatus.textContent = 'Compass enabled. Hold your phone flat.';
  });

  /* ---------------- Hijri Date ---------------- */

  const hijriToday = document.getElementById('hijri-today');
  const hijriDateInput = document.getElementById('hijri-date-input');
  const hijriConvertBtn = document.getElementById('hijri-convert-btn');
  const hijriResult = document.getElementById('hijri-result');

  function formatHijri(h) {
    return `${h.day} ${h.month.en} ${h.year} AH`;
  }

  async function loadTodayHijri() {
    try {
      const res = await fetch(`https://api.aladhan.com/v1/gToH/${ddmmyyyy(new Date())}`);
      const json = await res.json();
      hijriToday.textContent = `Today is ${formatHijri(json.data.hijri)} (${json.data.hijri.weekday.en})`;
    } catch {
      hijriToday.textContent = 'Could not load today’s Hijri date.';
    }
  }
  loadTodayHijri();

  hijriDateInput.value = todayISO();
  hijriConvertBtn.addEventListener('click', async () => {
    const val = hijriDateInput.value;
    if (!val) return;
    const d = new Date(val + 'T00:00:00');
    hijriResult.textContent = 'Converting…';
    try {
      const res = await fetch(`https://api.aladhan.com/v1/gToH/${ddmmyyyy(d)}`);
      const json = await res.json();
      hijriResult.textContent = `${d.toLocaleDateString()} corresponds to ${formatHijri(json.data.hijri)}.`;
    } catch {
      hijriResult.textContent = 'Conversion failed. Please try again.';
    }
  });

  /* ---------------- Zakat Calculator ---------------- */

  const zakatForm = document.getElementById('zakat-form');
  const zakatResult = document.getElementById('zakat-result');
  const NISAB_GOLD_G = 87.48;
  const NISAB_SILVER_G = 612.36;

  zakatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = (id) => parseFloat(document.getElementById(id).value) || 0;

    const cash = val('z-cash');
    const goldG = val('z-gold-g');
    const goldPrice = val('z-gold-price');
    const silverG = val('z-silver-g');
    const silverPrice = val('z-silver-price');
    const invest = val('z-invest');
    const owed = val('z-owed');
    const debts = val('z-debts');

    const goldValue = goldG * goldPrice;
    const silverValue = silverG * silverPrice;
    const grossWealth = cash + goldValue + silverValue + invest + owed;
    const zakatableWealth = Math.max(0, grossWealth - debts);

    const nisabBasis = zakatForm.querySelector('input[name="nisab"]:checked').value;
    let nisabValue;
    if (nisabBasis === 'gold') {
      nisabValue = NISAB_GOLD_G * goldPrice;
    } else {
      nisabValue = NISAB_SILVER_G * silverPrice;
    }

    zakatResult.hidden = false;

    if (nisabValue <= 0) {
      zakatResult.innerHTML = `<h3>Enter a metal price</h3><p>Please enter today's ${nisabBasis} price per gram so we can calculate your Nisab threshold.</p>`;
      return;
    }

    if (zakatableWealth < nisabValue) {
      zakatResult.innerHTML = `
        <h3>Below Nisab</h3>
        <p>Your zakatable wealth of <strong>${zakatableWealth.toFixed(2)}</strong> is below the Nisab threshold of <strong>${nisabValue.toFixed(2)}</strong>. Zakat is not due this year, though voluntary charity (sadaqah) is always encouraged.</p>
      `;
      return;
    }

    const zakatDue = zakatableWealth * 0.025;
    zakatResult.innerHTML = `
      <h3>Zakat Due</h3>
      <p class="amount">${zakatDue.toFixed(2)}</p>
      <div class="row"><span>Total zakatable wealth</span><span>${zakatableWealth.toFixed(2)}</span></div>
      <div class="row"><span>Nisab threshold (${nisabBasis})</span><span>${nisabValue.toFixed(2)}</span></div>
      <div class="row"><span>Zakat rate</span><span>2.5%</span></div>
    `;
  });

  /* ---------------- Dua of the Day ---------------- */

  const DUAS = [
    {
      ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      translit: 'Rabbana atina fid-dunya hasanatan wa fil akhirati hasanatan wa qina adhaban-nar',
      meaning: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.'
    },
    {
      ar: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
      translit: 'Rabbi ishrah li sadri wa yassir li amri',
      meaning: 'My Lord, expand for me my chest and ease for me my task.'
    },
    {
      ar: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
      translit: 'Hasbunallahu wa ni’mal wakeel',
      meaning: 'Allah is sufficient for us, and He is the best disposer of affairs.'
    },
    {
      ar: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
      translit: 'Allahumma a’inni ‘ala dhikrika wa shukrika wa husni ‘ibadatik',
      meaning: 'O Allah, help me to remember You, to thank You, and to worship You in the best manner.'
    },
    {
      ar: 'رَبِّ زِدْنِي عِلْمًا',
      translit: 'Rabbi zidni ‘ilma',
      meaning: 'My Lord, increase me in knowledge.'
    },
    {
      ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
      translit: 'Allahumma inni as’alukal ‘afiyata fid-dunya wal akhirah',
      meaning: 'O Allah, I ask You for well-being in this world and the Hereafter.'
    }
  ];

  function dayOfYear(d) {
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d - start;
    return Math.floor(diff / 86400000);
  }

  const todaysDua = DUAS[dayOfYear(new Date()) % DUAS.length];
  document.getElementById('dua-arabic').textContent = todaysDua.ar;
  document.getElementById('dua-translit').textContent = todaysDua.translit;
  document.getElementById('dua-meaning').textContent = todaysDua.meaning;

  /* ---------------- Auto-load on first visit ---------------- */
  // Intentionally no auto geolocation prompt on load; user opts in via button (privacy-friendly, avoids permission-prompt bounce).
})();

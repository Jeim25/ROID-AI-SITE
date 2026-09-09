// ── MOBILE NAV TOGGLE ──
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }
  populatePerformanceMetrics();
});

// ── MAIN TOOL UPLOAD ──
function triggerUpload(idx) { document.getElementById('fileInput' + idx).click(); }

function handleFile(event, idx) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const zone = document.getElementById('dropzone' + idx);
    const preview = document.getElementById('preview' + idx);
    preview.src = e.target.result;
    preview.style.display = 'block';
    const icon = zone.querySelector('.upload-icon'); if (icon) icon.style.display = 'none';
    const label = zone.querySelector('.upload-label'); if (label) label.style.display = 'none';
    const hint = zone.querySelector('.upload-hint'); if (hint) hint.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function handleDragOver(e, zone) { e.preventDefault(); zone.classList.add('dragover'); }
function handleDragLeave(zone) { zone.classList.remove('dragover'); }
function handleDrop(e, idx) {
  e.preventDefault();
  const zone = document.getElementById('dropzone' + idx);
  zone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const preview = document.getElementById('preview' + idx);
    preview.src = ev.target.result;
    preview.style.display = 'block';
    const icon = zone.querySelector('.upload-icon'); if (icon) icon.style.display = 'none';
    const label = zone.querySelector('.upload-label'); if (label) label.style.display = 'none';
    const hint = zone.querySelector('.upload-hint'); if (hint) hint.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// ── INTERPOLATE ──
function triggerInterpolate() {
  const wrap = document.getElementById('progressWrap');
  const bar = document.getElementById('loadingBar');
  const pct = document.getElementById('progressPct');
  const zone = document.getElementById('outputZone');
  const placeholder = document.getElementById('outputPlaceholder');
  const preview = document.getElementById('outputPreview');
  const tag = document.getElementById('outputTag');
  const dlWrap = document.getElementById('downloadWrap');

  wrap.classList.remove('hidden');
  dlWrap.classList.add('hidden');
  bar.style.width = '0';
  pct.textContent = '0%';
  placeholder.classList.remove('hidden');
  placeholder.style.display = 'flex';
  preview.style.display = 'none';
  tag.classList.add('hidden');
  zone.classList.remove('has-result');

  setTimeout(() => { bar.style.width = '40%'; pct.textContent = '40%'; }, 100);
  setTimeout(() => { bar.style.width = '75%'; pct.textContent = '75%'; }, 900);
  setTimeout(() => { bar.style.width = '100%'; pct.textContent = '100%'; }, 1800);

  setTimeout(() => {
    wrap.classList.add('hidden');
    const src0 = document.getElementById('preview0') ? document.getElementById('preview0').src : '';
    if (src0 && src0 !== window.location.href) {
      preview.src = src0;
      preview.style.display = 'block';
      placeholder.classList.add('hidden');
    } else {
      placeholder.innerHTML = '<svg class="w-8 h-8 stroke-purple-400" viewBox="0 0 24 24" fill="none" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span class="text-purple-600 font-semibold">Frame Ready</span>';
    }
    if (tag) tag.classList.remove('hidden');
    zone.classList.add('has-result');
    dlWrap.classList.remove('hidden');
  }, 2300);
}

// ── FAQ ──
function toggleFaq(item) {
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// Default metrics fallback
const defaultPerformanceSummary = {
  overall: {
    psnr: { mean: 29.25, sd: 4.96 },
    ssim: { mean: 0.950, sd: 0.03 },
    lpips: { mean: 6.32, sd: 5.10 },
    cf: { mean: 5.08, sd: 5.89 }
  },
  breakdown: {
    easy:   { psnr: 31.56, ssim: 0.960, lpips: 3.70, cf: 2.51 },
    medium: { psnr: 28.29, ssim: 0.950, lpips: 5.97, cf: 4.51 },
    hard:   { psnr: 26.85, ssim: 0.930, lpips: 1.09, cf: 9.87 }
  }
};

async function loadPerformanceMetrics() {
  try {
    const res = await fetch('./data/metrics.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.info('Loaded fallback performance metrics:', err.message);
    return defaultPerformanceSummary;
  }
}

async function populatePerformanceMetrics() {
  const psnrEl = document.getElementById('psnrMean');
  if (!psnrEl) return;

  const data = await loadPerformanceMetrics();
  const overall = data.overall || defaultPerformanceSummary.overall;
  const breakdown = data.breakdown || defaultPerformanceSummary.breakdown;

  if (overall.psnr) {
    document.getElementById('psnrMean').textContent = overall.psnr.mean.toFixed(2);
    document.getElementById('psnrSd').textContent = `SD ${overall.psnr.sd.toFixed(2)}`;
  }
  if (overall.ssim) {
    document.getElementById('ssimMean').textContent = overall.ssim.mean.toFixed(3);
    document.getElementById('ssimSd').textContent = `SD ${overall.ssim.sd.toFixed(3)}`;
  }
  if (overall.lpips) {
    document.getElementById('lpipsMean').textContent = overall.lpips.mean.toFixed(4);
    document.getElementById('lpipsSd').textContent = `SD ${overall.lpips.sd.toFixed(4)}`;
  }
  if (overall.cf) {
    document.getElementById('cfMean').textContent = overall.cf.mean.toFixed(1);
    document.getElementById('cfSd').textContent = `SD ${overall.cf.sd.toFixed(1)}`;
  }

  const easy = breakdown.easy || defaultPerformanceSummary.breakdown.easy;
  if (easy) {
    document.getElementById('easyPsnr').textContent = easy.psnr.toFixed(2);
    document.getElementById('easySsim').textContent = easy.ssim.toFixed(3);
    document.getElementById('easyLpips').textContent = easy.lpips.toFixed(4);
    document.getElementById('easyCf').textContent = easy.cf.toFixed(1);
  }

  const medium = breakdown.medium || defaultPerformanceSummary.breakdown.medium;
  if (medium) {
    document.getElementById('mediumPsnr').textContent = medium.psnr.toFixed(2);
    document.getElementById('mediumSsim').textContent = medium.ssim.toFixed(3);
    document.getElementById('mediumLpips').textContent = medium.lpips.toFixed(4);
    document.getElementById('mediumCf').textContent = medium.cf.toFixed(1);
  }

  const hard = breakdown.hard || defaultPerformanceSummary.breakdown.hard;
  if (hard) {
    document.getElementById('hardPsnr').textContent = hard.psnr.toFixed(2);
    document.getElementById('hardSsim').textContent = hard.ssim.toFixed(3);
    document.getElementById('hardLpips').textContent = hard.lpips.toFixed(4);
    document.getElementById('hardCf').textContent = hard.cf.toFixed(1);
  }

  // Comparison section population & automated computation
  const comp = data.comparison;
  if (comp && comp.metrics) {
    const metricsConfig = [
      { key: 'psnr', oursId: 'compPsnrOurs', baseId: 'compPsnrBase', deltaOursId: 'compPsnrDeltaOurs', deltaBaseId: 'compPsnrDeltaBase' },
      { key: 'ssim', oursId: 'compSsimOurs', baseId: 'compSsimBase', deltaOursId: 'compSsimDeltaOurs', deltaBaseId: 'compSsimDeltaBase' },
      { key: 'lpips', oursId: 'compLpipsOurs', baseId: 'compLpipsBase', deltaOursId: 'compLpipsDeltaOurs', deltaBaseId: 'compLpipsDeltaBase' },
      { key: 'cf', oursId: 'compCfOurs', baseId: 'compCfBase', deltaOursId: 'compCfDeltaOurs', deltaBaseId: 'compCfDeltaBase' }
    ];

    let candidateWins = 0;
    let baselineWins = 0;
    let totalCount = 0;

    metricsConfig.forEach(cfg => {
      const m = comp.metrics[cfg.key];
      if (!m) return;
      totalCount++;

      const candVal = Number(m.candidate);
      const baseVal = Number(m.baseline);
      const higherIsBetter = m.higherIsBetter !== false;
      const precision = typeof m.precision === 'number' ? m.precision : 2;
      const unit = m.unit || '';

      // Set raw displayed values
      const oursEl = document.getElementById(cfg.oursId);
      const baseEl = document.getElementById(cfg.baseId);
      if (oursEl) oursEl.textContent = candVal.toFixed(precision);
      if (baseEl) baseEl.textContent = baseVal.toFixed(precision);

      // Automated Win calculation
      const candWins = higherIsBetter ? (candVal > baseVal) : (candVal < baseVal);
      const baseWins = higherIsBetter ? (baseVal > candVal) : (baseVal < candVal);

      if (candWins) candidateWins++;
      if (baseWins) baselineWins++;

      // Automated Delta computation
      const candDiff = candVal - baseVal;
      const baseDiff = baseVal - candVal;

      const formatDelta = (diff) => {
        const sign = diff > 0 ? '+' : (diff < 0 ? '−' : '');
        return `${sign}${Math.abs(diff).toFixed(precision)}${unit}`;
      };

      const deltaOursEl = document.getElementById(cfg.deltaOursId);
      if (deltaOursEl) {
        deltaOursEl.textContent = formatDelta(candDiff);
        deltaOursEl.classList.toggle('text-success-text', candWins);
        deltaOursEl.classList.toggle('text-danger-text', !candWins);
      }

      const deltaBaseEl = document.getElementById(cfg.deltaBaseId);
      if (deltaBaseEl) {
        deltaBaseEl.textContent = formatDelta(baseDiff);
        deltaBaseEl.classList.toggle('text-success-text', baseWins);
        deltaBaseEl.classList.toggle('text-danger-text', !baseWins);
      }
    });

    // Automated summary counts
    const cWinsEl = document.getElementById('compCandidateWins');
    const bWinsEl = document.getElementById('compBaselineWins');
    if (cWinsEl) cWinsEl.textContent = `${candidateWins} / ${totalCount}`;
    if (bWinsEl) bWinsEl.textContent = `${baselineWins} / ${totalCount}`;
  }
}

// ── GALLERY TABS ──
let currentGallerySet = 1;
function switchGalleryTab(setNum) {
  currentGallerySet = setNum;
  const tabs = document.querySelectorAll('.gallery-tab');
  const panels = document.querySelectorAll('.gallery-panel');
  const numEl = document.getElementById('currentSetNum');
  if (numEl) numEl.textContent = setNum;
  
  tabs.forEach((tab, i) => {
    if (i + 1 === setNum) {
      tab.classList.add('bg-purple-600', 'text-white');
      tab.classList.remove('bg-lavender-bg', 'text-text-secondary', 'border-border');
    } else {
      tab.classList.remove('bg-purple-600', 'text-white');
      tab.classList.add('bg-lavender-bg', 'text-text-secondary', 'border-border');
    }
  });

  panels.forEach((panel, i) => {
    if (i + 1 === setNum) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });
}

function nextGallerySet() {
  const next = currentGallerySet >= 3 ? 1 : currentGallerySet + 1;
  switchGalleryTab(next);
}

function prevGallerySet() {
  const prev = currentGallerySet <= 1 ? 3 : currentGallerySet - 1;
  switchGalleryTab(prev);
}

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
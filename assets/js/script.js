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
  populateTeamMembers();
});

// ── MAIN TOOL UPLOAD ──
function triggerUpload(idx) { document.getElementById('fileInput' + idx).click(); }

async function loadFrame(file, idx) {
  if (!file) return;
  // Only real JPGs: checks the file's first bytes (FF D8 FF), so a renamed PNG is rejected too
  const head = new Uint8Array(await file.slice(0, 3).arrayBuffer());
  if (head[0] !== 0xFF || head[1] !== 0xD8 || head[2] !== 0xFF) {
    alert('Only JPG files are accepted.');
    return;
  }
  const bmp = await createImageBitmap(file);
  const [w, h] = [bmp.width, bmp.height];
  bmp.close();
  if (w !== 1920 || h !== 1080) {
    alert(`Frames must be exactly 1920×1080 (this one is ${w}×${h}).`);
    return;
  }
  const zone = document.getElementById('dropzone' + idx);
  const preview = document.getElementById('preview' + idx);
  const reader = new FileReader();
  reader.onload = function(e) {
    // Zone takes the image's own aspect ratio so the whole frame shows uncropped
    preview.onload = () => { zone.style.aspectRatio = `${preview.naturalWidth} / ${preview.naturalHeight}`; };
    preview.src = e.target.result;
    preview.style.display = 'block';
    zone.classList.add('has-image');
  };
  reader.readAsDataURL(file);
}

function handleFile(event, idx) { loadFrame(event.target.files[0], idx); }

function handleDragOver(e, zone) { e.preventDefault(); zone.classList.add('dragover'); }
function handleDragLeave(zone) { zone.classList.remove('dragover'); }
function handleDrop(e, idx) {
  e.preventDefault();
  document.getElementById('dropzone' + idx).classList.remove('dragover');
  loadFrame(e.dataTransfer.files[0], idx);
}

// ── INTERPOLATE ──
const INTERPOLATE_ENDPOINT = 'http://localhost:5000/interpolate';

async function triggerInterpolate() {
  const preview0 = document.getElementById('preview0');
  const preview1 = document.getElementById('preview1');

  // Guard: both frames must be loaded
  if (!preview0.src || preview0.src === window.location.href ||
      !preview1.src || preview1.src === window.location.href) {
    alert('Please upload both Frame 0 and Frame 1 before interpolating.');
    return;
  }

  const zone = document.getElementById('outputZone');
  const placeholder = document.getElementById('outputPlaceholder');
  const preview = document.getElementById('outputPreview');
  const dlWrap = document.getElementById('downloadWrap');
  const dlBtn = dlWrap.querySelector('button');

  // Reset UI, then hand the output box over to the spinner
  dlWrap.classList.add('hidden');
  placeholder.classList.remove('hidden');
  preview.style.display = 'none';
  zone.classList.remove('has-result');
  zone.style.aspectRatio = '';
  zone.classList.add('is-loading');

  try {
    const response = await fetch(INTERPOLATE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        frame0: preview0.src,
        frame1: preview1.src,
        t: 0.5
      })
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Interpolation failed');

    preview.onload = () => { zone.style.aspectRatio = `${preview.naturalWidth} / ${preview.naturalHeight}`; };
    preview.src = result.result;
    preview.style.display = 'block';
    zone.classList.add('has-result');

    // Download as JPEG; the server sends PNG, so re-encode through a canvas
    dlBtn.onclick = () => {
      const canvas = document.createElement('canvas');
      canvas.width = preview.naturalWidth;
      canvas.height = preview.naturalHeight;
      canvas.getContext('2d').drawImage(preview, 0, 0);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/jpeg', 1);
      a.download = 'douga.jpg';
      a.click();
    };
    dlWrap.classList.remove('hidden');

  } catch (err) {
    placeholder.innerHTML = `
      <svg class="w-8 h-8 stroke-danger-text" viewBox="0 0 24 24" fill="none" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span class="text-danger-text font-semibold">Error: ${err.message}</span>`;
  } finally {
    zone.classList.remove('is-loading');
  }
}

// ── ZOOM VIEWER (click the generated frame) ──
const viewer = document.getElementById('viewer');
const vImg = document.getElementById('viewerImg');
let vScale = 1, vFit = 1, vX = 0, vY = 0, vDrag = null, vMoved = false;

function applyView() {
  vImg.style.transform = `translate(${vX}px, ${vY}px) scale(${vScale})`;
  // Show real pixels once zoomed in, so artifacts aren't hidden by smoothing
  vImg.style.imageRendering = vScale >= 2 ? 'pixelated' : 'auto';
}

function fitView() {
  vFit = vScale = Math.min(innerWidth / vImg.naturalWidth, innerHeight / vImg.naturalHeight);
  vX = (innerWidth - vImg.naturalWidth * vScale) / 2;
  vY = (innerHeight - vImg.naturalHeight * vScale) / 2;
  applyView();
}

function openViewer(src) {
  vImg.src = src;
  viewer.showModal();
  vImg.decode().then(fitView);
}

if (viewer) {
  document.getElementById('outputPreview').addEventListener('click', e => openViewer(e.target.src));

  // Zoom toward the cursor
  viewer.addEventListener('wheel', e => {
    e.preventDefault();
    const next = Math.min(Math.max(vScale * Math.exp(-e.deltaY * 0.0015), vFit * 0.5), 32);
    vX = e.clientX - (e.clientX - vX) * (next / vScale);
    vY = e.clientY - (e.clientY - vY) * (next / vScale);
    vScale = next;
    applyView();
  }, { passive: false });

  vImg.addEventListener('pointerdown', e => {
    vDrag = { x: e.clientX - vX, y: e.clientY - vY };
    vMoved = false;
    vImg.setPointerCapture(e.pointerId);
    vImg.classList.add('dragging');
  });
  vImg.addEventListener('pointermove', e => {
    if (!vDrag) return;
    vX = e.clientX - vDrag.x;
    vY = e.clientY - vDrag.y;
    vMoved = true;
    applyView();
  });
  vImg.addEventListener('pointerup', () => { vDrag = null; vImg.classList.remove('dragging'); });
  vImg.addEventListener('dblclick', fitView);

  // Click on the dark background closes, but not at the end of a drag
  viewer.addEventListener('click', e => {
    if (e.target === viewer && !vMoved) viewer.close();
    vMoved = false;
  });
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

// ── TEAM MEMBERS DATA & POPULATION ──

// SVG icon helpers — keeps renderTeamCard readable
const socialIcons = {
  github: `<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
  linkedin: `<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.22c-.93 0-1.68.75-1.68 1.68s.75 1.68 1.68 1.68 1.68-.75 1.68-1.68-.75-1.68-1.68-1.68z"/></svg>`,
  facebook: `<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  email: `<svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`
};

function buildSocialLink(href, icon, label) {
  return `
    <a href="${href}" target="_blank" rel="noopener noreferrer"
       class="w-8 h-8 rounded-lg bg-purple-50 border border-border flex items-center justify-center text-purple-600 transition-colors duration-150 hover:bg-purple-600 hover:text-white"
       aria-label="${label}">
      ${icon}
    </a>`;
}

function renderTeamCard(member) {
  const s = member.social || {};

  // Build social links — skip placeholders ("#")
  const links = [];
  if (s.github && s.github !== '#')   links.push(buildSocialLink(s.github, socialIcons.github, 'GitHub'));
  if (s.linkedin && s.linkedin !== '#') links.push(buildSocialLink(s.linkedin, socialIcons.linkedin, 'LinkedIn'));
  if (s.facebook && s.facebook !== '#') links.push(buildSocialLink(s.facebook, socialIcons.facebook, 'Facebook'));
  if (s.email && s.email !== '#') {
    const href = s.email.startsWith('mailto:') ? s.email : `mailto:${s.email}`;
    links.push(buildSocialLink(href, socialIcons.email, 'Email'));
  }

  const contributionsHtml = (member.contributions || []).map(item => `
    <div class="flex items-start gap-2 text-xs sm:text-sm text-text-secondary text-justify">
      <span class="status-dot bg-purple-600 mt-1.5 shrink-0"></span>
      <span>${item}</span>
    </div>`).join('');

  return `
    <article class="card-base p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start">
      <!-- Avatar & socials -->
      <div class="flex flex-col items-center shrink-0 w-full md:w-44">
        <div class="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-purple-200 bg-linear-to-br from-purple-100 via-purple-50 to-white flex items-center justify-center shadow-xs">
          <img class="w-full h-full object-cover" src="${member.image || ''}" alt="${member.name || 'Team Member'}" />
        </div>
        <div class="flex items-center gap-2 mt-4">${links.join('')}</div>
      </div>
      <!-- Info -->
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <h3 class="text-xl sm:text-2xl font-bold text-text-primary mb-1">${member.name || ''}</h3>
          <p class="text-sm font-semibold text-purple-600 mb-3">${member.role || ''}</p>
          <p class="text-sm text-text-secondary leading-relaxed mb-4 text-justify">${member.bio || ''}</p>
          <div class="space-y-1.5 mb-4">${contributionsHtml}</div>
        </div>
      </div>
    </article>`;
}

// Team cards come from data/team.json; "#" hides a social button until it is filled in
async function populateTeamMembers() {
  const container = document.getElementById('teamGrid');
  if (!container) return;
  try {
    const res = await fetch('./data/team.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    container.innerHTML = (await res.json()).map(renderTeamCard).join('');
  } catch (err) {
    container.innerHTML = `<p class="text-text-muted text-center col-span-full">Team details couldn't be loaded (${err.message}).</p>`;
  }
}

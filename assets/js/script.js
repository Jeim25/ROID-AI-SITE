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

const performanceSummary = {
  overall: {
    psnr: { mean: 29.25, sd: 4.96 },
    ssim: { mean: 0.950, sd: 0.03 },
    lpips: { mean: 6.32, sd: 5.10 },
    cf: { mean: 5.08, sd: 5.89 }
  },
  easy:   { psnr: 31.56, ssim: 0.960, lpips: 3.70, cf: 2.51 },
  medium: { psnr: 28.29, ssim: 0.950, lpips: 5.97, cf: 4.51 },
  hard:   { psnr: 26.85, ssim: 0.930, lpips: 1.09, cf: 9.87 }
};

function populatePerformanceMetrics() {
  const psnrEl = document.getElementById('psnrMean');
  if (!psnrEl) return;
  const summary = performanceSummary;

  document.getElementById('psnrMean').textContent = summary.overall.psnr.mean.toFixed(2);
  document.getElementById('psnrSd').textContent = `SD ${summary.overall.psnr.sd.toFixed(2)}`;
  document.getElementById('ssimMean').textContent = summary.overall.ssim.mean.toFixed(3);
  document.getElementById('ssimSd').textContent = `SD ${summary.overall.ssim.sd.toFixed(3)}`;
  document.getElementById('lpipsMean').textContent = summary.overall.lpips.mean.toFixed(4);
  document.getElementById('lpipsSd').textContent = `SD ${summary.overall.lpips.sd.toFixed(4)}`;
  document.getElementById('cfMean').textContent = summary.overall.cf.mean.toFixed(1);
  document.getElementById('cfSd').textContent = `SD ${summary.overall.cf.sd.toFixed(1)}`;

  document.getElementById('easyPsnr').textContent = summary.easy.psnr.toFixed(2);
  document.getElementById('easySsim').textContent = summary.easy.ssim.toFixed(3);
  document.getElementById('easyLpips').textContent = summary.easy.lpips.toFixed(4);
  document.getElementById('easyCf').textContent = summary.easy.cf.toFixed(1);

  document.getElementById('mediumPsnr').textContent = summary.medium.psnr.toFixed(2);
  document.getElementById('mediumSsim').textContent = summary.medium.ssim.toFixed(3);
  document.getElementById('mediumLpips').textContent = summary.medium.lpips.toFixed(4);
  document.getElementById('mediumCf').textContent = summary.medium.cf.toFixed(1);

  document.getElementById('hardPsnr').textContent = summary.hard.psnr.toFixed(2);
  document.getElementById('hardSsim').textContent = summary.hard.ssim.toFixed(3);
  document.getElementById('hardLpips').textContent = summary.hard.lpips.toFixed(4);
  document.getElementById('hardCf').textContent = summary.hard.cf.toFixed(1);
}

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
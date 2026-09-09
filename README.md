# ROID-AI Research Site

The official research web UI for **ROI-Guided Deformable Convolutions for Automated Anime In-betweening** — an undergraduate thesis project at the Polytechnic University of the Philippines.

🔗 **Live Site:** [jeim25.github.io/ROID-AI-SITE](https://jeim25.github.io/ROID-AI-SITE)  
📦 **Model Repository:** [ROID-AI](https://github.com/Jeim25/ROID-AI)

---

## Overview

This site serves two purposes:

1. **Interactive Demo** — Upload two anime frames and run the ROID-AI interpolation model to generate the in-between frame in real time *(pending model integration)*
2. **Evaluation Dashboard** — Browse benchmark results comparing ROID-AI against AnimeInterp across four metrics on the ATD-12K dataset

---

## Pages

### `index.html` — Demo
The main landing page. Users can upload a pair of anime frames and submit them to the interpolation model. Designed to showcase the model's output directly in the browser.

### `evaluation.html` — Benchmark Results
Presents a structured comparison of ROID-AI vs. AnimeInterp across:

| Metric | Measures |
|---|---|
| PSNR | Signal fidelity |
| SSIM | Structural similarity |
| LPIPS | Perceptual quality |
| Chamfer Distance | Geometric consistency |

Results are broken down by motion difficulty tier: **Easy**, **Medium**, **Hard**, and **Overall** — evaluated on the ATD-12K dataset (2,000 test triplets).

---

## Tech Stack

- HTML5, Vanilla JavaScript
- Styling: [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/cli`)
- Hosted on **GitHub Pages**

---

## Status

| Feature | Status |
|---|---|
| Evaluation dashboard | ✅ Complete |
| Demo UI (frame upload) | ✅ Complete |
| Model integration | 🔄 Pending — awaiting model completion |

---

## Related

- [ROID-AI Model](https://github.com/Jeim25/ROID-AI) — The interpolation model this site interfaces with
- Built independently by [Jeim25](https://github.com/Jeim25) as part of a 4-member thesis team

---

## Screenshots

*Coming soon*

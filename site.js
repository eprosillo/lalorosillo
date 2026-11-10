// Shared behavior for every page:
// - mobile menu toggle
// - home page cover tiles (from data/pieces.json)
// - series page galleries and lightbox (from data/pieces.json)
(function () {
  // Mobile menu
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
    });
  }

  const page = document.body.dataset.page;
  const series = document.body.dataset.series;
  if (!page && !series) return;

  fetch("data/pieces.json", { cache: "no-cache" })
    .then((res) => res.json())
    .then((data) => {
      if (page === "home") fillTiles(data);
      if (series) renderSeries(data, series);
    })
    .catch((err) => console.error(err));

  // Home: set each tile's cover image from the series list
  function fillTiles(data) {
    for (const s of data.series) {
      const img = document.querySelector(`.tile[data-series="${s.id}"] img`);
      if (!img || !s.cover) continue;
      img.src = s.cover;
      img.alt = s.title;
      img.addEventListener("error", () => img.remove());
    }
  }

  // Series pages
  function renderSeries(data, seriesId) {
    const gallery = document.getElementById("gallery");
    const empty = document.getElementById("empty");
    if (!gallery) return;

    const items = data.pieces.filter((p) => p.series === seriesId);
    if (empty) empty.hidden = items.length > 0;

    // Series note: use the text from pieces.json, or remove the line while it's still a placeholder
    const note = document.querySelector(".note");
    const info = data.series.find((x) => x.id === seriesId);
    if (note) {
      if (info && info.note && !info.note.startsWith("[")) {
        note.textContent = info.note;
      } else {
        note.remove();
      }
    }

    // Mark the current series in the series index
    document.querySelectorAll(".series-index a").forEach((a) => {
      if (a.dataset.series === seriesId) a.setAttribute("aria-current", "page");
    });

    let row = null;
    for (const [index, piece] of items.entries()) {
      const fig = document.createElement("figure");
      fig.className = "piece";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "piece-button";
      button.setAttribute("aria-label", `Enlarge ${piece.title}`);

      const img = document.createElement("img");
      img.src = piece.image;
      img.alt = piece.alt || piece.title;
      img.loading = "lazy";
      // Drop pieces whose image is missing rather than showing a broken icon
      img.addEventListener("error", () => fig.remove());
      button.appendChild(img);
      button.addEventListener("click", () => openLightbox(items, items.indexOf(piece)));
      fig.appendChild(button);

      const cap = document.createElement("figcaption");
      cap.textContent = captionFor(piece);
      fig.appendChild(cap);

      // Photos sit in pairs; each pair is one row that the next row slides over
      if (index % 2 === 0) {
        // Each row sits in its own slot, followed by a pause, so it stays pinned a little longer
        const slot = document.createElement("div");
        slot.className = "gallery-slot";
        row = document.createElement("div");
        row.className = "gallery-row";
        slot.appendChild(row);
        const pause = document.createElement("div");
        pause.className = "gallery-pause";
        slot.appendChild(pause);
        gallery.appendChild(slot);
      }
      row.appendChild(fig);
    }
  }

  function captionFor(piece) {
    return [piece.title, piece.location].filter(Boolean).join(", ");
  }

  // Lightbox: enlarged view with previous/next within the current series
  let lightbox = null;
  let current = { list: [], index: 0 };

  function ensureLightbox() {
    if (lightbox) return lightbox;
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.hidden = true;
    lightbox.innerHTML = `
      <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
      <button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous photograph">&#8249;</button>
      <figure>
        <img alt="">
        <figcaption></figcaption>
      </figure>
      <button type="button" class="lightbox-nav lightbox-next" aria-label="Next photograph">&#8250;</button>`;
    document.body.appendChild(lightbox);

    lightbox.addEventListener("click", (e) => {
      const t = e.target;
      if (t === lightbox || t.classList.contains("lightbox-close")) {
        closeLightbox();
      } else if (t.classList.contains("lightbox-prev")) {
        step(-1);
      } else if (t.classList.contains("lightbox-next")) {
        step(1);
      }
    });
    // Swipe left or right on phones to move between photos
    let touchStartX = null;
    lightbox.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox || lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
    return lightbox;
  }

  function openLightbox(list, index) {
    current = { list, index };
    const box = ensureLightbox();
    show();
    box.hidden = false;
    box.querySelector(".lightbox-close").focus();
  }

  function closeLightbox() {
    if (lightbox) lightbox.hidden = true;
  }

  function step(delta) {
    const n = current.list.length;
    if (n < 2) return;
    current.index = (current.index + delta + n) % n;
    show();
  }

  function show() {
    const box = lightbox;
    const piece = current.list[current.index];
    const img = box.querySelector("img");
    img.src = piece.image;
    img.alt = piece.alt || piece.title;
    box.querySelector("figcaption").textContent = captionFor(piece);
    const multiple = current.list.length > 1;
    box.querySelector(".lightbox-prev").hidden = !multiple;
    box.querySelector(".lightbox-next").hidden = !multiple;
  }
})();

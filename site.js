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

    for (const piece of items) {
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
      button.appendChild(img);
      button.addEventListener("click", () => openLightbox(piece));
      fig.appendChild(button);

      const cap = document.createElement("figcaption");
      cap.textContent = captionFor(piece);
      fig.appendChild(cap);

      gallery.appendChild(fig);
    }
  }

  function captionFor(piece) {
    return [piece.title, piece.location].filter(Boolean).join(", ");
  }

  // Lightbox
  let lightbox = null;

  function ensureLightbox() {
    if (lightbox) return lightbox;
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.hidden = true;
    lightbox.innerHTML = `
      <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
      <figure>
        <img alt="">
        <figcaption></figcaption>
      </figure>`;
    document.body.appendChild(lightbox);

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.classList.contains("lightbox-close")) {
        lightbox.hidden = true;
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox && !lightbox.hidden) lightbox.hidden = true;
    });
    return lightbox;
  }

  function openLightbox(piece) {
    const box = ensureLightbox();
    const img = box.querySelector("img");
    img.src = piece.image;
    img.alt = piece.alt || piece.title;
    box.querySelector("figcaption").textContent = captionFor(piece);
    box.hidden = false;
    box.querySelector(".lightbox-close").focus();
  }
})();

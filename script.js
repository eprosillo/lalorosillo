// Builds the gallery, series filters, and lightbox from data/pieces.json.
// To add or remove a piece, edit that file. Keep each id unique.
(async function () {
  const gallery = document.getElementById("gallery");
  const filters = document.getElementById("filters");
  const empty = document.getElementById("empty");

  let data;
  try {
    const res = await fetch("data/pieces.json", { cache: "no-cache" });
    data = await res.json();
  } catch (err) {
    gallery.textContent = "Work could not be loaded.";
    console.error(err);
    return;
  }

  const seriesById = Object.fromEntries(data.series.map((s) => [s.id, s]));
  const pieces = data.pieces;

  // Series filter buttons
  const makeButton = (label, value) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.dataset.series = value;
    btn.addEventListener("click", () => render(value));
    return btn;
  };
  filters.appendChild(makeButton("All", "all"));
  data.series.forEach((s) => filters.appendChild(makeButton(s.title, s.id)));

  function render(seriesId) {
    gallery.innerHTML = "";
    const visible = pieces.filter((p) => seriesId === "all" || p.series === seriesId);

    [...filters.children].forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.series === seriesId))
    );

    empty.hidden = visible.length > 0;

    for (const piece of visible) {
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
      cap.textContent = [piece.title, piece.year, piece.medium].filter(Boolean).join(", ");
      fig.appendChild(cap);

      gallery.appendChild(fig);
    }
  }

  // Lightbox
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
    <figure>
      <img alt="">
      <figcaption></figcaption>
    </figure>`;
  document.body.appendChild(lightbox);

  function openLightbox(piece) {
    lightbox.querySelector("img").src = piece.image;
    lightbox.querySelector("img").alt = piece.alt || piece.title;
    lightbox.querySelector("figcaption").textContent =
      [piece.title, piece.year, piece.medium].filter(Boolean).join(", ");
    lightbox.hidden = false;
    lightbox.querySelector(".lightbox-close").focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-close")) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });

  render("all");
})();

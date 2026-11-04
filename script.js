// Builds the gallery from data/pieces.json.
// To add or remove a piece, edit that file and keep the id unique.
(async function () {
  const gallery = document.getElementById("gallery");
  try {
    const res = await fetch("data/pieces.json", { cache: "no-cache" });
    const data = await res.json();

    for (const piece of data.pieces) {
      const fig = document.createElement("figure");
      fig.className = "piece";

      const img = document.createElement("img");
      img.src = piece.image;
      img.alt = piece.alt || piece.title;
      img.loading = "lazy";
      fig.appendChild(img);

      const cap = document.createElement("figcaption");
      const parts = [piece.title, piece.year, piece.medium].filter(Boolean);
      cap.textContent = parts.join(", ");
      fig.appendChild(cap);

      gallery.appendChild(fig);
    }
  } catch (err) {
    gallery.textContent = "Work could not be loaded.";
    console.error(err);
  }
})();

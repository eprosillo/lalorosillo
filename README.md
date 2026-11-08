# lalorosillo

Portfolio site for Lalo Rosillo (LaloRosillo.com).

## Structure

- `index.html`, `styles.css`, `script.js`: the site
- `data/pieces.json`: every piece in the portfolio (title, series, year, medium, image path)
- `images/`: web-sized exports of selected pieces (about 2,000 to 2,400 px on the long edge)

## Adding or removing a piece

1. Add the exported image to `images/`.
2. Add or remove an entry in `data/pieces.json`.
3. Preview locally by opening `index.html` in a browser (or any static server).

Originals (full-resolution masters) are not stored in this repo.

## Where the photos live (outside the repo)

- **Mac mini:** `~/Pictures/Portfolio/`
  - `Exports/`: new selects exported from Lightroom or Capture One, sorted by series (Street, Architecture, Sports)
  - `Ready-for-web/`: web-sized copies made from the exports (about 2,400 px). These are the files copied into `images/`.
  - `Street/`, `Architecture/`, `Sports/`: the earlier catalog exports
- **NAS:** full-resolution masters and the catalog
- **Naming:** `Series_Year_Place_NN.jpg`, for example `Street_2025_Oaxaca_12.jpg`. The place becomes the caption location.

To add photos: copy the web-sized files into `images/` with the same names, add an entry to `data/pieces.json` for each one, then commit and push.

# ShailajaPrinters - Sample Bootstrap Site

This is a small static website scaffold using HTML, Bootstrap, CSS and a lightweight reactive layer powered by Vue 3 (via CDN).

Files created:
- `index.html` - main page with navbar, hero, services, contact form and footer.
- `assets/css/style.css` - small custom styles.
- `assets/js/app.js` - a small Vue 3 app that provides reactive data for the hero, services and contact form handling.
- `assets/img/` - image folder containing placeholder images (`shailajaprinterslogo.png`, `placeholder-hero.png`).

How to run

Option 1 - Open locally
- Double-click `index.html` in File Explorer or open it from your editor. Works for basic development.

Option 2 - Run a simple HTTP server (recommended for testing features)
- Using Python 3 (make sure `python` is on your PATH):

```powershell
cd 'D:/ShailajaPrinters/Websites/PS-website'
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

Notes and next steps
- Replace `assets/img/placeholder-hero.png` with a real image for the hero (or overwrite the PNG with your SVG/JPG).
- Add more pages (e.g., About, Pricing) and link them from the navbar.
- Integrate a backend or form-handling service for real submissions.

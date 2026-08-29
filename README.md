# binodsuman.com

Personal site of Binod Suman. Static HTML/CSS/JS, served from this repo (GitHub Pages) at [binodsuman.com](https://binodsuman.com).

This is **not** the Astro academy site. That lives in a separate repo: [github.com/binodtech/website](https://github.com/binodtech/website).

## Run locally

There is no `npm install`. After cloning:

```bash
git clone https://github.com/binodsuman/binodsuman.git
cd binodsuman
python3 -m http.server 8000
```

Open **http://localhost:8000**

That serves `index.html`. Do not open `index.html` by double-clicking it; CSS and JS use root paths (`/css/`, `/js/`) and need a local server.

If port 8000 is busy:

```bash
python3 -m http.server 8080
```

Then open **http://localhost:8080**.

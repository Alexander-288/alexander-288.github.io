# alexander-288.github.io

My personal site: a list of all my live GitHub Pages sites and my other public projects.

Live at https://alexander-288.github.io/

## How it works

Plain HTML, CSS and JavaScript, no build step. On load, `app.js` asks the GitHub API for my public repos: any repo with Pages turned on shows up under "Live sites", the rest under "Other projects". If the API can't be reached, a built-in snapshot is shown instead.

To change a description, edit `BLURBS` in `app.js`. Organisation sites are listed by hand in `ORGS`.

## Run locally

```
python -m http.server 8000
```

Then open http://localhost:8000

## License

MIT

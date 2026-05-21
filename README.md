# Text Quest Arcade

A website for collecting and playing interactive English text games.

## Run

Open `index.html` in a browser, or start a small local server:

```powershell
node server.js
```

Then open:

```text
http://127.0.0.1:5173
```

## Permanent Games

Permanent games live in the repository under `games/`.

Use one folder per game:

```text
games/
  my-game/
    index.html
    style.css
    script.js
    images/
      background.png
```

Then add the game to `games/manifest.json`:

```json
{
  "id": "my-game",
  "title": "My Game",
  "description": "A short English text adventure.",
  "level": "Beginner",
  "url": "games/my-game/index.html"
}
```

After the change is pushed to GitHub, the game appears on the site and does not disappear.

## Local Preview

Use the **Upload** section to test a standalone `.html` game on this computer. Local uploads are saved in this browser with `localStorage`; they are not published to GitHub.

## Game Template

The site includes a starter HTML template in the **Template** section. Copy it, edit the story and choices, save it as `.html`, and upload it back into the library.

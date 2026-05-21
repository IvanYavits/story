# Text Quest Arcade

A local website for collecting and playing interactive English text games.

## Run

Open `index.html` in a browser, or start a small local server:

```powershell
node server.js
```

Then open:

```text
http://127.0.0.1:5173
```

## Add Games

Use the **Upload** section to add a standalone `.html` game. The site saves uploaded games in this browser with `localStorage`.

That means the games stay on the same computer and browser. To share games between devices, the next version would need a server, database, and teacher/admin login.

## Game Template

The site includes a starter HTML template in the **Template** section. Copy it, edit the story and choices, save it as `.html`, and upload it back into the library.

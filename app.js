const STORAGE_KEY = "textQuestArcade.games.v1";
const MANIFEST_URL = "games/manifest.json";

const starterTemplate = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Lost Key</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #f5f2ea;
        color: #18202a;
        font-family: system-ui, sans-serif;
      }
      main {
        width: min(720px, calc(100% - 32px));
        padding: 24px;
        background: white;
        border: 1px solid #ddd7c7;
        border-radius: 8px;
      }
      button {
        margin: 6px 6px 0 0;
        padding: 10px 12px;
        border: 0;
        border-radius: 6px;
        background: #1f7a68;
        color: white;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>The Lost Key</h1>
      <p id="story">You find a silver key under your desk. What do you do?</p>
      <div id="choices">
        <button onclick="choose('door')">Open the old door</button>
        <button onclick="choose('teacher')">Ask the teacher</button>
      </div>
    </main>
    <script>
      const story = document.getElementById("story");
      const choices = document.getElementById("choices");

      function choose(path) {
        if (path === "door") {
          story.textContent = "The door opens to a quiet garden. A note says: Well done, reader.";
          choices.innerHTML = "<button onclick='location.reload()'>Play again</button>";
        }
        if (path === "teacher") {
          story.textContent = "The teacher smiles. This key opens today's secret story box.";
          choices.innerHTML = "<button onclick='location.reload()'>Play again</button>";
        }
      }
    </script>
  </body>
</html>`;

const demoGames = [
  {
    id: "demo-library",
    title: "The Midnight Library",
    description: "A short choice-based mystery for practicing verbs and careful reading.",
    level: "Elementary",
    source: "Demo",
    content: buildDemoGame({
      title: "The Midnight Library",
      opening: "At midnight, one book whispers your name. Which shelf do you visit first?",
      choices: [
        ["The map shelf", "A glowing map shows a hidden room behind the poetry section."],
        ["The animal shelf", "A fox in a picture asks you three polite questions in English."],
        ["The science shelf", "A tiny rocket lifts from the page and writes: Aim higher."]
      ]
    })
  },
  {
    id: "demo-station",
    title: "Moon Station Message",
    description: "Read clues, choose actions, and repair a broken message from space.",
    level: "Intermediate",
    source: "Demo",
    content: buildDemoGame({
      title: "Moon Station Message",
      opening: "The moon station receives a broken message: HELP THE GARDEN. What do you check?",
      choices: [
        ["The oxygen garden", "You find frozen pipes. After you warm them, green leaves rise again."],
        ["The radio room", "The signal repeats one word: WATER. Now you know what the garden needs."],
        ["The window", "Earth is bright and blue. You feel brave enough to solve the problem."]
      ]
    })
  }
];

const gamesGrid = document.querySelector("#games-grid");
const uploadForm = document.querySelector("#upload-form");
const uploadStatus = document.querySelector("#upload-status");
const fileInput = document.querySelector("#game-file");
const fileName = document.querySelector("#file-name");
const clearGames = document.querySelector("#clear-games");
const templateCode = document.querySelector("#template-code");
const copyTemplate = document.querySelector("#copy-template");

templateCode.textContent = starterTemplate;

let uploadedGames = loadUploadedGames();
let publishedGames = [];

renderGames();
loadPublishedGames();

fileInput.addEventListener("change", () => {
  const selectedFile = fileInput.files?.[0];
  fileName.textContent = selectedFile ? selectedFile.name : "Standalone .html games work best.";
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const selectedFile = fileInput.files?.[0];
  if (!selectedFile) {
    uploadStatus.textContent = "Please choose an HTML file.";
    return;
  }

  if (!selectedFile.name.toLowerCase().endsWith(".html")) {
    uploadStatus.textContent = "Only .html files can be added.";
    return;
  }

  const content = await selectedFile.text();
  const formData = new FormData(uploadForm);
  const newGame = {
    id: createId(),
    title: String(formData.get("title")).trim(),
    description: String(formData.get("description")).trim(),
    level: String(formData.get("level")),
    source: selectedFile.name,
    content
  };

  uploadedGames = [newGame, ...uploadedGames];
  saveUploadedGames();
  uploadForm.reset();
  fileName.textContent = "Standalone .html games work best.";
  uploadStatus.textContent = `"${newGame.title}" was added to the library.`;
  renderGames();
  location.hash = "library";
});

clearGames.addEventListener("click", () => {
  if (!uploadedGames.length) {
    uploadStatus.textContent = "There are no uploaded games to remove.";
    return;
  }

  const shouldClear = confirm("Remove all uploaded games from this browser?");
  if (!shouldClear) return;

  uploadedGames = [];
  saveUploadedGames();
  renderGames();
  uploadStatus.textContent = "Uploaded games were removed.";
});

copyTemplate.addEventListener("click", async () => {
  await copyText(starterTemplate);
  copyTemplate.textContent = "Copied";
  setTimeout(() => {
    copyTemplate.textContent = "Copy";
  }, 1400);
});

async function loadPublishedGames() {
  try {
    const response = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!response.ok) return;

    const manifest = await response.json();
    publishedGames = Array.isArray(manifest.games)
      ? manifest.games.map((game) => ({
          id: `published-${game.id}`,
          title: game.title,
          description: game.description,
          level: game.level,
          source: "GitHub",
          url: game.url
        }))
      : [];
    renderGames();
  } catch {
    publishedGames = [];
  }
}

function renderGames() {
  const allGames = [...publishedGames, ...uploadedGames, ...demoGames];
  gamesGrid.innerHTML = "";

  allGames.forEach((game) => {
    const card = document.createElement("article");
    card.className = "game-card";
    card.innerHTML = `
      <div>
        <h3>${escapeHtml(game.title)}</h3>
        <p>${escapeHtml(game.description)}</p>
        <div class="meta-row">
          <span class="tag">${escapeHtml(game.level)}</span>
          <span class="tag ${getSourceClass(game.source)}">${escapeHtml(game.source)}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="button primary" type="button" data-play="${game.id}">Play</button>
        ${
          game.source === "Demo" || game.source === "GitHub"
            ? ""
            : `<button class="button secondary danger" type="button" data-delete="${game.id}">Delete</button>`
        }
      </div>
    `;
    gamesGrid.append(card);
  });

  gamesGrid.querySelectorAll("[data-play]").forEach((button) => {
    button.addEventListener("click", () => playGame(button.dataset.play));
  });

  gamesGrid.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteGame(button.dataset.delete));
  });
}

function playGame(id) {
  const game = [...publishedGames, ...uploadedGames, ...demoGames].find((item) => item.id === id);
  if (!game) return;

  if (game.url) {
    const gameWindow = window.open(game.url, "_blank", "noopener");
    if (!gameWindow) {
      uploadStatus.textContent = "Please allow pop-ups to open the game in a new tab.";
    }
    return;
  }

  const gameFile = new Blob([game.content], { type: "text/html" });
  const gameUrl = URL.createObjectURL(gameFile);
  const gameWindow = window.open(gameUrl, "_blank", "noopener");

  if (!gameWindow) {
    uploadStatus.textContent = "Please allow pop-ups to open the game in a new tab.";
    URL.revokeObjectURL(gameUrl);
    return;
  }

  setTimeout(() => URL.revokeObjectURL(gameUrl), 60_000);
}

function deleteGame(id) {
  uploadedGames = uploadedGames.filter((game) => game.id !== id);
  saveUploadedGames();
  renderGames();
}

function loadUploadedGames() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUploadedGames() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedGames));
}

function getSourceClass(source) {
  if (source === "Demo") return "demo";
  if (source === "GitHub") return "published";
  return "";
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `game-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.append(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}

function buildDemoGame({ title, opening, choices }) {
  const choiceButtons = choices
    .map(
      ([label, result], index) =>
        `<button type="button" onclick="choose(${index})">${escapeHtml(label)}</button>`
    )
    .join("");
  const encodedChoices = JSON.stringify(choices.map(([, result]) => result));

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #f8f4e8, #e6f2ee);
        color: #17202a;
        font-family: Georgia, "Times New Roman", serif;
      }
      main {
        width: min(760px, calc(100% - 32px));
        padding: 30px;
        border: 1px solid #d8ded8;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 18px 50px rgba(23, 32, 42, 0.12);
      }
      h1 { margin-top: 0; font-size: 2.2rem; }
      p { font-size: 1.18rem; line-height: 1.7; }
      button {
        margin: 8px 8px 0 0;
        padding: 11px 13px;
        border: 0;
        border-radius: 6px;
        background: #1f7a68;
        color: white;
        cursor: pointer;
        font: 700 1rem system-ui, sans-serif;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p id="story">${escapeHtml(opening)}</p>
      <div id="choices">${choiceButtons}</div>
    </main>
    <script>
      const endings = ${encodedChoices};
      function choose(index) {
        document.getElementById("story").textContent = endings[index];
        document.getElementById("choices").innerHTML = "<button onclick='location.reload()'>Play again</button>";
      }
    </script>
  </body>
</html>`;
}

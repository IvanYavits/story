function choose(word) {
  const story = document.querySelector("#story");
  const choices = document.querySelector("#choices");

  if (word === "open") {
    story.textContent = "The golden door opens. You found the right verb.";
  } else {
    story.textContent = "The castle waits. Try a word that means unlock and enter.";
  }

  choices.innerHTML = "<button type='button' onclick='location.reload()'>Play again</button>";
}

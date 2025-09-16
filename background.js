let words = [];

fetch(chrome.runtime.getURL("words.json"))
  .then(res => res.json())
  .then(data => words = data);

chrome.action.onClicked.addListener(() => {
  showRandomWord();
});

function showRandomWord() {
  if (words.length === 0) return;
  const word = words[Math.floor(Math.random() * words.length)];

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: word.term,
    message: word.definition,
    requireInteraction: true
  });
}
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "showWord") showRandomWord();
});
setInterval(showRandomWord, 60000);


// background.js (service worker)

// Crear alarma al instalar
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("showWordAlarm", { periodInMinutes: 1 });
});

// Escuchar alarma
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "showWordAlarm") {
    loadWordsAndShow();
  }
});

// Escuchar clic en el icono de la extensión
chrome.action.onClicked.addListener(() => {
  loadWordsAndShow();
});

// Cargar JSON y mostrar palabra
function loadWordsAndShow() {
  fetch(chrome.runtime.getURL("words.json"))
    .then(res => res.json())
    .then(data => {
      showRandomWord(data);
    })
    .catch(err => console.error("Error cargando words.json:", err));
}

// Mostrar palabra aleatoria
function showRandomWord(words) {
  if (!words || words.length === 0) return;

  const word = words[Math.floor(Math.random() * words.length)];

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: word.term,
    message: word.definition,
    requireInteraction: true
  });
}


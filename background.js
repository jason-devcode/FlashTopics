function mostrarNotificacion() {
  chrome.storage.local.get(["temas", "temaSeleccionado"], (res) => {
    const temas = res.temas || {};
    const temaSeleccionado = res.temaSeleccionado;

    if (!temaSeleccionado || !temas[temaSeleccionado] || temas[temaSeleccionado].length === 0) {
      console.log("No hay tema seleccionado o no tiene conceptos.");
      return;
    }

    // Seleccionar concepto aleatorio del tema seleccionado
    const conceptos = temas[temaSeleccionado];
    const randomIndex = Math.floor(Math.random() * conceptos.length);
    const { term, definition } = conceptos[randomIndex];

    // Crear notificación
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: term,
      message: definition,
      priority: 2
    });
  });
}

// Configurar alarma para mostrar notificaciones cada cierto tiempo
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("flashTopic", { delayInMinutes: 1, periodInMinutes: 5 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "flashTopic") {
    mostrarNotificacion();
  }
});


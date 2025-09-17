document.addEventListener("DOMContentLoaded", async () => {
  const temasContainer = document.getElementById("temas");
  const guardarBtn = document.getElementById("guardar");
  let temas = {};
  let temaSeleccionado = null;

  // Cargar temas desde storage
  chrome.storage.local.get(["temas", "temaSeleccionado"], (data) => {
    temas = data.temas || {};
    temaSeleccionado = data.temaSeleccionado || null;

    renderTemas();
  });

  function renderTemas() {
    temasContainer.innerHTML = "";

    Object.keys(temas).forEach((nombre) => {
      const btn = document.createElement("button");
      btn.textContent = nombre;
      btn.className = "topic-btn";

      if (nombre === temaSeleccionado) {
        btn.classList.add("selected");
      }

      btn.addEventListener("click", () => {
        document.querySelectorAll(".topic-btn").forEach((b) =>
          b.classList.remove("selected")
        );
        btn.classList.add("selected");
        temaSeleccionado = nombre;
      });

      temasContainer.appendChild(btn);
    });
  }

  // Guardar selección
  guardarBtn.addEventListener("click", () => {
    if (!temaSeleccionado) {
      alert("Por favor selecciona un tema.");
      return;
    }

    chrome.storage.local.set({ temaSeleccionado }, () => {
      alert(`Tema "${temaSeleccionado}" guardado con éxito ✅`);
    });
  });
});


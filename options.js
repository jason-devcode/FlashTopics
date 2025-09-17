// options.js
(function () {
  // Helpers
  const $ = id => document.getElementById(id);

  // Default initial data (if you want to include more initial concepts, add here)
  const DEFAULT_TEMAS = {
    "General": [
      { term: "proposición", definition: "Afirmación o enunciado que puede ser evaluado como verdadero o falso." }
    ]
  };

  // Ensure DOM ready
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    console.log("[options] init()");
    // Elements
    const newThemeInput = $("newTheme");
    const addThemeBtn = $("addThemeBtn");
    const themeSelect = $("themeSelect");
    const termInput = $("termInput");
    const definitionInput = $("definitionInput");
    const addConceptBtn = $("addConceptBtn");
    const themesContainer = $("themesContainer");
    const exportBtn = $("exportBtn");
    const importFile = $("importFile");

    if (!newThemeInput || !addThemeBtn || !themeSelect || !termInput || !definitionInput || !addConceptBtn || !themesContainer || !exportBtn || !importFile) {
      console.error("[options] Elementos del DOM no encontrados. Revisa los IDs en options.html");
      return;
    }

    // Attach listeners
    addThemeBtn.addEventListener("click", onAddTheme);
    addConceptBtn.addEventListener("click", onAddConcept);
    exportBtn.addEventListener("click", onExport);
    importFile.addEventListener("change", onImport);

    // Initialize storage if needed, then render
    ensureTemasInitialized().then(renderTemas).catch(err => {
      console.error("[options] Error inicializando temas:", err);
      renderTemas();
    });

    // --- Functions ---
    function ensureTemasInitialized() {
      return new Promise((resolve) => {
        chrome.storage.local.get(["temas"], (res) => {
          if (!res || !res.temas) {
            console.log("[options] No hay 'temas' en storage. Inicializando con valores por defecto.");
            chrome.storage.local.set({ temas: DEFAULT_TEMAS, temaSeleccionado: "General" }, () => resolve());
          } else {
            resolve();
          }
        });
      });
    }

    function renderTemas() {
      chrome.storage.local.get(["temas"], (res) => {
        const temas = res.temas || {};
        themesContainer.innerHTML = "";
        themeSelect.innerHTML = "";

        const keys = Object.keys(temas);
        if (keys.length === 0) {
          themesContainer.textContent = "No hay temas. Crea uno arriba.";
          addConceptBtn.disabled = true;
          return;
        }

        addConceptBtn.disabled = false;

        // Fill select
        keys.forEach(k => {
          const opt = document.createElement("option");
          opt.value = k;
          opt.textContent = k;
          themeSelect.appendChild(opt);
        });

        // Render list
        keys.forEach((tema) => {
          const block = document.createElement("div");
          block.className = "theme-block";

          const title = document.createElement("div");
          title.className = "theme-title";
          title.textContent = tema;

          // Delete theme button (optional)
          const delThemeBtn = document.createElement("button");
          delThemeBtn.textContent = "Eliminar tema";
          delThemeBtn.className = "btn btn-danger";
          delThemeBtn.style.float = "right";
          delThemeBtn.style.marginLeft = "8px";
          delThemeBtn.addEventListener("click", () => {
            if (!confirm(`Eliminar el tema "${tema}" y todos sus conceptos?`)) return;
            chrome.storage.local.get(["temas"], (r) => {
              const t = r.temas || {};
              delete t[tema];
              chrome.storage.local.set({ temas: t }, renderTemas);
            });
          });

          const header = document.createElement("div");
          header.style.display = "flex";
          header.style.alignItems = "center";
          header.appendChild(title);
          header.appendChild(delThemeBtn);
          block.appendChild(header);

          const list = temas[tema] || [];
          if (list.length === 0) {
            const empty = document.createElement("div");
            empty.className = "muted";
            empty.textContent = "No hay conceptos en este tema.";
            block.appendChild(empty);
          } else {
            list.forEach((c, i) => {
              const conceptDiv = document.createElement("div");
              conceptDiv.className = "concept";

              const txt = document.createElement("div");
              txt.className = "text";
              txt.textContent = `${c.term}: ${c.definition}`;

              const actions = document.createElement("div");
              actions.style.display = "flex";
              actions.style.gap = "8px";

              const delBtn = document.createElement("button");
              delBtn.className = "btn-danger";
              delBtn.textContent = "Eliminar";
              // store metadata
              delBtn.dataset.tema = tema;
              delBtn.dataset.index = String(i);
              delBtn.addEventListener("click", onDeleteConcept);

              actions.appendChild(delBtn);
              conceptDiv.appendChild(txt);
              conceptDiv.appendChild(actions);
              block.appendChild(conceptDiv);
            });
          }

          themesContainer.appendChild(block);
        });

        console.log("[options] renderTemas() completo. Temas:", keys);
      });
    }

    function onAddTheme() {
      const tema = newThemeInput.value.trim();
      if (!tema) {
        alert("Escribe el nombre del tema.");
        return;
      }

      chrome.storage.local.get(["temas"], (res) => {
        const temas = res.temas || {};
        if (temas[tema]) {
          alert("Ese tema ya existe.");
          return;
        }
        temas[tema] = [];
        chrome.storage.local.set({ temas }, () => {
          newThemeInput.value = "";
          renderTemas();
        });
      });
    }

    function onAddConcept() {
      const term = termInput.value.trim();
      const definition = definitionInput.value.trim();
      const tema = themeSelect.value;

      if (!tema) {
        alert("Selecciona un tema.");
        return;
      }
      if (!term || !definition) {
        alert("Completa término y definición.");
        return;
      }

      chrome.storage.local.get(["temas"], (res) => {
        const temas = res.temas || {};
        if (!Array.isArray(temas[tema])) temas[tema] = [];
        temas[tema].push({ term, definition });
        chrome.storage.local.set({ temas }, () => {
          termInput.value = "";
          definitionInput.value = "";
          renderTemas();
        });
      });
    }

    function onDeleteConcept(e) {
      const tema = e.currentTarget.dataset.tema;
      const index = Number(e.currentTarget.dataset.index);
      chrome.storage.local.get(["temas"], (res) => {
        const temas = res.temas || {};
        if (!temas[tema]) return;
        // safety check
        if (index < 0 || index >= temas[tema].length) {
          console.warn("[options] índice inválido al borrar:", index);
          renderTemas();
          return;
        }
        temas[tema].splice(index, 1);
        chrome.storage.local.set({ temas }, renderTemas);
      });
    }

    function onExport() {
      chrome.storage.local.get(["temas"], (res) => {
        const temas = res.temas || {};
        const blob = new Blob([JSON.stringify(temas, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        // Prefer chrome.downloads if available
        if (chrome.downloads && chrome.downloads.download) {
          chrome.downloads.download({ url, filename: "flash_topics_backup.json" }, (id) => {
            console.log("[options] descarga iniciada id=", id);
            // release object URL after a while
            setTimeout(() => URL.revokeObjectURL(url), 5000);
          });
        } else {
          // fallback: create anchor and click
          const a = document.createElement("a");
          a.href = url;
          a.download = "flash_topics_backup.json";
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }
      });
    }

    function onImport(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          // basic validation: object whose values are arrays
          if (typeof data !== "object" || Array.isArray(data) || data === null) {
            throw new Error("Formato inválido: debe ser un objeto con temas como claves.");
          }
          for (const k of Object.keys(data)) {
            if (!Array.isArray(data[k])) {
              throw new Error(`El tema "${k}" no contiene una lista de conceptos.`);
            }
          }
          chrome.storage.local.set({ temas: data }, () => {
            alert("✅ Importación exitosa");
            renderTemas();
          });
        } catch (err) {
          console.error("[options] Error importando JSON:", err);
          alert("❌ Error al importar JSON: " + err.message);
        } finally {
          // clear file input
          importFile.value = "";
        }
      };
      reader.readAsText(file);
    }
  }
})();


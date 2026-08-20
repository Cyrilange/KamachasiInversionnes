// ── ACCORDÉON ──────────────────────────────────────────────
document.querySelectorAll(".accordion-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const isOpen = this.getAttribute("aria-expanded") === "true";
    const body = this.nextElementSibling;

    // Fermer tous les autres
    document.querySelectorAll(".accordion-btn").forEach((b) => {
      b.setAttribute("aria-expanded", "false");
      b.nextElementSibling.classList.remove("open");
    });

    // Ouvrir celui-ci si était fermé
    if (!isOpen) {
      this.setAttribute("aria-expanded", "true");
      body.classList.add("open");
    }
  });
});

// ── FORMULAIRE ─────────────────────────────────────────────
document
  .getElementById("credit-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const btn = document.getElementById("submit-btn");
    const alertBox = document.getElementById("alert-box");
    btn.disabled = true;
    btn.textContent = "Enviando...";
    alertBox.innerHTML = "";

    const formData = new FormData(e.target);

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alertBox.innerHTML =
          '<div class="alert success">✅ ¡Solicitud enviada con éxito! Te contactaremos pronto.</div>';
        document.getElementById("credit-form").reset();
        btn.textContent = "¡Enviado!";
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = "Enviar solicitud";
        }, 4000);
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.error(err);
      alertBox.innerHTML =
        '<div class="alert error">❌ Hubo un error al enviar. Por favor intenta nuevamente.</div>';
      btn.disabled = false;
      btn.textContent = "Enviar solicitud";
    }
  });


  //block for perso 

  const montoSelect = document.getElementById("monto");
const montoPersonalizado = document.getElementById("monto-personalizado");

montoSelect.addEventListener("change", function () {
  if (this.value === "custom") {
    montoPersonalizado.style.display = "block";
    montoPersonalizado.required = true;
  } else {
    montoPersonalizado.style.display = "none";
    montoPersonalizado.required = false;
    montoPersonalizado.value = "";
  }
});
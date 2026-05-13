Copier;

document
  .getElementById("credit-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const btn = document.getElementById("submit-btn");
    const alertBox = document.getElementById("alert-box");
    btn.disabled = true;
    btn.textContent = "Enviando...";
    alertBox.innerHTML = "";

    const params = {
      nombre: document.getElementById("nombre").value,
      telefono: document.getElementById("telefono").value,
      email: document.getElementById("email").value,
      dni: document.getElementById("dni").value,
      monto: document.getElementById("monto").value,
      ingresos: document.getElementById("ingresos").value,
      mensaje: document.getElementById("mensaje").value,
    };

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
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

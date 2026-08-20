// ── ACCORDION ──────────────────────────────────────────────
document.querySelectorAll(".accordion-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const isOpen = this.getAttribute("aria-expanded") === "true";
    const body = this.nextElementSibling;

    // Close all other accordion sections
    document.querySelectorAll(".accordion-btn").forEach((b) => {
      b.setAttribute("aria-expanded", "false");
      b.nextElementSibling.classList.remove("open");
    });

    // Open this section if it was closed
    if (!isOpen) {
      this.setAttribute("aria-expanded", "true");
      body.classList.add("open");
    }
  });
});


// ── CUSTOM AMOUNT ──────────────────────────────────────────

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


// ── IMAGE COMPRESSION ──────────────────────────────────────

// Compress an image before sending it to the server.
// PDFs and other non-image files are kept unchanged.
function compressImage(file) {
  if (!file.type.startsWith("image/")) {
    return Promise.resolve(file);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      const img = new Image();

      img.onload = function () {
        // Maximum image dimension
        const MAX_SIZE = 1800;

        let width = img.width;
        let height = img.height;

        // Resize large photos while keeping their proportions
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);

        // Convert the photo to JPEG with 78% quality
        canvas.toBlob(
          function (blob) {
            if (!blob) {
              resolve(file);
              return;
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + ".jpg",
              {
                type: "image/jpeg",
              }
            );

            resolve(compressedFile);
          },
          "image/jpeg",
          0.78
        );
      };

      img.onerror = function () {
        resolve(file);
      };

      img.src = event.target.result;
    };

    reader.onerror = function () {
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}


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

    // Handle custom amount
    if (montoSelect.value === "custom") {
      formData.set("monto", montoPersonalizado.value);
    }


    // ── COMPRESS THE 3 UPLOADED DOCUMENTS ──────────────────

    const fileFields = [
      "dni-frente",
      "dni-dorso",
      "nomina",
    ];

    for (const fieldName of fileFields) {
      const input = document.querySelector(
        `input[name="${fieldName}"]`
      );

      if (input && input.files && input.files[0]) {
        const originalFile = input.files[0];

        // Compress the image before sending it
        const compressedFile = await compressImage(originalFile);

        // Replace the original file with the compressed version
        formData.delete(fieldName);
        formData.append(fieldName, compressedFile);
      }
    }


    // ── SEND FORM ──────────────────────────────────────────

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alertBox.innerHTML =
          '<div class="alert success">✅ ¡Solicitud enviada con éxito! Te contactaremos pronto.</div>';

        document.getElementById("credit-form").reset();

        montoPersonalizado.style.display = "none";
        montoPersonalizado.required = false;

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
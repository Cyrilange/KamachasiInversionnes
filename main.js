// ============================================================
// ACCORDION
// ============================================================

document.querySelectorAll(".accordion-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const isOpen = this.getAttribute("aria-expanded") === "true";
    const body = this.nextElementSibling;

    // Close all other accordion sections
    document.querySelectorAll(".accordion-btn").forEach((b) => {
      b.setAttribute("aria-expanded", "false");
      b.nextElementSibling.classList.remove("open");
    });

    // Open this section if it was previously closed
    if (!isOpen) {
      this.setAttribute("aria-expanded", "true");
      body.classList.add("open");
    }
  });
});


// ============================================================
// CREDIT AMOUNT
// ============================================================

const montoSelect = document.getElementById("monto");
const montoPersonalizado = document.getElementById("monto-personalizado");

// Show the custom amount field only when "Otro monto" is selected
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


// ============================================================
// IMAGE COMPRESSION
// ============================================================

/*
  Mobile phone cameras can produce very large images.

  Example:
  - Original phone photo: 5 MB
  - Compressed photo: around 500 KB - 1.5 MB

  The browser compresses the image BEFORE sending it to the server.

  We:
  1. Resize very large images.
  2. Convert them to JPEG.
  3. Reduce JPEG quality.
  4. Keep PDF files untouched.

  This makes the upload much faster and reduces the chance
  of the request failing on a mobile connection.
*/

async function compressImage(file) {
  // Only compress images
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      const img = new Image();

      img.onload = function () {
        // Maximum width/height for uploaded images
        const MAX_SIZE = 1800;

        let width = img.width;
        let height = img.height;

        // Resize large images while keeping the original proportions
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        // Create a canvas for the resized image
        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        // Draw the resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert the image to JPEG with reduced quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // If compression fails, keep the original file
              resolve(file);
              return;
            }

            // Create a new file from the compressed image
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + ".jpg",
              {
                type: "image/jpeg",
                lastModified: Date.now(),
              }
            );

            resolve(compressedFile);
          },
          "image/jpeg",
          0.78
        );
      };

      img.onerror = function () {
        // If the image cannot be processed, keep the original file
        resolve(file);
      };

      img.src = event.target.result;
    };

    reader.onerror = function () {
      // If reading the file fails, keep the original file
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}


// ============================================================
// FORM SUBMISSION
// ============================================================

document
  .getElementById("credit-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const btn = document.getElementById("submit-btn");
    const alertBox = document.getElementById("alert-box");

    // Disable the button while the request is being processed
    btn.disabled = true;
    btn.textContent = "Enviando...";
    alertBox.innerHTML = "";

    try {
      // Get all form fields
      const formData = new FormData(e.target);

      // --------------------------------------------------------
      // HANDLE CUSTOM AMOUNT
      // --------------------------------------------------------

      if (montoSelect.value === "custom") {
        const customAmount = montoPersonalizado.value;

        // Make sure the custom amount is valid
        if (!customAmount || Number(customAmount) < 100000) {
          throw new Error("Monto inválido");
        }

        // Replace "custom" with the actual amount
        formData.set("monto", customAmount);
      }


      // --------------------------------------------------------
      // COMPRESS UPLOADED IMAGES
      // --------------------------------------------------------

      const fileFields = [
        "dni-frente",
        "dni-dorso",
        "nomina",
      ];

      for (const fieldName of fileFields) {
        const input = document.querySelector(
          `input[name="${fieldName}"]`
        );

        if (!input || !input.files || !input.files[0]) {
          continue;
        }

        const originalFile = input.files[0];

        // Compress image files.
        // PDFs are automatically left untouched.
        const compressedFile = await compressImage(originalFile);

        // Replace the original file in FormData
        formData.delete(fieldName);
        formData.append(fieldName, compressedFile);
      }


      // --------------------------------------------------------
      // SEND DATA TO THE SERVER
      // --------------------------------------------------------

      const res = await fetch("/api/send", {
        method: "POST",
        body: formData,
      });

      // Try to read the server response
      let data = {};

      try {
        data = await res.json();
      } catch {
        // Server did not return JSON
      }

      if (!res.ok) {
        console.error("Server error:", data);

        throw new Error(
          data.error || "Server error"
        );
      }


      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      alertBox.innerHTML =
        '<div class="alert success">✅ ¡Solicitud enviada con éxito! Te contactaremos pronto.</div>';

      // Reset the form
      document.getElementById("credit-form").reset();

      // Hide the custom amount field again
      montoPersonalizado.style.display = "none";
      montoPersonalizado.required = false;

      btn.textContent = "¡Enviado!";

      // Re-enable the button after a few seconds
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "Enviar solicitud";
      }, 4000);

    } catch (err) {
      console.error("Upload error:", err);

      // Show a user-friendly error message
      alertBox.innerHTML =
        '<div class="alert error">❌ Hubo un error al enviar. Por favor intenta nuevamente.</div>';

      btn.disabled = false;
      btn.textContent = "Enviar solicitud";
    }
  });
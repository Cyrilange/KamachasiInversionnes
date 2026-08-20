import nodemailer from "nodemailer";
import formidable from "formidable";
import fs from "fs";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Parser le FormData
  const form = formidable({ maxFileSize: 15 * 1024 * 1024 });
  const [fields, files] = await form.parse(req);

  const get = (key) =>
    Array.isArray(fields[key]) ? fields[key][0] : fields[key];

  const nombre = get("nombre");
  const telefono = get("telefono");
  const email = get("email");
  const dni = get("dni");
  const monto = get("monto");
  const ingresos = get("ingresos");
  const mensaje = get("mensaje") || "";

  if (!nombre || !telefono || !email || !dni || !monto || !ingresos) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const attachments = [];

  const addFile = (field, label) => {
    const f = files[field]?.[0];
    if (f && f.size > 0) {
      const ext = f.originalFilename?.split(".").pop() || "jpg";
      attachments.push({
        filename: `${label}.${ext}`,
        content: fs.readFileSync(f.filepath),
      });
    }
  };

  addFile("dni-frente", "DNI_frente");
  addFile("dni-dorso", "DNI_dorso");
  addFile("nomina", "Nomina");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Kamachasi S.A." <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: email,
    subject: `Nueva solicitud de microcrédito — ${nombre}`,
    attachments,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background: #6B0F0F; padding: 24px; text-align: center;">
          <h1 style="color: #C9A84C; margin: 0; font-size: 1.4rem;">Inversiones Kamachasi S.A.</h1>
          <p style="color: #F0E8D0; margin: 8px 0 0; font-size: 0.9rem;">Nueva solicitud de microcrédito</p>
        </div>
        <div style="padding: 24px; background: #fff;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #666; width: 40%;">Nombre completo</td>
              <td style="padding: 10px 0; font-weight: bold;">${nombre}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #666;">Teléfono</td>
              <td style="padding: 10px 0;">${telefono}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #666;">Correo electrónico</td>
              <td style="padding: 10px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #666;">Documento de identidad</td>
              <td style="padding: 10px 0;">${dni}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #666;">Monto solicitado</td>
              <td style="padding: 10px 0; color: #C9A84C; font-weight: bold;">$ ${Number(monto).toLocaleString("es-AR")}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; color: #666;">Tipo de ingresos</td>
              <td style="padding: 10px 0;">${ingresos}</td>
            </tr>
            ${
              mensaje
                ? `
            <tr>
              <td style="padding: 10px 0; color: #666; vertical-align: top;">Mensaje</td>
              <td style="padding: 10px 0;">${mensaje}</td>
            </tr>`
                : ""
            }
          </table>
          <p style="margin-top: 16px; font-size: 0.85rem; color: #999;">
            📎 Adjuntos: DNI frente, DNI dorso, nómina
          </p>
        </div>
        <div style="background: #f9f9f9; padding: 16px; text-align: center; font-size: 0.8rem; color: #999;">
          Solicitud recibida desde el sitio web de Inversiones Kamachasi S.A.
        </div>
      </div>
    `,
  });

  res.status(200).json({ success: true });
}

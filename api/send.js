import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { nombre, telefono, email, dni, monto, ingresos, mensaje } = req.body;

  if (!nombre || !telefono || !email || !dni || !monto || !ingresos) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

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
              <td style="padding: 10px 0; color: #C9A84C; font-weight: bold;">${monto}</td>
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
        </div>
        <div style="background: #f9f9f9; padding: 16px; text-align: center; font-size: 0.8rem; color: #999;">
          Solicitud recibida desde el sitio web de Inversiones Kamachasi S.A.
        </div>
      </div>
    `,
  });

  res.status(200).json({ success: true });
}

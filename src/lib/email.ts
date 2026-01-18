import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import React from "react";
import "dotenv/config";

// Configuration du transporteur Nodemailer avec Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendEmail(
  to: string | string[],
  subject: string,
  reactComponent: React.ReactElement
) {
  try {
    // Convertir le composant React en HTML
    const html = await render(reactComponent);

    // Préparer le message
    const message = {
      from: `TradeSphere <${process.env.GMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      headers: {
        "X-Entity-Ref-ID": "tradesphere-email",
      },
    };

    // Envoyer l'email
    const info = await transporter.sendMail(message);
    
    console.log("Email envoyé avec succès:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
}

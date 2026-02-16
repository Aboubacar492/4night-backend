const nodemailer = require('nodemailer');

// Configuration Email (Gmail gratuit)
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'votre-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'votre-mot-de-passe-app'
  }
};

// Créer le transporteur
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Email de confirmation pour le CLIENT
async function sendClientEmail(clientEmail, clientName, orderNumber, orderDetails, total, currency) {
  try {
    const productsHTML = orderDetails.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.brand}</strong> - ${item.name}<br>
          <small>${item.selectedSize} × ${item.quantity}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${item.total.toLocaleString()} ${currency.toUpperCase()}
        </td>
      </tr>
    `).join('');

    const mailOptions = {
      from: '"4NIGHT FRAGRANCE" <aboubacar2a0b0o3@gmail.com>',
      to: clientEmail,
      subject: `✅ Commande #${orderNumber} confirmée - 4NIGHT FRAGRANCE`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
            .total { background: #f59e0b; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🌙 4NIGHT FRAGRANCE</h1>
              <p style="margin: 10px 0 0 0;">Votre commande est confirmée !</p>
            </div>
            
            <div class="content">
              <h2 style="color: #f59e0b;">Bonjour ${clientName},</h2>
              
              <p>Merci pour votre commande ! Nous avons bien reçu votre demande et nous vous contacterons sous peu pour confirmer la livraison.</p>
              
              <h3>📦 Détails de la commande #${orderNumber}</h3>
              
              <table>
                ${productsHTML}
              </table>
              
              <div class="total">
                Total à payer : ${total.toLocaleString()} ${currency.toUpperCase()}
              </div>
              
              <p><strong>💰 Mode de paiement :</strong> Paiement en espèces à la livraison</p>
              <p><strong>🚚 Livraison :</strong> Gratuite à domicile</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              
              <h3>📞 Nous vous contacterons bientôt</h3>
              <p>Notre équipe va vous appeler dans les prochaines heures pour confirmer votre commande et organiser la livraison.</p>
              
              <p style="background: #fff3cd; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <strong>⚠️ Important :</strong> Vous ne payez qu'à la réception de vos parfums. Vérifiez bien les produits avant de payer !
              </p>
            </div>
            
            <div class="footer">
              <p><strong>4NIGHT FRAGRANCE</strong></p>
              <p>Ouagadougou, Burkina Faso</p>
              <p>📱 +226 664144548 / +212 630808680 | 📧 aboubacar2a0b0o3@gmail.com</p>
              <p style="margin-top: 15px;">
                <a href="https://4night-fragrance.vercel.app" style="color: #f59e0b;">Visiter notre site</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé au client ${clientEmail}`);
    return true;
  } catch (error) {
    console.error('Erreur envoi email client:', error.message);
    return false;
  }
}

// Email de notification pour le VENDEUR (VOUS)
async function sendVendorEmail(orderNumber, customer, orderDetails, total, currency) {
  try {
    const productsHTML = orderDetails.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          ${item.brand} - ${item.name} (${item.selectedSize})
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
          ${item.total.toLocaleString()} ${currency.toUpperCase()}
        </td>
      </tr>
    `).join('');

    const mailOptions = {
      from: '"4NIGHT System" <aboubacar2a0b0o3@gmail.com>',
      to: 'carellebinary@gmail.com', // VOTRE email
      subject: `🔔 NOUVELLE COMMANDE #${orderNumber} - ${customer.prenom} ${customer.nom}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #000; color: #fff;">
            <h1 style="color: #f59e0b;">🔔 NOUVELLE COMMANDE !</h1>
            
            <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h2 style="color: #f59e0b;">Commande #${orderNumber}</h2>
              
              <h3 style="color: #f59e0b; margin-top: 20px;">👤 Client</h3>
              <p><strong>Nom :</strong> ${customer.prenom} ${customer.nom}</p>
              <p><strong>Téléphone :</strong> <a href="tel:${customer.telephone}" style="color: #f59e0b;">${customer.telephone}</a></p>
              <p><strong>Email :</strong> ${customer.email || 'Non fourni'}</p>
              <p><strong>Adresse :</strong> ${customer.adresse}, ${customer.quartier}, ${customer.ville}</p>
              
              <h3 style="color: #f59e0b; margin-top: 20px;">📦 Produits</h3>
              <table style="width: 100%; border-collapse: collapse; color: #fff;">
                <thead>
                  <tr style="background: #f59e0b; color: #000;">
                    <th style="padding: 10px; text-align: left;">Produit</th>
                    <th style="padding: 10px; text-align: center;">Qté</th>
                    <th style="padding: 10px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsHTML}
                </tbody>
              </table>
              
              <div style="background: #f59e0b; color: #000; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; border-radius: 5px;">
                TOTAL : ${total.toLocaleString()} ${currency.toUpperCase()}
              </div>
              
              <p style="text-align: center; margin-top: 20px;">
                <a href="https://fournight-backend.onrender.com/admin.html" style="background: #f59e0b; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  🎯 VOIR DANS ADMIN
                </a>
              </p>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
              Cet email a été généré automatiquement par le système 4NIGHT FRAGRANCE
            </p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email notification envoyé au vendeur`);
    return true;
  } catch (error) {
    console.error('Erreur envoi email vendeur:', error.message);
    return false;
  }
}

module.exports = {
  sendClientEmail,
  sendVendorEmail
};

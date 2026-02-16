const axios = require('axios');

// Configuration Orange SMS API
const ORANGE_SMS_CONFIG = {
  clientId: process.env.ORANGE_CLIENT_ID || 'VOTRE_CLIENT_ID',
  clientSecret: process.env.ORANGE_CLIENT_SECRET || 'VOTRE_CLIENT_SECRET',
  senderName: '4NIGHT',
  apiUrl: 'https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B226XXXXXXXX/requests'
};

// Fonction pour obtenir le token d'accès
async function getOrangeToken() {
  try {
    const response = await axios.post(
      'https://api.orange.com/oauth/v3/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${ORANGE_SMS_CONFIG.clientId}:${ORANGE_SMS_CONFIG.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Erreur obtention token Orange:', error.message);
    return null;
  }
}

// Envoyer SMS au client
async function sendClientSMS(phoneNumber, orderNumber, total, currency) {
  try {
    const token = await getOrangeToken();
    if (!token) return false;

    const message = `✅ 4NIGHT FRAGRANCE
Commande #${orderNumber} confirmée !
Montant: ${total.toLocaleString()} ${currency.toUpperCase()}
Paiement à la livraison.
Nous vous appellerons sous peu.
Merci !`;

    const response = await axios.post(
      ORANGE_SMS_CONFIG.apiUrl,
      {
        outboundSMSMessageRequest: {
          address: `tel:${phoneNumber}`,
          senderAddress: `tel:+226XXXXXXXX`, // Votre numéro Orange
          outboundSMSTextMessage: {
            message: message
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ SMS envoyé au client ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('Erreur envoi SMS client:', error.message);
    return false;
  }
}

// Envoyer SMS au vendeur (VOUS)
async function sendVendorSMS(orderNumber, clientName, clientPhone, total, currency) {
  try {
    const token = await getOrangeToken();
    if (!token) return false;

    const message = `🔔 NOUVELLE COMMANDE !
#${orderNumber}
Client: ${clientName}
Tel: ${clientPhone}
Montant: ${total.toLocaleString()} ${currency.toUpperCase()}
Voir: admin.html`;

    const response = await axios.post(
      ORANGE_SMS_CONFIG.apiUrl,
      {
        outboundSMSMessageRequest: {
          address: 'tel:+226VOTRENUMERO', // VOTRE numéro
          senderAddress: 'tel:+226XXXXXXXX',
          outboundSMSTextMessage: {
            message: message
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ SMS notification envoyé au vendeur`);
    return true;
  } catch (error) {
    console.error('Erreur envoi SMS vendeur:', error.message);
    return false;
  }
}

module.exports = {
  sendClientSMS,
  sendVendorSMS
};

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// ✅ AJOUTER CES LIGNES
const { sendClientEmail, sendVendorEmail } = require('../services/emailService');

const ordersFile = path.join(__dirname, '../data/orders.json');

// Fonction pour lire les commandes
const readOrders = () => {
  try {
    const data = fs.readFileSync(ordersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lecture orders.json:', error);
    return [];
  }
};

// Fonction pour sauvegarder les commandes
if (saveOrders(orders)) {
  console.log(`✅ Nouvelle commande: ${newOrder.id}...`);
  
  // ✅ AJOUTER CE BLOC
  try {
    // Email au client (si email fourni)
    if (customer.email && customer.email !== 'Non fourni') {
      await sendClientEmail(
        customer.email,
        `${customer.prenom} ${customer.nom}`,
        newOrder.orderNumber,
        newOrder.cart,
        total,
        currency
      );
    }

    // Email au vendeur (VOUS)
    await sendVendorEmail(
      newOrder.orderNumber,
      customer,
      newOrder.cart,
      total,
      currency
    );

    console.log('📧 Notifications envoyées');
  } catch (notifError) {
    console.error('⚠️ Erreur notifications:', notifError.message);
  }
  // FIN DU BLOC
  
  return res.status(201).json({
    success: true,
    message: 'Commande créée avec succès !',
    order: newOrder
  });
}

// 📥 POST - Créer une nouvelle commande
router.post('/create', (req, res) => {
  try {
    const { customer, cart, total, currency, paymentMethod } = req.body;

    // Validation
    if (!customer || !cart || !total) {
      return res.status(400).json({
        success: false,
        message: 'Données manquantes (customer, cart, total requis)'
      });
    }

    if (cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le panier est vide'
      });
    }

    // Lire les commandes existantes
    const orders = readOrders();

    // Créer la nouvelle commande
    const newOrder = {
      id: `CMD-${Date.now()}`,
      orderNumber: orders.length + 1,
      customer: {
        nom: customer.nom,
        prenom: customer.prenom,
        telephone: customer.telephone,
        email: customer.email || 'Non fourni',
        adresse: customer.adresse,
        quartier: customer.quartier,
        ville: customer.ville
      },
      cart: cart.map(item => ({
        id: item.id,
        brand: item.brand,
        name: item.name,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      total: total,
      currency: currency || 'fcfa',
      paymentMethod: paymentMethod || 'livraison',
      paymentStatus: 'En attente', // En attente, Payé, Annulé
      orderStatus: 'Nouvelle',     // Nouvelle, Confirmée, En livraison, Livrée, Annulée
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ajouter la commande
    orders.push(newOrder);

    // Sauvegarder
    if (saveOrders(orders)) {
      console.log(`✅ Nouvelle commande: ${newOrder.id} - ${customer.prenom} ${customer.nom} - ${total} ${currency}`);
      
      return res.status(201).json({
        success: true,
        message: 'Commande créée avec succès !',
        order: newOrder
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la sauvegarde'
      });
    }

  } catch (error) {
    console.error('Erreur création commande:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// 📋 GET - Récupérer toutes les commandes
router.get('/', (req, res) => {
  try {
    const orders = readOrders();
    
    return res.json({
      success: true,
      count: orders.length,
      orders: orders.reverse() // Plus récentes en premier
    });
  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// 🔍 GET - Récupérer une commande par ID
router.get('/:id', (req, res) => {
  try {
    const orders = readOrders();
    const order = orders.find(o => o.id === req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    return res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Erreur récupération commande:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// ✏️ PUT - Mettre à jour le statut d'une commande
router.put('/:id/status', (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const orders = readOrders();
    const orderIndex = orders.findIndex(o => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Mettre à jour le statut
    if (orderStatus) orders[orderIndex].orderStatus = orderStatus;
    if (paymentStatus) orders[orderIndex].paymentStatus = paymentStatus;
    orders[orderIndex].updatedAt = new Date().toISOString();

    if (saveOrders(orders)) {
      console.log(`✏️ Commande ${req.params.id} mise à jour`);
      
      return res.json({
        success: true,
        message: 'Commande mise à jour',
        order: orders[orderIndex]
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la sauvegarde'
      });
    }

  } catch (error) {
    console.error('Erreur mise à jour commande:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// 🗑️ DELETE - Supprimer une commande
router.delete('/:id', (req, res) => {
  try {
    const orders = readOrders();
    const filteredOrders = orders.filter(o => o.id !== req.params.id);

    if (orders.length === filteredOrders.length) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    if (saveOrders(filteredOrders)) {
      console.log(`🗑️ Commande ${req.params.id} supprimée`);
      
      return res.json({
        success: true,
        message: 'Commande supprimée'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression'
      });
    }

  } catch (error) {
    console.error('Erreur suppression commande:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// 📊 GET - Statistiques
router.get('/stats/dashboard', (req, res) => {
  try {
    const orders = readOrders();
    
    const stats = {
      totalOrders: orders.length,
      newOrders: orders.filter(o => o.orderStatus === 'Nouvelle').length,
      confirmedOrders: orders.filter(o => o.orderStatus === 'Confirmée').length,
      deliveredOrders: orders.filter(o => o.orderStatus === 'Livrée').length,
      cancelledOrders: orders.filter(o => o.orderStatus === 'Annulée').length,
      totalRevenue: orders
        .filter(o => o.paymentStatus === 'Payé')
        .reduce((sum, o) => sum + o.total, 0),
      pendingRevenue: orders
        .filter(o => o.paymentStatus === 'En attente')
        .reduce((sum, o) => sum + o.total, 0)
    };

    return res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Erreur statistiques:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

module.exports = router;

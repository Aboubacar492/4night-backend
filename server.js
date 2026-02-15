const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static(__dirname));

// Créer le dossier data s'il n'existe pas
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Créer le fichier orders.json s'il n'existe pas
const ordersFile = path.join(dataDir, 'orders.json');
if (!fs.existsSync(ordersFile)) {
  fs.writeFileSync(ordersFile, JSON.stringify([], null, 2));
}

// Routes
const ordersRouter = require('./routes/orders');
app.use('/api/orders', ordersRouter);

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: '🌙 4NIGHT FRAGRANCE API',
    status: 'OK',
    version: '1.0.0',
    admin: 'http://localhost:5000/admin.html'
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Erreur serveur',
    error: err.message 
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📁 Fichier des commandes: ${ordersFile}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}/api/orders`);
  console.log(`👨‍💼 Page Admin: http://localhost:${PORT}/admin.html`);
});
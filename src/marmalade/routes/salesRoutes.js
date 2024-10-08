// routes/salesRoutes.js
const express = require('express');
const router = express.Router();
const SalesService = require('../services/salesService');

// Instantiate SalesService once
const salesService = new SalesService();

router.get('/all', async (req, res) => {
    console.log('GET /all');
  try {
    const sales = await salesService.getAllSales();
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/by-type/:type', async (req, res) => {
  try {
    const sales = await salesService.getSalesByType(req.params.type);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/by-account/:account', async (req, res) => {
  try {
    const sales = await salesService.getSalesForAccount(req.params.account);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/by-token/:token', async (req, res) => {
  try {
    const sales = await salesService.getSalesForToken(req.params.token);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New route for getting collection by token ID
router.get('/collection/:tokenId', async (req, res) => {
  try {
    console.log(req.params)
    const collection = await salesService.getCollectionByTokenId(req.params.tokenId);
    if (collection) {
      res.json(collection);
    } else {
      res.status(404).json({ message: "Collection not found for the given token ID" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
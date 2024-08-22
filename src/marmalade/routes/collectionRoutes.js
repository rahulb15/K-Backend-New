// routes/collectionRoutes.js
const express = require('express');
const router = express.Router();
const CollectionService = require('../services/collectionService');


const collectionService = new CollectionService();

router.get('/all', async (req, res) => {
  try {
    const collections = await collectionService.getAllCollections();
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:collectionId', async (req, res) => {
  try {
    const collection = await collectionService.getCollection(req.params.collectionId);
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:collectionId/tokens', async (req, res) => {
  try {
    const tokens = await collectionService.getTokensFromCollection(req.params.collectionId);
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/detailed', async (req, res) => {
    try {
        console.log('GET /detailed');
      const detailedCollections = await collectionService.getAllCollectionsDetailed();
      console.log('detailedCollections:', detailedCollections.length);
      res.json(detailedCollections);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
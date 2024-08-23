import { Router } from "express";
import { searchNftsAndCollections,flexibleSearchNftsAndCollections, flexibleSearchCollections } from "../../config/elasticsearchSync";

const router = Router();


router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const results = await searchNftsAndCollections(query);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'An error occurred during search' });
  }
});

router.get('/flexible-search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const results = await flexibleSearchNftsAndCollections(query);
    res.json(results);
  } catch (error) {
    console.error('Flexible search error:', error);
    res.status(500).json({ error: 'An error occurred during flexible search' });
  }
});

router.get('/flexible-search-collections', async (req, res) => {
  try {
    const query = req.query.q as string;
    const results = await flexibleSearchCollections(query);
    res.json(results);
  } catch (error) {
    console.error('Flexible search error:', error);
    res.status(500).json({ error: 'An error occurred during flexible search' });
  }
});

export default router;

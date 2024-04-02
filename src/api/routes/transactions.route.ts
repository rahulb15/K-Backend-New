import transactionsController from '../controllers/transactions.controller';
import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, transactionsController.create);
router.get('/', authMiddleware, transactionsController.getAll);
router.get('/:id', authMiddleware, transactionsController.getById);
router.put('/:id', authMiddleware, transactionsController.update);

export default router;

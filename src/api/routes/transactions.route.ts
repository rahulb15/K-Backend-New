import transactionsController from '../controllers/transactions.controller';
import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";

const router = Router();
router.post('/', authMiddleware, transactionsController.create);
router.get('/', authMiddleware, transactionsController.getAll);
router.get('/:id', authMiddleware, transactionsController.getById);
router.put('/:id', authMiddleware, transactionsController.update);
router.get('/checkTransaction/:sessionId', authMiddleware, transactionsController.checkTransaction);

router.get('/getAll', adminMiddleware, transactionsController.getAll);
router.get('/getById/:id', adminMiddleware, transactionsController.getByOrderId);

export default router;

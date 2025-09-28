import { Router } from 'express';
import { getUserCards, deleteUserCard } from './card.controller';

const router = Router();

router.get('/usercard', getUserCards); // get all saved cards
router.delete('/:cardId', deleteUserCard); // delete card

export default router;

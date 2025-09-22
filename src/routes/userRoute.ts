import express from 'express';
import { signUpAuth, auth } from '../middlewares/userAuth';
import { allUsers, completeProfile, login, signUp, updateAddress} from '../controllers/userController';


const router = express.Router();

router.get('/allUsers', allUsers);

router.post('/auth/signUp', signUpAuth, signUp);

router.post('/completeProfile', auth, completeProfile);

router.post('/auth/login', login);

router.put('/updateAddress', auth, updateAddress);









export default router;

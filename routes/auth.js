import { Router } from "express";
// import verify from '../middlewares/verify-token.js';
import authController from "../controllers/auth.js";
import {asyncRoute} from "../utils/errors.js";

const router = Router();

router.post('/login', asyncRoute(authController.login));
router.post('/register', asyncRoute(authController.register));
router.post('/logout', asyncRoute(authController.logout));
router.get('/activate/:link', asyncRoute(authController.activate));
router.get('/refresh', asyncRoute(authController.refresh));
router.get('/users', asyncRoute(authController.getUsers));

export default router;
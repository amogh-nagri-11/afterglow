import { Router } from 'express'; 
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";
import { signup, login } from "../controllers/authController"; 

const router = Router(); 

router.post('/signup', signup); 
router.post('/login', login);
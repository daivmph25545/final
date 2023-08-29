import express from "express"

import { logIn, register, verify } from "../controllers/auth"

const router = express.Router()
router.post('/register', register)
router.post('/verify', verify)
router.post('/login', logIn)

export default router
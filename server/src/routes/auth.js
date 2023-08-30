import express from "express"


import { getAllUser, getOneUser, logIn, register, removeUser, updateUser, verify } from "../controllers/auth"

const router = express.Router()
router.post( '/register', register )
router.post( '/login', logIn )

router.post( '/verify', verify )
router.get( '/getAllUser', getAllUser )
router.get( '/getOneUser/:id', getOneUser )
router.delete( '/removeUser/:id', removeUser )
router.put( '/updateUser/:id', updateUser )







export default router
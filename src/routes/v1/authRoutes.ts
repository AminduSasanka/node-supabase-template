import { Router } from 'express'
import authController from '../../controllers/v1/authController'
import { userValidator } from '../../validators/userValidator'
import authMiddleware from '../../middleware/authMiddleware'

const authRouter = Router()

authRouter.post('/sign_in', userValidator.loginUser, authController.logIn)
authRouter.get('/sign_out', authController.logOut)
authRouter.post('/sign_up', userValidator.createUser, authController.signUp)
authRouter.get('/confirm', authController.emailConfirm)
authRouter.post('/reset_password', userValidator.resetPassword, authController.resetPassword)
authRouter.get('/reset_password_confirm', authController.resetPasswordConfirm)
authRouter.post('/invite', userValidator.inviteUser, authMiddleware.authenticate, authController.inviteUser)
authRouter.get('/invite_confirm', authController.inviteConfirm)

export default authRouter
import { RequestHandler } from 'express';
import { body } from 'express-validator'

interface UserValidator {
  createUser: RequestHandler[],
  loginUser: RequestHandler[],
  resetPassword: RequestHandler[],
  inviteUser: RequestHandler[]
}

export const userValidator: UserValidator = {
  createUser: [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('date_of_birth').isISO8601().withMessage('Invalid date format (YYYY-MM-DD)'),
  ],
  loginUser: [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('First name is required')
  ],
  resetPassword: [
    body('email').isEmail().withMessage('Invalid email format')
  ],
  inviteUser: [
    body('email').isEmail().withMessage('Invalid email format'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('date_of_birth').isISO8601().withMessage('Invalid date format (YYYY-MM-DD)'),
  ]
};
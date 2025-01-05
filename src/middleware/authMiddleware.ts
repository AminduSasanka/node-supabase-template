import dotenv from 'dotenv'
import { NextFunction, Request, Response } from "express"
import authService from "../../services/authService"

dotenv.config()

const defaultAccessTokenName: string = "access_token"

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  let token = req.headers.authorization?.split(' ')[1]
  
  if(!token){
    const tokenName: string = `${process.env.SUPABASE_ACCESS_TOKEN_NAME}` || defaultAccessTokenName

    if(!req.cookies){
      res.status(401).json({ message: 'Invalid request', content: null, status: false })
      return
    }

    token = req.cookies[tokenName]

    if(!token){
      res.status(401).json({ message: 'Invalid access token', content: null, status: false })
      return
    }
  }

  if(await authService.isAuthenticated(token))
    next()
  else{
    res.status(401).json({ message: 'User is unauthorized', content: null, status: false })
    return
  }
}

export default {
  authenticate
}
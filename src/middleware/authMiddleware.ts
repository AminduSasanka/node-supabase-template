import dotenv from 'dotenv'
import { NextFunction, Request, Response } from "express"
import authService from "../../services/authService"

dotenv.config()

const defaultAccessTokenName: string = "access_token"
const defaultRefreshTokenName: string = "refresh_token"

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const tokenName: string = `${process.env.SUPABASE_ACCESS_TOKEN_NAME}` || defaultAccessTokenName
  const refreshTokenName: string = `${process.env.SUPABASE_REFRESH_TOKEN_NAME}` || defaultRefreshTokenName

  let token = req.headers.authorization?.split(' ')[1]
  
  if(!token){

    if(!req.cookies){
      res.status(401).json({ message: 'Invalid request', content: null, status: false })
      return
    }

    token = req.cookies[tokenName]
  }

  if(!token){
    res.status(401).json({ message: 'Invalid access token', content: null, status: false })
    return
  }

  if(await authService.isAuthenticated(token))
    next()
  else{
    let session = await authService.refreshToken(token, req.cookies[refreshTokenName])

    if(!session){
      res.status(401).json({ message: 'User is unauthorized', content: null, status: false })
      return
    }

    res.cookie(
      `${process.env.SUPABASE_ACCESS_TOKEN_NAME || defaultAccessTokenName}`,
      session.access_token,
      { 
        httpOnly: true
      }
    )
    
    res.cookie(`${process.env.SUPABASE_REFRESH_TOKEN_NAME || defaultRefreshTokenName}`, 
      session.refresh_token,
      { 
        httpOnly: true 
      }
    )

    next()
  }
}

export default {
  authenticate
}
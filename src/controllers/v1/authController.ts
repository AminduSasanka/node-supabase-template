import dotenv from 'dotenv'
import { Request, Response } from "express"
import authService from "../../../services/authService"
import { validationResult } from "express-validator"
import { UserCreateRequestInterface, UserInvitationInterface, UserLoginRequestInterface, UserResetPasswordInterface } from "../../interfaces/userInterface"
import { EmailOtpType } from '@supabase/supabase-js'

dotenv.config()

const defaultAccessTokenName: string = "access_token"
const defaultRefreshTokenName: string = "refresh_token"

const logIn = async (req:Request, res:Response) => {
  const { email, password }: UserLoginRequestInterface = req.body
  const errors = validationResult(req)

  if(!errors.isEmpty()){
    res.status(400).json({message: "Invalid credentials", content: errors.array(), status: false})
    return
  }

  let session = await authService.loginUser({email, password})

  if(session){
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

    res.status(200).json({ message: "Successfully logged in", content: session.user, status: true })
    return
  }

  res.status(500).json({message: "Could not log in user.", content: null, status: false})
}

const signUp = async (req:Request, res:Response) => {
  const { first_name, last_name, date_of_birth, email, password }: UserCreateRequestInterface = req.body;
  const errors = validationResult(req)

  if(!errors.isEmpty()){
    res.status(400).json({message: 'All field are required', content: errors.array(), status: 'false'})
    return
  }

  let dateOfBirth = new Date(date_of_birth);

  let user = await authService.createUser({
    first_name: first_name,
    last_name: last_name,
    email: email,
    password: password,
    dateOfBirth: dateOfBirth
  })

  if(user){
    res.status(200).json({message: 'User created successfully', content: user, status: 'false'})
    return
  }
  
  res.status(500).json({message: 'Could not create user', content: null, status: 'false'})
  return
}

const emailConfirm = async (req:Request, res:Response) => {
  if(!req.query.token_hash || !req.query.type){
    if(req.query.next){
      res.redirect(303, `/${req.query.next}`)
      return
    }
    else{
      res.redirect(303, `/`)
      return
    }
  }

  const token_hash: string = req.query.token_hash?.toString()
  const token_type: EmailOtpType = req.query.type as EmailOtpType
  const next = req.query.next ?? "/"

  let isEmailVerified = await authService.verifyToken({
    type: token_type,
    token_hash: token_hash
  })

  if (!isEmailVerified) {
    res.redirect(303, `/`)
    return
  }

  res.redirect(303, `${next}`)
}

const logOut = async (req:Request, res:Response) => {
  const tokenName: string = `${process.env.SUPABASE_ACCESS_TOKEN_NAME}` || defaultAccessTokenName
  
  if(req.cookies){
    let token: string = req.cookies[tokenName]
    let user = await authService.isUserAuthenticated(token)

    if(!user){
      res.status(400).json({message: "Already logged out", content: null, status: false})
      return
    }

    if(!token){
      res.status(400).json({message: "Token is missing", content: null, status: false})
      return
    }

    if(await authService.logoutUser(token)){
      res.status(200).json({message: "Successfully logged out", content: null, status: true})
      return
    }

    res.status(500).json({message: "Could not log out", content: null, status: true})
    return
  }
}

const resetPassword = async (req: Request, res: Response) => {
  const { email }: UserResetPasswordInterface = req.body
  const errors = validationResult(req)

  if(!errors.isEmpty()){
    res.status(400).json({message: "Email is missing", content: errors.array(), status: false})
    return
  }

  const isRecoveryEmailSent = await authService.recoverPassword(email)

  if(!isRecoveryEmailSent){
    res.status(500).json({message: "Could not send recovery email", content: null, status: true})
    return
  }

  res.status(200).json({message: "Recovery email sent", content: null, status: true})
}

const resetPasswordConfirm = async (req: Request, res: Response) => {
  if(!req.query.token_hash || !req.query.type){
    if(req.query.next){
      res.redirect(303, `/${req.query.next}`)
      return
    }
    else{
      res.redirect(303, `/`)
      return
    }
  }

  const token_hash: string = req.query.token_hash?.toString()
  const token_type: EmailOtpType = req.query.type as EmailOtpType
  const next = req.query.next ?? "/"

  let isTokenVerified = await authService.verifyToken({
    type: token_type,
    token_hash: token_hash
  })

  if (!isTokenVerified) {
    res.redirect(303, `/`)
    return
  }

  res.redirect(303, `${next}`)
}

const inviteUser = async (req: Request, res: Response) => {
  const { email, first_name, last_name, date_of_birth }: UserInvitationInterface = req.body
  const errors = validationResult(req)

  if(!errors.isEmpty()){
    res.status(400).json({message: "Invalid email", content: errors.array(), status: false})
    return
  }

  let dob = new Date(date_of_birth)
  let invitation = await authService.invite({email, first_name, last_name, date_of_birth: dob})

  if(!invitation){
    res.status(500).json({message: "Could not send invitation", content: null, status: false})
    return
  }

  res.status(200).json({message: 'Invitation sent', content: invitation, status: true})
}

const inviteConfirm = async (req: Request, res: Response) => {
  if(!req.query.token_hash || !req.query.type){
    if(req.query.next){
      res.redirect(303, `/${req.query.next}`)
      return
    }
    else{
      res.redirect(303, `/`)
      return
    }
  }

  const token_hash: string = req.query.token_hash?.toString()
  const token_type: EmailOtpType = req.query.type as EmailOtpType
  const next = req.query.next ?? "/"

  let isTokenVerified = await authService.verifyToken({
    type: token_type,
    token_hash: token_hash
  })

  if (!isTokenVerified) {
    res.redirect(303, `/`)
    return
  }

  res.redirect(303, `${next}`)
}

export default {
  logIn,
  signUp,
  emailConfirm,
  logOut,
  resetPassword,
  resetPasswordConfirm,
  inviteUser,
  inviteConfirm
}
import {  VerifyTokenHashParams } from "@supabase/supabase-js";
import { supabaseClient as supabase } from "../lib/supabase/supabase";
import dotenv from 'dotenv'

dotenv.config()

interface NewUserData {
  first_name:string,
  last_name:string,
  email:string,
  password:string,
  dateOfBirth:Date
}

interface LoginData {
  email: string,
  password: string
}

interface InvitationData {
  email: string,
  first_name: string,
  last_name: string,
  date_of_birth: Date
}

const createUser = async (user: NewUserData) => {
  try{
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        emailRedirectTo: `${process.env.HOST}/welcome`,
        data: {
          first_name: user.first_name,
          last_name: user.last_name,
          date_of_birth: user.dateOfBirth,
        },
      },
    });

    if (error || !data.user) {
      console.error('Error creating user:', error);
      return null;
    }

    console.log('User created successfully:', data);
    return data;
  }
  catch(error){
    console.error('Error creating user:', error);
    return null;
  }
}

const loginUser = async (login: LoginData) => {
  try {
    let { data, error } = await supabase.auth.signInWithPassword({
      email: login.email,
      password: login.password
    })

    if(error){
      console.error('Could not log in user', error)
      return null
    }

    return data.session
  } 
  catch (error) {
    console.error('Could not log in user', error)
    return null
  }
}

const logoutUser = async (token: string) => {
  try {
    let { error } = await supabase.auth.admin.signOut(token)

    if(error){
      console.error('Could not log out user', error)
      return null
    }

    return true
  }
  catch (error) {
    console.error('Could not log out user', error)
    return null
  }
}

const verifyToken = async ({type, token_hash}: VerifyTokenHashParams) => {
  try {
    const { error } = await supabase.auth.verifyOtp({type, token_hash})

    if (error) {
      console.error('Error occurred during token verification', error)
      return null
    }
    
    console.log('Token verified')
    return true
  }
  catch (error) {
    console.error('Could not verify token', error)
    return null
  }
}

const isUserAuthenticated = async (token: string) => {
  try{
    const { data: { user } } = await supabase.auth.getUser(token)

    return user
  }
  catch(error){
    console.error('Could not get user', error)
    return null
  }
}

const recoverPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      email, {redirectTo: `${process.env.HOST}/reset_password`}
    )
    
    if(error){
      console.error('Could not send reset password email', error)
      return null
    }

    return data
  }
  catch (error) {
    console.error('Could not send reset password email', error)
    return null
  }
}

const invite = async (user: InvitationData) => {
  try {
    let { data, error } = await supabase.auth.admin.inviteUserByEmail(
      user.email, {
      redirectTo: `${process.env.HOST}/update_profile`,
      data: {
        first_name: user.first_name,
        last_name: user.last_name,
        date_of_birth: user.date_of_birth
      }
    })
    
    if(error){
      console.error('Could not send the invitation', error)
      return null
    }

    return data
  }
  catch (error) {
    console.error('Could not send the invitation', error)
    return null
  }
}

const isAuthenticated = async (jwt: string) => {
  try {
    let user = await supabase.auth.getUser(jwt)

    if(!user)
      return false

    return true
  }
  catch (error) {
    console.error('Could not get user', error)
    return false
  }
}

export default {
  createUser,
  loginUser,
  logoutUser,
  verifyToken,
  isUserAuthenticated,
  recoverPassword,
  invite,
  isAuthenticated
}
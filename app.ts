import express, { json, Request, Response } from 'express';
import dotenv from 'dotenv'
import authRouter from './src/routes/v1/authRoutes';
import cookieParser from 'cookie-parser';

const app = express()
dotenv.config()

const PORT = process.env.PORT || 3000

// TODO: add error handling for invalid json data
app.use(json());
app.use(cookieParser())
app.use('/api/v1/auth', authRouter)

// mocking client end points for testing purposes
app.get('/welcome', (req:Request, res:Response)=>{
  res.status(200).send('WELCOME')
})

// mocking client end points for testing purposes
app.get('/reset_password', (req:Request, res:Response)=>{
  res.status(200).send('RESET PASSWORD')
})

// mocking client end points for testing purposes
app.get('/update_profile', (req:Request, res:Response)=>{
  res.status(200).send('UPDATE_PROFILE')
})

app.get('/api/health', (req:Request, res:Response)=>{
  res.status(200).send('Application up and running')
})

app.listen(PORT, () =>{
  console.log("Server is Successfully Running, and App is listening on port "+ PORT)
});
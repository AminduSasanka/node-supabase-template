import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const URL:string = process.env.SUPABASE_URL || ""
const KEY:string = process.env.SUPABASE_SERVICE_KEY || ""

export const supabaseClient = createClient(URL, KEY)

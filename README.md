
# Supabase Integration Template: Authentication Setup Guide

This template provides the foundational code to seamlessly integrate Supabase authentication into your application. You can customize the provided code to fit your specific needs.

---

## **Overview**
This guide walks you through setting up Supabase to handle user authentication and profile management. It includes instructions for creating database tables, triggers, policies, and customizing email templates.

---

## **Steps to Set Up Supabase**

### **Step 1: Create a Supabase Project**
1. Create a Supabase project.
2. Add a new table named `user_profiles` under the `public` schema.
3. Configure the table to include a foreign key `user_id` that references the `id` column in the `auth.users` table.

---

### **Step 2: Set Up Triggers and Functions**
To ensure synchronization between `auth.users` and `public.user_profiles`:
1. **Create a Trigger Function**  
   Use this function to automatically insert a new record into `public.user_profiles` whenever a user is created in `auth.users`.

   ```sql
   CREATE OR REPLACE FUNCTION sync_auth_users_to_user_profiles()
   RETURNS TRIGGER
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   BEGIN
     INSERT INTO public.user_profiles (user_id, email, first_name, last_name, date_of_birth)
     VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name', 
     (NEW.raw_user_meta_data->>'date_of_birth')::date);
     RETURN NEW;
   END;
   $$;
   ```

2. **Attach the Trigger**  
   Link the function to the `auth.users` table with the following trigger:

   ```sql
   DROP TRIGGER IF EXISTS after_user_created ON auth.users;

   CREATE TRIGGER after_user_created
   AFTER INSERT ON auth.users
   FOR EACH ROW
   EXECUTE FUNCTION sync_auth_users_to_user_profiles();
   ```

---

### **Step 3: Configure Policies for `user_profiles`**
Create Row-Level Security (RLS) policies to control access to the `user_profiles` table.

```sql
CREATE POLICY "Allow service role to select from user_profiles"
ON public.user_profiles
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Allow service role to insert into user_profiles"
ON public.user_profiles
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow service role to update user_profiles"
ON public.user_profiles
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role to delete from user_profiles"
ON public.user_profiles
FOR DELETE
TO service_role
USING (true);
```

---

### **Step 4: Customize Email Templates**
Update Supabase email templates to align with your application's branding and flow.

1. **Confirm Sign-Up Email**  
   ```html
   <h2>Confirm your signup</h2>
   <p>Follow this link to confirm your user:</p>
   <p>
     <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">
       Confirm your email
     </a>
   </p>
   ```

2. **Invite User Email**  
   ```html
   <h2>You have been invited</h2>
   <p>You have been invited to create a user on {{ .SiteURL }}. Follow this link to accept the invite:</p>
   <p>
     <a href="{{ .SiteURL }}/auth/invite_confirm?token_hash={{ .TokenHash }}&type=invite&next={{ .RedirectTo }}">
       Accept the invite
     </a>
   </p>
   ```

3. **Reset Password Email**  
   ```html
   <h2>Reset Password</h2>
   <p>Follow this link to reset the password for your user:</p>
   <p>
     <a href="{{ .SiteURL }}/auth/reset_password_confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}">
       Reset Password
     </a>
   </p>
   ```

---

### **Step 5: Change env file**
Update Supabase email templates to align with your application's branding and flow.

```
HOST=http://localhost:3000
CLIENT_HOST=http://localhost:3000
PORT=3000
SUPABASE_URL=supabase_api_url_here
SUPABASE_ANON_KEY=anon_key_here
SUPABASE_SERVICE_KEY=service_key_here
SUPABASE_ACCESS_TOKEN_NAME=supabase-app-token
SUPABASE_REFRESH_TOKEN_NAME=supabase-app-refresh-token
```

---

## **Why Use This Approach?**
1. **Atomic Operations**: Database triggers ensure synchronization between `auth.users` and `public.user_profiles` with minimal overhead.
2. **Security**: RLS policies enable fine-grained control over who can access or modify the data.
3. **Customization**: Email templates allow you to personalize the user experience.

---

## **Notes**
- You can further extend this setup by adding custom columns to the `user_profiles` table for application-specific metadata.
- Always test the triggers and policies in a staging environment before deploying to production.

By following this guide, you'll establish a robust and secure authentication system that integrates seamlessly with Supabase.

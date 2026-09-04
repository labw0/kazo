# KAZO Setup

## 1) Supabase
1. Create a Supabase project.
2. Open SQL Editor and run `supabase-schema.sql` once.
3. In Authentication > Providers > Email, keep email confirmation enabled.
4. In Authentication > Email Templates > Confirm signup, include the OTP variable `{{ .Token }}` in the message body so the user receives a 6-digit code.
5. Put your Project URL and Publishable/Anon key in `supabase-config.js`.
6. Deploy the Edge Function `supabase/functions/login-by-id` as `login-by-id`.
7. In Authentication > URL Configuration, set Site URL to your GitHub Pages URL and add it to Redirect URLs.

## 2) GitHub Pages
1. Upload all files in this folder to the root of your GitHub repository.
2. Repository Settings > Pages.
3. Source: Deploy from a branch.
4. Branch: `main`, Folder: `/(root)`, then Save.

## Security
- Never put the Supabase `service_role` key in GitHub or browser JavaScript.
- The browser only uses the Publishable/Anon key.
- `service_role` is used only inside the Supabase Edge Function environment.

# Google Authentication Setup Guide

To enable "Sign in with Google", you need to configure Google Cloud Platform and Supabase.

## Step 1: Google Cloud Console
1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (e.g., "Vibe Chat").
3.  Navigate to **APIs & Services** > **OAuth consent screen**.
    *   Select **External**.
    *   Fill in App Name, User Support Email, and Developer Contact Info.
    *   Click **Save and Continue**.
4.  Navigate to **Credentials**.
    *   Click **Create Credentials** > **OAuth client ID**.
    *   Application type: **Web application**.
    *   Name: `Supabase Auth`.
    *   **Authorized JavaScript origins**: `https://<your-project-ref>.supabase.co` (Get this from Supabase Dashboard).
    *   **Authorized redirect URIs**: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
    *   Click **Create**.
5.  Copy the **Client ID** and **Client Secret**.

## Step 2: Supabase Dashboard
1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Navigate to **Authentication** > **Providers**.
3.  Click on **Google**.
4.  Enable **Google**.
5.  Paste the **Client ID** and **Client Secret** from Step 1.
6.  Click **Save**.

## Step 3: Verify Redirect URL
1.  In Supabase Dashboard, go to **Authentication** > **URL Configuration**.
2.  Ensure `Site URL` is set to `http://localhost:3000` (for local dev).
3.  Add `http://localhost:3000/auth/callback` to **Redirect URLs**.

## Step 4: Test
1.  Restart your dev server.
2.  Go to `/login`.
3.  Click "Sign in with Google".

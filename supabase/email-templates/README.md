# Supabase email templates (HiddenSense)

Paste these into **Supabase Dashboard → Authentication → Email Templates**.

| App action | Supabase template | File |
|------------|-------------------|------|
| **Sign up** (new account) | **Confirm signup** | `confirm-signup.html` |
| **Sign in** (returning user) | **Magic Link** | `magic-link.html` |

Both must use `{{ .Token }}` (not `{{ .ConfirmationURL }}`) so users receive a **verification code** for `/verify`.

**Subject lines (suggested):**

- Confirm signup: `Your HiddenSense verification code`
- Magic Link: `Your HiddenSense sign-in code`

After saving, send a test sign-in from `/login` — you should no longer see the default “Follow this link to login” email.

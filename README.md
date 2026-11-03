# FitX Parts Bin

Electronic components stock app for FitX Sports Equipment Services.
One codebase: a website (`www/`) and an Android APK built by GitHub Actions.

## 1. Firebase (once)

1. Go to https://console.firebase.google.com → **Add project** → name it `fitx-parts`. Keep the free **Spark** plan. This is a new project, separate from FitX Call, FitX Accounts and Xapp.
2. **Build → Firestore Database → Create database** → choose a location (e.g. `europe-west`) → start in **production mode**.
3. Firestore → **Rules** tab → paste everything from `firestore.rules` → **Publish**.
4. **Build → Authentication → Get started → Email/Password → Enable**.
5. Authentication → **Users → Add user** for each staff member (email + password).
6. Authentication → **Settings → Authorized domains → Add domain** → `fitx.qa` (and `www.fitx.qa`).
7. **Project settings (gear) → General → Your apps → Web (</>)** → register app `FitX Parts` → copy the `firebaseConfig` values into `www/firebase-config.js`.

## 2. Google Drive backup (website)

Uses the same Google Cloud project that Firebase created.

1. Open https://console.cloud.google.com and pick the **fitx-parts** project at the top.
2. **APIs & Services → Library** → search **Google Drive API** → **Enable**.
3. **APIs & Services → OAuth consent screen** → User type **External** → app name `FitX Parts`, support email `fitxqa@gmail.com`, developer email `fitxqa@gmail.com` → Save.
   - Scopes: add `.../auth/drive.file` (only lets the app see files it created).
   - Then **Publish app** so sign-in doesn't expire after 7 days. `drive.file` does not need Google verification.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID** → type **Web application** → name `FitX Parts web`.
   - Authorized JavaScript origins: `https://www.fitx.qa` and `https://fitx.qa`
5. Copy the **Client ID** into `www/firebase-config.js` as `GOOGLE_CLIENT_ID`.

How it works:
- **Website:** Backup → **Back up to Google Drive**. The first time, choose the Google account (e.g. fitxqa@gmail.com) and allow access. Files go to the **FitX Parts Backups** folder. **Restore from Drive** lists the last 15 backups.
- **Phone app:** Google doesn't allow its sign-in inside apps like this, so tap Backup → **Share backup** → **Drive** → pick the **FitX Parts Backups** folder.
- The Backup button turns red when the last backup is 7 or more days old, for everyone signed in.

## 3. GitHub repo and APK

1. Create the repo `fitxqa/fitx-parts` on GitHub (private is fine).
2. Upload all files from this folder, including the hidden `.github` folder.
3. Repo **Settings → Secrets and variables → Actions** → add the same two secrets you use for FitX Accounts:
   - `FITX_KEYSTORE_B64`
   - `FITX_KEYSTORE_PASS`
   With these, every new APK installs over the old one. Without them the build still works but uses a temporary key, so each update needs an uninstall first.
4. Every push to `main` builds the APK. Open the repo's **Releases** page on the phone and download `FitX-Parts-1.0.N.apk`. You can also start a build from **Actions → Build FitX Parts APK → Run workflow**.

## 4. Web version (GitHub Pages)

The website is published from the same repo, straight from the `www` folder.

1. GitHub Pages is free only for **public** repos on a free GitHub plan, so make `fitxqa/fitx-parts` public (Settings → General → Danger Zone → Change visibility). Your stock data is not in the repo; it stays in Firebase behind the staff login.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` (or **Actions → Publish FitX Parts website → Run workflow**). After about a minute the site is live at:
   `https://fitxqa.github.io/fitx-parts/`
4. Allow that address:
   - Firebase → Authentication → Settings → Authorized domains → add `fitxqa.github.io`
   - Google Cloud → Credentials → your Web OAuth client → Authorized JavaScript origins → add `https://fitxqa.github.io`
5. Optional, your own address such as `parts.fitx.qa`:
   - At your domain provider add a **CNAME** record: `parts` → `fitxqa.github.io`
   - GitHub repo → Settings → Pages → Custom domain → `parts.fitx.qa` → Save, then tick **Enforce HTTPS**
   - Add `parts.fitx.qa` to Firebase authorized domains and `https://parts.fitx.qa` to the Google OAuth origins.

## Updating the app

Edit `www/index.html` and commit to `main`. GitHub then updates the website and builds a new APK (download it from Releases) automatically.


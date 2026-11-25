# صوت الميكانيكي · La Voix du Mécanicien — Synergia Automotive Survey

Mobile-first Arabic (RTL) survey. Next.js on Vercel. Answers go to a private Google Sheet through a Google Apps Script.
The existing WordPress site is never touched. This project only uses the sub-domain `survey.synergia-business.com`.

How it works: the phone sends answers to `/api/submit` (your Vercel server). The server checks them, then sends them to Apps Script with a secret password. Apps Script writes one row and confirms. Only then does the visitor see the thank-you screen.

What you need: a Google account, a free GitHub account, a free Vercel account, access to the OVH DNS of synergia-business.com.

---

## Part A: Google Sheet and Apps Script

1. Go to https://sheets.google.com and create a **Blank** spreadsheet. Name does not matter, the script renames it.
2. In the sheet menu choose **Extensions > Apps Script**.
3. Delete everything in the editor. Open `apps-script/Code.gs` from this project, copy all of it, paste it in the editor. Click the save icon.
4. Create the secret password. Make up a long random text, at least 32 letters and numbers (a password manager generator works). Keep it, you need it twice.
5. In Apps Script, click the gear icon (**Project Settings**). Scroll to **Script Properties**, click **Add script property**. Property: `SHARED_SECRET`. Value: your secret. Save.
6. Go back to the editor (`<>` icon). In the function dropdown at the top choose `setupSheet`, click **Run**. Google asks for permission: **Review permissions**, choose your account, **Advanced**, **Go to (project) (unsafe)**, **Allow**. This is normal for your own script.
7. Open the sheet tab. You should now see two tabs, `Responses` (with 24 headers) and `Data Dictionary`, and the file is named "Synergia — Automotive Training Market Research".
8. In Apps Script click **Deploy > New deployment**. Click the gear next to "Select type", choose **Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Click **Deploy**.
9. Copy the **Web app URL** (ends with `/exec`). This is `APPS_SCRIPT_URL`.

The sheet itself stays private (do not share it publicly). "Anyone" only applies to the script URL, and that URL refuses every request that does not carry your secret.

**Important:** every time you change `Code.gs` later, use **Deploy > Manage deployments > pencil > Version: New version > Deploy**. The URL stays the same.

## Part B: GitHub

1. Go to https://github.com, sign in, click **+ > New repository**. Name: `synergia-survey`. Choose **Private**. Click **Create repository**.
2. Click **uploading an existing file**.
3. Unzip this project on your computer. Open the unzipped folder, select **everything inside it** (the files and the `src`, `apps-script`, `public` folders) and drag them into the GitHub page. Do not drag the outer folder itself: `package.json` must be at the top level of the repository.
4. Wait until the upload finishes, then click **Commit changes**.

Do not upload any file called `.env` or `.env.local`. Your secret goes only in Vercel and Apps Script.

## Part C: Vercel

1. Go to https://vercel.com, sign up with **Continue with GitHub**.
2. Click **Add New > Project**, find `synergia-survey`, click **Import** (if it is not listed, click "Adjust GitHub App permissions" and allow that repository).
3. Framework Preset should say **Next.js**. Leave the build settings alone.
4. Open **Environment Variables** and add two:
   - Name `APPS_SCRIPT_URL`, value: the Web app URL from step A9.
   - Name `APPS_SCRIPT_SECRET`, value: the exact same secret as step A5.
5. Click **Deploy**. After about a minute you get a link like `synergia-survey.vercel.app`.

If you add or change a variable after deploying, go to **Deployments > the three dots > Redeploy**.

## Part D: Test a real submission

1. Open your Vercel link on your phone. Complete the survey. Tick Q19 either way and test once with name and phone empty.
2. The thank-you screen should appear. Open the Google Sheet: a new row must be in `Responses`.
3. Test the campaign tracking by opening `https://YOUR-LINK/?utm_source=facebook&utm_medium=paid&utm_campaign=mecanique_nov` and submitting: Acquisition Source should read `facebook / paid` and Campaign `mecanique_nov`. Without parameters the source is `direct`.
4. Test failure: in Vercel change `APPS_SCRIPT_SECRET` to a wrong value, redeploy, submit. The survey must show a red error and no row must appear. Put the correct value back and redeploy.
5. Delete your test rows in the sheet before the real campaign (delete whole rows, never the header row).

## Part E: Connect survey.synergia-business.com (OVH)

This adds one new DNS record. It does not change any existing record, so WordPress keeps working.

1. In Vercel open the project > **Settings > Domains**, type `survey.synergia-business.com`, click **Add**. Vercel shows a **CNAME** record with a value (for example `xxxxxxxx.vercel-dns-017.com`). Copy exactly what Vercel shows.
2. In OVH: **Web Cloud > Domain names > synergia-business.com > DNS zone > Add an entry > CNAME**.
3. Sub-domain: `survey`. Target: the value from Vercel, **with a dot at the end** (OVH requires it). Confirm.
4. Do not edit or delete any other line (A, MX, TXT, www...). If a line for `survey` already exists, stop and check what it is before changing anything.
5. Wait 5 to 60 minutes (sometimes longer). Vercel shows a green check when it works and issues the HTTPS certificate automatically.

---

## Files

- `src/lib/questions.ts` all questions and answer options (single source of truth)
- `src/lib/schema.ts` Zod validation and the row sent to the sheet
- `src/app/api/submit/route.ts` server route: honeypot, rate limit, validation, confirmed storage
- `src/components/Survey.tsx` the whole interface (screens, progress, conditional questions)
- `apps-script/Code.gs` Sheet backend: secret check, validation, lock, duplicate check, Data Dictionary
- `AI_ANALYSIS_PROMPT.md` prompt to analyse the exported Excel file

## Behaviour to know

- 13 screens for 18 questions (the budget question was removed; its sheet column is kept and renamed "Budget (retired)" so column positions never shift). Q6 only appears if Q5 has two or more choices (with one choice it is filled automatically).
- Q4 and Q15 allow 3 choices maximum. Q7 "Flexible" and Q14 "ما عنديش مانع" clear the other choices.
- Q7, Q8 and Q14 allow several choices because the brief did not set a limit.
- Name and phone are optional. Q19 defaults to "No" if left empty. Phone is checked only if filled (8 to 15 digits, Arabic digits accepted).
- A repeated tap or a retry after an error sends the same Submission ID, so it can never create two rows.
- The rate limit (30 per 10 minutes per IP) lives in memory of one server instance, so it is a basic brake, not a guarantee.
- The page is set to `noindex` so search engines do not list it.

## Before launch, check

- The privacy text at the end of the survey (in `Survey.tsx`, search "إجاباتك تتخزّن") is a short generic notice. Have Synergia confirm it matches how the data is really used, and add a contact for deletion requests.
- There is no logo file: the header shows the text "Synergia". To use a logo, tell your AI assistant to place it in `public/`.

## Run on your own computer (optional, needs Node.js 18+)

```
npm install
copy .env.example to .env.local and fill both values
npm run dev
```
Open http://localhost:3000.


---

## Redesign notes (bilingual FR + Tunisian Arabic edition)

The backend is unchanged: `src/app/api/submit/route.ts`, `src/lib/schema.ts`, `src/lib/questions.ts` (stored values) and `apps-script/Code.gs` are the same as before, so your Google Sheet columns and the existing Apps Script deployment keep working. Only the interface changed.

**One new dependency:** `@fontsource-variable/readex-pro` (the font, self-hosted, so nothing is loaded from Google Fonts). Run `npm install` locally, or just upload the new `package.json` and `package-lock.json`: Vercel installs it by itself.

**Where things are**

- `src/lib/bilingual.ts`: every French and Tunisian Arabic text the respondent sees (questions, answer options, hints, buttons, error messages). Each answer is stored in the sheet exactly as before (the Arabic value in `questions.ts`), whatever French wording is shown.
- `src/components/Survey.tsx`: screens, layout, animations, the welcome and thank-you screens, and the privacy notice.
- `public/brand/`: the two official logos, unmodified (`synergia-logo.png` for light backgrounds, `synergia-logo-white.png` for dark ones).
- `public/img/`: optimized WebP photos (two sizes each, 617 KB in total for all of them). To change a photo, replace the matching pair of files with the same names and sizes (560 px and 1120 px wide, 16:10 crop; the welcome photo `hero-` is 3:4).

**Editing text:** open `src/lib/bilingual.ts` on GitHub, press the pencil, change only the text inside the quotes, then commit. To add or change an answer option, change it in `questions.ts` AND add its French/Arabic pair in `bilingual.ts` (if a pair is missing, the raw value is shown on both lines). Changing a stored value in `questions.ts` splits your counts in the sheet between old and new wording, so avoid it once answers are coming in.

**Which photo is where:** welcome `3.jpeg`; profile screen `IMG_20260629_194839`; difficulties `2.jpeg`; training interests `8.jpeg`; format `IMG_20260906_131107`; expectations `IMG_20260912_173955`; thank-you screen `1790355088546`. Not used: `IMG-20261121-WA0008`, `WA0010`, `WA0027`, `IMG-20261122-WA0006`, `IMG_20260912_164851` and `IMG_20260927_152748`. They are near-duplicates of the gearbox shots, or show identifiable people (certificate groups, trainees); only use those if everyone pictured agreed to appear.

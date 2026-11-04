# Staybnb starter kit

The free companion to **Staybnb from Scratch**, a 6.5-hour course on YouTube where you build an Airbnb-style marketplace from an empty folder: a Next.js 16 storefront, a Vite + React admin dashboard and an Express 5 + Prisma 7 API, with Stripe payments, a wallet, five roles and seven languages.

Some things can't sensibly be typed along: icons, artwork, translations and a whole demo dataset. They're here.

▶ **Watch the course:** https://www.youtube.com/@reactjsbd
▶ **Live demo:** https://staybnb.reactbd.com · admin https://admin.staybnb.reactbd.com · API docs https://api.staybnb.reactbd.com/api/docs

## What's inside

| | |
| --- | --- |
| [`drop-in/`](drop-in) | Everything the course **copies** instead of typing: icons and artwork, six translations, the demo-data seeders and their photo pool, the Postman generator, the 500 page and the dashboard's sample numbers. One folder per part, laid out like the project. |
| [`env/`](env) | `.env` templates for the API, the storefront and the admin, with local defaults filled in and every secret left blank. |

## How to use it

Type along with the course. When a part says **"from the starter kit"**, copy that part's folder over your project, so every file lands in the right place:

```bash
git clone https://github.com/noorjsdivs/staybnb-starter-kit.git
cp -R staybnb-starter-kit/drop-in/part-23-storefront-icons-and-art/. ~/code/staybnb/
```

| Part | Folder | What's in it |
| ---- | ------ | ------------ |
| 20 · Swagger, Postman and a full demo dataset | [`part-20-demo-data-and-postman`](drop-in/part-20-demo-data-and-postman) | 18 files: the seeders for the demo dataset (listings, experiences, services, reviews, a curated photo pool) and the Postman generator, with a ready-made collection |
| 23 · The storefront: Next.js 16 and the design tokens | [`part-23-storefront-icons-and-art`](drop-in/part-23-storefront-icons-and-art) | 22 files: favicons, app icons, the logo, the web manifest and the 404 artwork |
| 24 · Seven languages, right-to-left, and the proxy | [`part-24-translations-and-error-page`](drop-in/part-24-translations-and-error-page) | 7 files: six translations (Arabic, Bengali, Spanish, French, Italian, Urdu) and the illustrated 500 page |
| 42 · The admin dashboard: Vite 8, React 19 and shadcn | [`part-42-admin-icons`](drop-in/part-42-admin-icons) | 14 files: the admin's favicons, app icons, logos, manifest and placeholder image |
| 45 · The dashboard page: revenue, bookings and activity | [`part-45-dashboard-sample`](drop-in/part-45-dashboard-sample) | 1 file: sample numbers for the dashboard's demo switch |

### The env templates

Copy each template next to its app, without `.example`, then fill it in as the course creates each account:

```bash
cp staybnb-starter-kit/env/apps/api/.env.example                 ~/code/staybnb/apps/api/.env
cp staybnb-starter-kit/env/apps/web/.env.development.example     ~/code/staybnb/apps/web/.env.development
cp staybnb-starter-kit/env/apps/admin/.env.development.example   ~/code/staybnb/apps/admin/.env.development
```

| Need | Why | Cost |
| --- | --- | --- |
| Stripe (test mode) + the Stripe CLI | Checkout, the webhook, wallet top-ups (and the API tests in part 21) | free |
| ImageKit | photo uploads (the demo data uses hosted photos) | free tier |
| Firebase project | Google sign-in (the API verifies the token, then issues its own JWT) | free tier |
| A mailbox with SMTP (Gmail app password, Mailtrap or Resend) | verification links and reset codes; without it the API prints them in its terminal | free tier |
| Neon + Vercel | production, in the last part | free tiers |

## Good to know

- **Keep your keys out of Git.** In the video the `.env` lines in each `.gitignore` are commented out. Make them active in your project (`.env`, `.env.*` and `!.env*.example`) so a real key never reaches GitHub.
- **Demo logins.** The seed creates an admin (`admin@staybnb.com`) and a cast of guests and hosts (`…@staybnb.test`); their local passwords are in `part-20-…/apps/api/scripts/import-mock.ts`. They're for your machine only: never seed a production database with them.
- **The 500 page** reuses the 404 page's artwork, so it needs the part 23 folder too.
- **Photos** in the demo data load from Unsplash, Pravatar and Picsum, under their own terms.

## Want the finished code?

- **Full source, $49.99 one-time:** the finished monorepo, ready to deploy — https://buymeacoffee.com/reactbd/e/548868
- **Done-for-you launch, $399:** Staybnb set up and live on your domain — https://buymeacoffee.com/reactbd/e/558771
- **A custom marketplace, from $999:** https://www.reactbd.com/contact

## License

Free for learning and for building your own projects, personal or commercial. Please don't resell or re-publish the kit as a template or course of your own. See [LICENSE](LICENSE).

Made by [ReactBD](https://reactbd.com) · [YouTube](https://www.youtube.com/@reactjsbd) · [Medium](https://medium.com/@reactbd) · reactjsbd@gmail.com

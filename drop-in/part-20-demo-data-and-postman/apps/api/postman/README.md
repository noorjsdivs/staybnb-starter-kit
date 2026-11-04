# Staybnb API — Postman Collection

This folder contains an auto-generated Postman v2.1 collection covering **every** endpoint in [server.ts](../server.ts) — currently **140 endpoints across 31 folders**.

## Files

| File | Purpose |
|------|---------|
| `Staybnb-API.postman_collection.json` | The collection. Import this into Postman. |
| `Staybnb-Local.postman_environment.json` | Environment pointing at `http://localhost:8000`. |
| `Staybnb-Production.postman_environment.json` | Environment pointing at `https://api.staybnb.reactbd.com`. |

## Importing into Postman

1. Open Postman → **File → Import** (or drag-and-drop).
2. Drop both the collection JSON *and* one of the environment JSONs.
3. In the top-right environment picker, select **Staybnb — Local** or **Staybnb — Production**.
4. Open `01 — Auth → Login`, fill in the body, hit **Send**. The test script auto-saves the JWT into the `token` environment variable so every protected request just works.

## Environment Variables

The collection uses these placeholders — fill them via the environment editor or via test scripts on prior requests:

| Variable | Description |
|----------|-------------|
| `baseUrl` | API server origin (no trailing slash). |
| `token` | Bearer token. Auto-set on Login/Register/OAuth. |
| `userId` | Logged-in user id. Auto-set on Login/Register/OAuth. |
| `listingId` | Used in booking, review, wishlist, report bodies. |
| `bookingId` | Used in payment intent / review creation. |
| `blogCategoryId` | Used when creating admin blog posts. |
| `resetToken` | Token from `Forgot Password` email, used by `Reset Password`. |

## Authentication

* **Bearer JWT** — `Authorization: Bearer <token>` (issued by `/api/auth/login`, `/api/auth/register`, `/api/auth/oauth`).
* **Admin endpoints** (`/api/admin/*`) require `role === "admin"` on the authenticated user.
* **Host endpoints** require `role` in `host`, `superhost`, or `admin`.

## Folder Layout

| # | Folder | Notes |
|---|--------|-------|
| 00 | Health & Docs | Root, `/health`, Swagger JSON |
| 01 | Auth | Register / Login / OAuth / Reset |
| 02 | Addresses | User CRUD + Admin list |
| 03 | Account Settings | Profile / Security / Notifications / Password |
| 04 | Listings | Browse / Featured / Destinations / CRUD |
| 05 | Property Categories | Public read |
| 06 | Amenities | Public read |
| 07 | Bookings | Guest + Host flows |
| 08 | Payments | Methods, Intent, Capture, Webhook |
| 09 | Wallet | Balance, transactions, deposit, withdraw |
| 10 | Reviews | Public read + author actions |
| 11 | Wishlist | List + toggle |
| 12 | Hosting Application | My application + upsert |
| 13 | Search History | List / add / clear |
| 14 | Banners | Public read |
| 15 | Newsletter | Subscribe / Unsubscribe |
| 16 | Notifications | List / read / delete |
| 17 | Chat | Conversations + messages |
| 18 | Blogs | Public + admin CRUD |
| 19 | Currency | Exchange rates |
| 20 | Reports | File a listing report |
| 21 | Uploads | Single / many / delete (ImageKit + Cloudinary) |
| 22 | Admin | Stats, DB overview, global search, all admin CRUD subfolders |

## Regenerating

Whenever routes change, regenerate the collection:

```bash
pnpm postman:generate
```

The script (`scripts/generate-postman.ts`) reads the endpoint catalog at the top of the file, so to add a new endpoint just add an entry to the relevant folder and re-run.

## Tips for Testing

* **Stripe webhook**: Don't send from Postman. Use `pnpm run webhook` to forward Stripe events to your local server.
* **File uploads**: For `21 — Uploads`, click the `file` field in Postman's form-data row and pick an image; the request will become `multipart/form-data` automatically.
* **Path params**: Variables appear under the request's **Path Variables** tab (e.g. `:id`). Fill them per-request or via the environment.
* **Sanity check**: First-time setup — Health Check → Register → Login → My Profile → List Listings. If these four pass, the rest of the surface is wired up.

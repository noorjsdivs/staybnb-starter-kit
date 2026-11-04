/**
 * Generate a Postman v2.1 collection + environment for the Staybnb API.
 * Run with:  pnpm tsx scripts/generate-postman.ts
 * Outputs to: postman/Staybnb-API.postman_collection.json
 *             postman/Staybnb-Local.postman_environment.json
 *             postman/Staybnb-Production.postman_environment.json
 */

import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "postman");
mkdirSync(OUT_DIR, { recursive: true });

type Method =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

type Body =
  | { mode: "raw"; raw: string; language?: "json" | "text" }
  | { mode: "formdata"; formdata: Array<{ key: string; type: "text" | "file"; value?: string; src?: string }> }
  | { mode: "urlencoded"; urlencoded: Array<{ key: string; value: string }> };

interface Endpoint {
  name: string;
  method: Method;
  path: string;              // e.g. /api/auth/login  (use :param placeholders)
  description?: string;
  auth?: "none" | "bearer";
  query?: Record<string, string>;
  body?: Body;
  examples?: string;
}

interface Folder {
  name: string;
  description?: string;
  items: Endpoint[];
}

const json = (obj: unknown) => JSON.stringify(obj, null, 2);

const folders: Folder[] = [
  // ============================================================
  // AUTH
  // ============================================================
  {
    name: "01 — Auth",
    description: "Registration, login, OAuth, password reset",
    items: [
      {
        name: "Register",
        method: "POST",
        path: "/api/auth/register",
        auth: "none",
        body: { mode: "raw", language: "json", raw: json({ name: "Jane Doe", email: "jane@example.com", password: "Password123!" }) },
      },
      {
        name: "Login",
        method: "POST",
        path: "/api/auth/login",
        auth: "none",
        body: { mode: "raw", language: "json", raw: json({ email: "jane@example.com", password: "Password123!" }) },
        description: "On success this test script auto-saves `token` to the environment.",
      },
      {
        name: "Get Profile",
        method: "GET",
        path: "/api/auth/profile",
        auth: "bearer",
      },
      {
        name: "Logout",
        method: "POST",
        path: "/api/auth/logout",
        auth: "bearer",
      },
      {
        name: "OAuth (Google/Github/Apple/Facebook)",
        method: "POST",
        path: "/api/auth/oauth",
        auth: "none",
        body: { mode: "raw", language: "json", raw: json({ name: "Jane", email: "jane@example.com", authProvider: "google", authUid: "uid_123", isOAuthUser: true, avatar: "https://lh3.googleusercontent.com/a/x" }) },
      },
      {
        name: "Set Password (OAuth user)",
        method: "POST",
        path: "/api/auth/set-password",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({ password: "NewPassword123!" }) },
      },
      {
        name: "Forgot Password",
        method: "POST",
        path: "/api/auth/forgot-password",
        auth: "none",
        body: { mode: "raw", language: "json", raw: json({ email: "jane@example.com" }) },
      },
      {
        name: "Reset Password",
        method: "POST",
        path: "/api/auth/reset-password",
        auth: "none",
        body: { mode: "raw", language: "json", raw: json({ token: "{{resetToken}}", password: "Password123!" }) },
      },
      {
        name: "Verify OTP",
        method: "POST",
        path: "/api/auth/verify-otp",
        auth: "none",
        body: { mode: "raw", language: "json", raw: json({ otp: "123456" }) },
      },
    ],
  },

  // ============================================================
  // ADDRESSES
  // ============================================================
  {
    name: "02 — Addresses",
    items: [
      { name: "My Addresses", method: "GET", path: "/api/addresses/me", auth: "bearer" },
      {
        name: "Create Address",
        method: "POST",
        path: "/api/addresses",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({ label: "Home", firstName: "Jane", lastName: "Doe", phone: "+15555550101", email: "jane@example.com", line1: "123 Main St", line2: "Apt 4B", city: "Brooklyn", state: "NY", country: "USA", zipCode: "11201", isDefault: true }) },
      },
      {
        name: "Update Address",
        method: "PUT",
        path: "/api/addresses/:id",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({ label: "Office", line2: "Suite 200" }) },
      },
      { name: "Delete Address", method: "DELETE", path: "/api/addresses/:id", auth: "bearer" },
      { name: "Set Default Address", method: "POST", path: "/api/addresses/:id/default", auth: "bearer" },
      { name: "Admin — All Addresses", method: "GET", path: "/api/addresses", auth: "bearer", query: { page: "1", limit: "20", search: "" } },
      { name: "Get Addresses by User", method: "GET", path: "/api/addresses/user/:userId", auth: "bearer" },
    ],
  },

  // ============================================================
  // ACCOUNT SETTINGS
  // ============================================================
  {
    name: "03 — Account Settings",
    items: [
      { name: "Get Account Settings", method: "GET", path: "/api/account-settings", auth: "bearer" },
      { name: "Update Profile", method: "PUT", path: "/api/account-settings/profile", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ name: "Jane Doe", phone: "+15555550101", location: "NYC", bio: "Travel enthusiast" }) } },
      { name: "Update Security", method: "PUT", path: "/api/account-settings/security", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ twoFactorEnabled: false, loginSessions: [], allowedIps: [] }) } },
      { name: "Update Notifications", method: "PUT", path: "/api/account-settings/notifications", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ emailNotifications: true, pushNotifications: true, inAppNotifications: true }) } },
      { name: "Verify Password", method: "POST", path: "/api/account-settings/verify-password", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ password: "Password123!" }) } },
      { name: "Update Password", method: "PUT", path: "/api/account-settings/password", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ oldPassword: "Password123!", newPassword: "NewPassword456!" }) } },
    ],
  },

  // ============================================================
  // LISTINGS
  // ============================================================
  {
    name: "04 — Listings",
    items: [
      { name: "List Featured", method: "GET", path: "/api/listings/featured", auth: "none", query: { page: "1", limit: "12" } },
      { name: "Top Destinations", method: "GET", path: "/api/listings/destinations", auth: "none" },
      { name: "My Listings", method: "GET", path: "/api/listings/me", auth: "bearer", query: { page: "1", limit: "20" } },
      {
        name: "Create Listing",
        method: "POST",
        path: "/api/listings",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({
          title: "Cozy Loft in Brooklyn",
          summary: "Charming loft minutes from downtown",
          description: "Full description of the property...",
          type: "loft",
          category: "loft",
          city: "Brooklyn",
          country: "USA",
          state: "NY",
          addressLine: "123 Atlantic Ave",
          zipCode: "11201",
          latitude: 40.6892,
          longitude: -73.9999,
          bedrooms: 1, beds: 1, bathrooms: 1, maxGuests: 2,
          basePrice: 120, cleaningFee: 20, serviceFee: 10, taxRate: 4, currency: "USD",
          minNights: 1, maxNights: 30,
          checkInTime: "15:00", checkOutTime: "11:00",
          cancellationPolicy: "Moderate", houseRules: "No smoking",
          instantBook: true,
          images: [{ url: "https://ik.imagekit.io/bf62vomqy/xstore/sample.jpg", isCover: true }],
          amenities: ["wifi", "kitchen"],
        }) },
      },
      {
        name: "Update Listing",
        method: "PUT",
        path: "/api/listings/:id",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({ title: "Updated title", basePrice: 135 }) },
      },
      { name: "Delete Listing", method: "DELETE", path: "/api/listings/:id", auth: "bearer" },
      {
        name: "Browse Listings",
        method: "GET",
        path: "/api/listings",
        auth: "none",
        query: { page: "1", limit: "12", where: "Brooklyn", country: "USA", category: "loft", type: "loft", minPrice: "50", maxPrice: "300", guests: "2", checkIn: "2026-12-10", checkOut: "2026-12-13", instantBook: "true", featured: "false", sort: "price_asc" },
      },
      { name: "Get Listing by slug or id", method: "GET", path: "/api/listings/:slugOrId", auth: "none" },
    ],
  },

  // ============================================================
  // PROPERTY CATEGORIES
  // ============================================================
  {
    name: "05 — Property Categories",
    items: [
      { name: "List Categories", method: "GET", path: "/api/property-categories", auth: "none" },
      { name: "Get Category by Slug", method: "GET", path: "/api/property-categories/:slug", auth: "none" },
    ],
  },

  // ============================================================
  // AMENITIES
  // ============================================================
  {
    name: "06 — Amenities",
    items: [
      { name: "Popular Amenities", method: "GET", path: "/api/amenities/popular", auth: "none" },
      { name: "All Amenities", method: "GET", path: "/api/amenities", auth: "none" },
    ],
  },

  // ============================================================
  // BOOKINGS
  // ============================================================
  {
    name: "07 — Bookings",
    items: [
      { name: "My Bookings (Guest)", method: "GET", path: "/api/bookings/me", auth: "bearer", query: { status: "" } },
      { name: "Host Bookings", method: "GET", path: "/api/bookings/host", auth: "bearer", query: { status: "" } },
      {
        name: "Create Booking",
        method: "POST",
        path: "/api/bookings",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({
          listingId: "{{listingId}}",
          checkIn: "2026-06-10",
          checkOut: "2026-06-14",
          adults: 2, children: 0, infants: 0, pets: 0,
          guestNote: "Looking forward to staying!",
        }) },
      },
      { name: "Get Booking by id", method: "GET", path: "/api/bookings/:id", auth: "bearer" },
      { name: "Cancellation Quote", method: "GET", path: "/api/bookings/:id/cancellation-quote", auth: "bearer" },
      { name: "Cancel Booking", method: "POST", path: "/api/bookings/:id/cancel", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ reason: "Plans changed" }) } },
      { name: "Host Accept", method: "POST", path: "/api/bookings/:id/accept", auth: "bearer" },
      { name: "Host Decline", method: "POST", path: "/api/bookings/:id/decline", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ reason: "Dates unavailable" }) } },
      { name: "Host Complete", method: "POST", path: "/api/bookings/:id/complete", auth: "bearer" },
    ],
  },

  // ============================================================
  // PAYMENTS
  // ============================================================
  {
    name: "08 — Payments",
    items: [
      { name: "Get Saved Payment Methods", method: "GET", path: "/api/payments/methods", auth: "bearer" },
      {
        name: "Add Payment Method",
        method: "POST",
        path: "/api/payments/methods",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({ kind: "card", brand: "visa", last4: "4242", expMonth: 12, expYear: 2030, holderName: "Jane Doe", isDefault: true }) },
      },
      { name: "Delete Payment Method", method: "DELETE", path: "/api/payments/methods/:id", auth: "bearer" },
      {
        name: "Create Payment Intent",
        method: "POST",
        path: "/api/payments/intent",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({ bookingId: "{{bookingId}}", method: "card" }) },
      },
      { name: "Capture Payment", method: "POST", path: "/api/payments/:id/capture", auth: "bearer" },
      {
        name: "Stripe Webhook (public)",
        method: "POST",
        path: "/api/payments/webhook",
        auth: "none",
        description: "Stripe signature-verified webhook. Stripe sends raw bytes; do not test directly from Postman.",
        body: { mode: "raw", language: "json", raw: json({ note: "Stripe webhook — do not invoke directly." }) },
      },
    ],
  },

  // ============================================================
  // WALLET
  // ============================================================
  {
    name: "09 — Wallet",
    items: [
      { name: "Get Wallet", method: "GET", path: "/api/wallet", auth: "bearer" },
      { name: "Transactions", method: "GET", path: "/api/wallet/transactions", auth: "bearer", query: { page: "1", limit: "20" } },
      { name: "Stripe Top-up", method: "POST", path: "/api/wallet/top-up", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ amount: 50, locale: "en", currency: "USD" }) } },
      { name: "Demo Deposit", method: "POST", path: "/api/wallet/deposit", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ amount: 100 }) } },
      { name: "Demo Withdraw", method: "POST", path: "/api/wallet/withdraw", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ amount: 25 }) } },
    ],
  },

  // ============================================================
  // REVIEWS
  // ============================================================
  {
    name: "10 — Reviews",
    items: [
      { name: "Listing Reviews", method: "GET", path: "/api/reviews/listing/:listingId", auth: "none" },
      { name: "Eligible Bookings to Review", method: "GET", path: "/api/reviews/eligible/:listingId", auth: "bearer" },
      {
        name: "Create Review",
        method: "POST",
        path: "/api/reviews",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({
          bookingId: "{{bookingId}}",
          ratingOverall: 5, ratingCleanliness: 5, ratingAccuracy: 5,
          ratingCheckIn: 5, ratingCommunication: 5, ratingLocation: 5, ratingValue: 4,
          title: "Wonderful stay",
          body: "Place was clean, host responsive, location great.",
        }) },
      },
      { name: "Reply to Review", method: "POST", path: "/api/reviews/:id/reply", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ reply_text: "Thanks for staying with us!" }) } },
      { name: "Toggle Review Like", method: "POST", path: "/api/reviews/:id/like", auth: "bearer" },
    ],
  },

  // ============================================================
  // WISHLIST
  // ============================================================
  {
    name: "11 — Wishlist",
    items: [
      { name: "My Wishlists", method: "GET", path: "/api/wishlist", auth: "bearer" },
      { name: "Toggle Wishlist Item", method: "POST", path: "/api/wishlist/toggle", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ listingId: "{{listingId}}" }) } },
    ],
  },

  // ============================================================
  // HOSTING APPLICATION
  // ============================================================
  {
    name: "12 — Hosting Application",
    items: [
      { name: "My Application", method: "GET", path: "/api/host/application", auth: "bearer" },
      {
        name: "Upsert Application",
        method: "POST",
        path: "/api/host/application",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({
          step: 2,
          payload: {
            yearsExperience: 3,
            previousListings: 1,
            certifications: ["Superhost-equivalent"],
            aboutYou: "I love hosting guests from around the world.",
            propertyType: "apartment",
          },
        }) },
      },
    ],
  },

  // ============================================================
  // SEARCH HISTORY
  // ============================================================
  {
    name: "13 — Search History",
    items: [
      { name: "List History", method: "GET", path: "/api/search-history", auth: "bearer" },
      {
        name: "Add Entry",
        method: "POST",
        path: "/api/search-history",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({
          query: "Brooklyn loft",
          where: "Brooklyn, NY",
          checkIn: "2026-06-10",
          checkOut: "2026-06-14",
          guests: { adults: 2, children: 0, infants: 0, pets: 0 },
          filters: { minPrice: 50, maxPrice: 300, instantBook: true },
        }) },
      },
      { name: "Clear History", method: "DELETE", path: "/api/search-history", auth: "bearer" },
    ],
  },

  // ============================================================
  // BANNERS
  // ============================================================
  {
    name: "14 — Banners",
    items: [
      { name: "List Banners", method: "GET", path: "/api/banners", auth: "none", query: { page: "home" } },
    ],
  },

  // ============================================================
  // NEWSLETTER
  // ============================================================
  {
    name: "15 — Newsletter",
    items: [
      { name: "Subscribe", method: "POST", path: "/api/newsletter", auth: "none", body: { mode: "raw", language: "json", raw: json({ email: "subscriber@example.com" }) } },
      { name: "Unsubscribe", method: "POST", path: "/api/newsletter/unsubscribe", auth: "none", body: { mode: "raw", language: "json", raw: json({ email: "subscriber@example.com" }) } },
    ],
  },

  // ============================================================
  // WAITLIST (apps/landing early access)
  // ============================================================
  {
    name: "15b — Waitlist",
    items: [
      {
        name: "Join waitlist",
        method: "POST",
        path: "/api/waitlist",
        auth: "none",
        body: {
          mode: "raw",
          language: "json",
          raw: json({
            name: "Alex Rivera",
            email: "alex@example.com",
            role: "guest",
            city: "Lisbon",
            message: "Looking for loft stays",
            source: "landing",
          }),
        },
      },
    ],
  },

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  {
    name: "16 — Notifications",
    items: [
      { name: "List", method: "GET", path: "/api/notifications", auth: "bearer", query: { page: "1", limit: "20" } },
      { name: "Mark All Read", method: "POST", path: "/api/notifications/read-all", auth: "bearer" },
      { name: "Mark One Read", method: "PATCH", path: "/api/notifications/:id/read", auth: "bearer" },
      { name: "Delete", method: "DELETE", path: "/api/notifications/:id", auth: "bearer" },
    ],
  },

  // ============================================================
  // CHAT
  // ============================================================
  {
    name: "17 — Chat",
    items: [
      { name: "List Conversations", method: "GET", path: "/api/chat/conversations", auth: "bearer", query: { page: "1", limit: "20" } },
      { name: "Open Conversation", method: "POST", path: "/api/chat/conversations", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ recipientId: "{{userId}}", listingId: "{{listingId}}" }) } },
      { name: "List Messages", method: "GET", path: "/api/chat/conversations/:id/messages", auth: "bearer", query: { page: "1", limit: "50" } },
      { name: "Send Message", method: "POST", path: "/api/chat/conversations/:id/messages", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ message: "Hi! Is the place available on these dates?" }) } },
    ],
  },

  // ============================================================
  // BLOGS
  // ============================================================
  {
    name: "18 — Blogs",
    items: [
      { name: "List Published", method: "GET", path: "/api/blogs", auth: "none", query: { page: "1", limit: "12", category: "", tag: "", search: "" } },
      { name: "Categories", method: "GET", path: "/api/blogs/categories/list", auth: "none" },
      { name: "Tags", method: "GET", path: "/api/blogs/tags/list", auth: "none" },
      { name: "Get by Slug", method: "GET", path: "/api/blogs/:slug", auth: "none" },
      // Admin
      { name: "Admin — List", method: "GET", path: "/api/blogs/admin", auth: "bearer", query: { page: "1", limit: "20" } },
      {
        name: "Admin — Create",
        method: "POST",
        path: "/api/blogs/admin",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({ title: "10 places to stay in NYC", excerpt: "Our editor's picks…", content: "<p>Long-form HTML content…</p>", categoryId: "{{blogCategoryId}}", tags: ["travel", "nyc"], featuredImage: "https://ik.imagekit.io/bf62vomqy/xstore/sample.jpg", isPublished: false }) },
      },
      { name: "Admin — Update", method: "PUT", path: "/api/blogs/admin/:id", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ title: "Updated title" }) } },
      { name: "Admin — Delete", method: "DELETE", path: "/api/blogs/admin/:id", auth: "bearer" },
      { name: "Admin — Toggle Published", method: "POST", path: "/api/blogs/admin/:id/toggle", auth: "bearer" },
      { name: "Admin — Create Category", method: "POST", path: "/api/blogs/admin/categories", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ name: "Travel", slug: "travel" }) } },
      { name: "Admin — Update Category", method: "PUT", path: "/api/blogs/admin/categories/:id", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ name: "Travel Tips" }) } },
      { name: "Admin — Delete Category", method: "DELETE", path: "/api/blogs/admin/categories/:id", auth: "bearer" },
      { name: "Admin — Create Tag", method: "POST", path: "/api/blogs/admin/tags", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ name: "Tips", slug: "tips" }) } },
      { name: "Admin — Delete Tag", method: "DELETE", path: "/api/blogs/admin/tags/:id", auth: "bearer" },
    ],
  },

  // ============================================================
  // CURRENCY
  // ============================================================
  {
    name: "19 — Currency",
    items: [{ name: "Exchange Rates", method: "GET", path: "/api/currency/rates", auth: "none" }],
  },

  // ============================================================
  // REPORTS
  // ============================================================
  {
    name: "20 — Reports",
    items: [
      {
        name: "Report a Listing",
        method: "POST",
        path: "/api/reports/listing",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({ listingId: "{{listingId}}", reason: "inaccurate_info", details: "Photos don't match the actual property." }) },
      },
    ],
  },

  // ============================================================
  // UPLOADS
  // ============================================================
  {
    name: "21 — Uploads",
    items: [
      {
        name: "Upload Single Image",
        method: "POST",
        path: "/api/uploads/image",
        auth: "bearer",
        body: { mode: "formdata", formdata: [
          { key: "file", type: "file" },
          { key: "folder", type: "text", value: "listings" },
        ] },
        description: "Send 'file' as a single image (jpg/png/webp). Optional 'folder' field controls the subdirectory.",
      },
      {
        name: "Upload Many Images",
        method: "POST",
        path: "/api/uploads/images",
        auth: "bearer",
        body: { mode: "formdata", formdata: [
          { key: "files", type: "file" },
          { key: "files", type: "file" },
          { key: "folder", type: "text", value: "listings" },
        ] },
        description: "Upload up to 12 files in a single request. Use the same 'files' key multiple times.",
      },
      {
        name: "Delete Upload",
        method: "DELETE",
        path: "/api/uploads",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({ provider: "imagekit", providerRef: "file_xyz" }) },
      },
    ],
  },

  // ============================================================
  // ADMIN
  // ============================================================
  {
    name: "22 — Admin / Stats",
    items: [
      { name: "Stats", method: "GET", path: "/api/admin/stats", auth: "bearer" },
      { name: "System DB Overview", method: "GET", path: "/api/admin/system/database", auth: "bearer" },
      { name: "Global Search", method: "GET", path: "/api/admin/search", auth: "bearer", query: { q: "brooklyn", type: "" } },
    ],
  },
  {
    name: "22a — Admin / Listings",
    items: [
      { name: "List", method: "GET", path: "/api/admin/listings", auth: "bearer", query: { page: "1", limit: "20", search: "", status: "" } },
      { name: "Get One", method: "GET", path: "/api/admin/listings/:id", auth: "bearer" },
      {
        name: "Create",
        method: "POST",
        path: "/api/admin/listings",
        auth: "bearer",
        body: { mode: "raw", language: "json", raw: json({ title: "Admin Created Listing", type: "apartment", city: "London", country: "UK", basePrice: 200, maxGuests: 4 }) },
      },
      { name: "Duplicate", method: "POST", path: "/api/admin/listings/:id/duplicate", auth: "bearer" },
      { name: "Patch (status)", method: "PATCH", path: "/api/admin/listings/:id", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ status: "published" }) } },
      { name: "Full Update", method: "PUT", path: "/api/admin/listings/:id", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ title: "Renamed", basePrice: 150 }) } },
      { name: "Delete", method: "DELETE", path: "/api/admin/listings/:id", auth: "bearer" },
      { name: "Add Image", method: "POST", path: "/api/admin/listings/:id/images", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ url: "https://ik.imagekit.io/...", alt: "Living room", order: 0 }) } },
      { name: "Update Image", method: "PATCH", path: "/api/admin/listings/:id/images/:imageId", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ alt: "Updated alt", order: 2 }) } },
      { name: "Delete Image", method: "DELETE", path: "/api/admin/listings/:id/images/:imageId", auth: "bearer" },
    ],
  },
  {
    name: "22b — Admin / Bookings",
    items: [
      { name: "List", method: "GET", path: "/api/admin/bookings", auth: "bearer", query: { page: "1", limit: "20" } },
      { name: "Get One", method: "GET", path: "/api/admin/bookings/:id", auth: "bearer" },
      { name: "Update", method: "PATCH", path: "/api/admin/bookings/:id", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ status: "confirmed", hostNote: "Approved" }) } },
    ],
  },
  {
    name: "22c — Admin / Users",
    items: [
      { name: "List", method: "GET", path: "/api/admin/users", auth: "bearer", query: { page: "1", limit: "20", search: "" } },
      { name: "Get One", method: "GET", path: "/api/admin/users/:id", auth: "bearer" },
      { name: "Create", method: "POST", path: "/api/admin/users", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ name: "Admin Created", email: "newuser@example.com", password: "Password123!", role: "host" }) } },
      { name: "Update", method: "PATCH", path: "/api/admin/users/:id", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ role: "superhost", isHostVerified: true }) } },
      { name: "Delete", method: "DELETE", path: "/api/admin/users/:id", auth: "bearer" },
    ],
  },
  {
    name: "22d — Admin / Reviews",
    items: [
      { name: "List", method: "GET", path: "/api/admin/reviews", auth: "bearer", query: { page: "1", limit: "20" } },
      { name: "Moderate", method: "PATCH", path: "/api/admin/reviews/:id", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ isPublished: false }) } },
      { name: "Delete", method: "DELETE", path: "/api/admin/reviews/:id", auth: "bearer" },
    ],
  },
  {
    name: "22e — Admin / Categories",
    items: [
      { name: "List", method: "GET", path: "/api/admin/property-categories", auth: "bearer" },
      { name: "Create", method: "POST", path: "/api/admin/property-categories", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ name: "Beachfront", slug: "beachfront", icon: "🏖️", description: "Properties on the beach" }) } },
      { name: "Update", method: "PUT", path: "/api/admin/property-categories/:id", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ name: "Tropical Beachfront" }) } },
      { name: "Delete", method: "DELETE", path: "/api/admin/property-categories/:id", auth: "bearer" },
    ],
  },
  {
    name: "22f — Admin / Amenities",
    items: [
      { name: "List", method: "GET", path: "/api/admin/amenities", auth: "bearer" },
      { name: "Create", method: "POST", path: "/api/admin/amenities", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ label: "WiFi", slug: "wifi", group: "internet_office", isPopular: true }) } },
      { name: "Update", method: "PUT", path: "/api/admin/amenities/:id", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ label: "Fast WiFi" }) } },
      { name: "Delete", method: "DELETE", path: "/api/admin/amenities/:id", auth: "bearer" },
    ],
  },
  {
    name: "22g — Admin / Banners",
    items: [
      { name: "List", method: "GET", path: "/api/admin/banners", auth: "bearer" },
      { name: "Create", method: "POST", path: "/api/admin/banners", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ title: "Summer Sale", imageUrl: "https://ik.imagekit.io/bf62vomqy/xstore/sample.jpg", ctaUrl: "/sale", page: "home", isActive: true, position: 1 }) } },
      { name: "Update", method: "PUT", path: "/api/admin/banners/:id", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ isActive: false }) } },
      { name: "Delete", method: "DELETE", path: "/api/admin/banners/:id", auth: "bearer" },
    ],
  },
  {
    name: "22h — Admin / Hosting Applications",
    items: [
      { name: "List", method: "GET", path: "/api/admin/hosting-applications", auth: "bearer" },
      { name: "Get One", method: "GET", path: "/api/admin/hosting-applications/:id", auth: "bearer" },
      { name: "Update", method: "PATCH", path: "/api/admin/hosting-applications/:id", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ decisionNote: "Awaiting docs" }) } },
      { name: "Decide", method: "PATCH", path: "/api/admin/hosting-applications/:id/decide", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ decision: "approved", reason: "All checks passed" }) } },
      { name: "Delete", method: "DELETE", path: "/api/admin/hosting-applications/:id", auth: "bearer" },
    ],
  },
  {
    name: "22i — Admin / Support Chat",
    items: [
      { name: "List Conversations", method: "GET", path: "/api/admin/chat/conversations", auth: "bearer" },
      { name: "List Messages", method: "GET", path: "/api/admin/chat/conversations/:id/messages", auth: "bearer" },
      { name: "Reply as Support", method: "POST", path: "/api/admin/chat/conversations/:id/messages", auth: "bearer", body: { mode: "raw", language: "json", raw: json({ body: "Hi — Staybnb support here. How can we help?" }) } },
    ],
  },

  // ============================================================
  // META
  // ============================================================
  {
    name: "00 — Health & Docs",
    items: [
      { name: "Root", method: "GET", path: "/", auth: "none" },
      { name: "Health Check", method: "GET", path: "/health", auth: "none" },
      { name: "Swagger JSON", method: "GET", path: "/api/docs.json", auth: "none" },
      { name: "Swagger UI Info", method: "GET", path: "/api/docs/info", auth: "none" },
    ],
  },
];

// =============================================================================
// Postman v2.1 collection builder
// =============================================================================

const splitPath = (full: string) => {
  // /api/listings/:id  →  ["api", "listings", ":id"]
  const clean = full.startsWith("/") ? full.slice(1) : full;
  if (clean === "") return [""];
  return clean.split("/");
};

const buildRequestItem = (e: Endpoint) => {
  const pathSegments = splitPath(e.path);
  const variables = pathSegments
    .filter((s) => s.startsWith(":"))
    .map((s) => ({ key: s.slice(1), value: "" }));

  const url: Record<string, unknown> = {
    raw: `{{baseUrl}}${e.path}` + (e.query ? `?${Object.entries(e.query).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")}` : ""),
    host: ["{{baseUrl}}"],
    path: pathSegments,
  };
  if (e.query) {
    url.query = Object.entries(e.query).map(([k, v]) => ({ key: k, value: v }));
  }
  if (variables.length) url.variable = variables;

  const headers: Array<{ key: string; value: string; type?: string }> = [];
  if (e.body && e.body.mode === "raw") {
    headers.push({ key: "Content-Type", value: "application/json" });
  }

  const request: Record<string, unknown> = {
    method: e.method,
    header: headers,
    url,
  };

  if (e.auth === "bearer") {
    request.auth = {
      type: "bearer",
      bearer: [{ key: "token", value: "{{token}}", type: "string" }],
    };
  } else if (e.auth === "none") {
    request.auth = { type: "noauth" };
  }

  if (e.body) {
    if (e.body.mode === "raw") {
      request.body = {
        mode: "raw",
        raw: e.body.raw,
        options: { raw: { language: e.body.language || "json" } },
      };
    } else if (e.body.mode === "formdata") {
      request.body = { mode: "formdata", formdata: e.body.formdata };
    } else if (e.body.mode === "urlencoded") {
      request.body = { mode: "urlencoded", urlencoded: e.body.urlencoded };
    }
  }

  if (e.description) request.description = e.description;

  // Special: Login request auto-saves token via test script
  const events: Array<{ listen: string; script: { type: string; exec: string[] } }> = [];
  if (e.name === "Login" || e.name === "Register" || e.name === "OAuth (Google/Github/Apple/Facebook)") {
    events.push({
      listen: "test",
      script: {
        type: "text/javascript",
        exec: [
          "try {",
          "  const json = pm.response.json();",
          "  if (json && json.token) {",
          "    pm.environment.set('token', json.token);",
          "    if (json._id) pm.environment.set('userId', json._id);",
          "    console.log('Saved token to environment');",
          "  }",
          "} catch (e) { /* not JSON */ }",
        ],
      },
    });
  }

  return {
    name: e.name,
    request,
    response: [],
    ...(events.length ? { event: events } : {}),
  };
};

const collection = {
  info: {
    _postman_id: crypto.randomUUID(),
    name: "Staybnb API",
    description:
      "Auto-generated Postman collection for the Staybnb Express API.\n\n" +
      "Set the `baseUrl` environment variable to your server (default `http://localhost:8000`).\n" +
      "After running the Login request, the `token` variable is populated automatically.\n\n" +
      "Generated by `scripts/generate-postman.ts`.",
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:8000" },
    { key: "token", value: "" },
    { key: "userId", value: "" },
    { key: "listingId", value: "" },
    { key: "bookingId", value: "" },
    { key: "blogCategoryId", value: "" },
    { key: "resetToken", value: "" },
  ],
  auth: { type: "bearer", bearer: [{ key: "token", value: "{{token}}", type: "string" }] },
  item: folders
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((f) => ({
      name: f.name,
      ...(f.description ? { description: f.description } : {}),
      item: f.items.map(buildRequestItem),
    })),
};

writeFileSync(
  path.join(OUT_DIR, "Staybnb-API.postman_collection.json"),
  JSON.stringify(collection, null, 2),
);

const buildEnv = (name: string, baseUrl: string) => ({
  id: crypto.randomUUID(),
  name,
  values: [
    { key: "baseUrl", value: baseUrl, enabled: true },
    { key: "token", value: "", enabled: true },
    { key: "userId", value: "", enabled: true },
    { key: "listingId", value: "", enabled: true },
    { key: "bookingId", value: "", enabled: true },
    { key: "blogCategoryId", value: "", enabled: true },
    { key: "resetToken", value: "", enabled: true },
  ],
  _postman_variable_scope: "environment",
});

writeFileSync(
  path.join(OUT_DIR, "Staybnb-Local.postman_environment.json"),
  JSON.stringify(buildEnv("Staybnb — Local", "http://localhost:8000"), null, 2),
);
writeFileSync(
  path.join(OUT_DIR, "Staybnb-Production.postman_environment.json"),
  JSON.stringify(
    buildEnv("Staybnb — Production", "https://api.your-domain.com"),
    null,
    2,
  ),
);

const totalEndpoints = folders.reduce((acc, f) => acc + f.items.length, 0);
console.log(`✓ Wrote collection with ${folders.length} folders, ${totalEndpoints} endpoints`);
console.log(`  ${path.relative(ROOT, path.join(OUT_DIR, "Staybnb-API.postman_collection.json"))}`);
console.log(`  ${path.relative(ROOT, path.join(OUT_DIR, "Staybnb-Local.postman_environment.json"))}`);
console.log(`  ${path.relative(ROOT, path.join(OUT_DIR, "Staybnb-Production.postman_environment.json"))}`);

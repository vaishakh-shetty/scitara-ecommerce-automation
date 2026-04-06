# ShopEase — E-Commerce Demo with Full Automation Coverage

E-Commerce application built with React + TypeScript, backed by a full automation suite covering API, E2E, and Load layers.

---

## Design Decisions

**React + TypeScript** — Strict typing catches wrong field names or missing properties at compile time, not in production. `Product`, `CartItem`, and `CustomerDetails` are all typed interfaces.

**Vite over CRA** — Dev server starts in milliseconds using native ESM. Faster feedback loop, leaner production builds.

**Tailwind CSS** — Utility-first CSS keeps styles co-located with markup. No dead CSS, no naming conflicts.

**json-server** — Spins up a real REST API from a single `db.json` file. Testable at the HTTP layer without any backend code. The test suite can move to a real API with zero changes to test code.

**Playwright over Cypress** — Built-in `request` context lets us test the API layer and UI layer in the same tool and the same report. Native cross-browser support (Chromium, Firefox, WebKit) with no paid tier needed.

**Page Object Model (POM)** — Selectors live in one place. If `data-testid="cart-total"` changes, you update `CartPage.ts` — not 10 files. Tests read like plain English:
```typescript
await listing.search('headphones')
await listing.addToCartById(1)
await cart.proceedToCheckout()
```

**API Test Layer** — Bugs found at the API layer cost a fraction of what they cost found in E2E. API tests pinpoint the exact endpoint and payload; E2E tests only tell you something broke.

**Cross-Layer Tests** — Validates that what the API returns and what the UI displays are always in sync. Neither a unit test nor a pure E2E test would catch a silent price mismatch between backend and frontend.

**k6 for Load Testing** — Plain JavaScript scripts, versionable, CI-friendly. Native threshold support (`p(95)<500ms`) so the pipeline fails automatically if performance degrades.

**`data-testid` selectors** — Added only where elements are dynamic, repeated, or ambiguous. For semantic elements (labelled fields, unique buttons, nav links) we use Playwright role/label locators — which also serve as an implicit accessibility check.

---

## Project Overview

| Layer | Tool | Purpose |
|---|---|---|
| UI | React 18 + TypeScript + Tailwind + Vite | E-Commerce frontend |
| Mock API | json-server | Simulates real REST API |
| API Tests | Playwright `request` | Catch data issues before the browser |
| E2E Tests | Playwright + POM | Full user journey automation |
| Load Tests | k6 | Performance validation under load |
| CI/CD | GitHub Actions | Automated pipeline on every push |
| Code Quality | ESLint + Prettier | Consistent, maintainable code |

---

## Application Pages

| Page | Route | Features |
|---|---|---|
| Product Listing | `/` | Search, category filter, sort, add to cart — routed to `/` since this is a single-purpose SPA with no separate marketing homepage; the catalogue is the entry point |
| Product Details | `/product/:id` | Full details, qty selector, add to cart |
| Cart | `/cart` | Update qty, remove items, total price |
| Checkout | `/checkout` | Form with validation, order summary |
| Order Success | `/order-success` | Order ID, total, confirmation message |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- k6 (for load tests) — [install guide](https://k6.io/docs/getting-started/installation/)

### Install

```bash
npm install
npx playwright install
```

### Run the Application

```bash
npm run dev
```

Starts both:
- React app → `http://localhost:5173`
- API server → `http://localhost:3001`

---

## Running Tests

### Run Everything
```bash
npm run test:all
```

### By Page / Feature
```bash
npm run test:listing       # Product Listing          (@listing)
npm run test:details       # Product Details          (@details)
npm run test:cart          # Cart                     (@cart)
npm run test:checkout      # Checkout + Order Success  (@checkout)
npm run test:e2e-flows     # Full purchase flows       (@e2e)
npm run test:cross-layer   # API ↔ UI consistency      (@cross-layer)
npm run test:api           # API layer only            (@api)
npm run test:negative      # All negative/edge cases   (@negative)
```

### By Browser
```bash
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Other Options
```bash
npm run test:e2e           # All specs in tests/specs/
npm run test:headed        # Run with visible browser (demo mode)
npx playwright show-report # Open last HTML report
```

### Playwright CLI
```bash
# Single spec file
npx playwright test tests/specs/cart.spec.ts

# Single test by TC ID
npx playwright test --grep "CT-09"

# Tag + browser combination
npx playwright test --grep @negative --project=firefox

# Interactive UI mode
npx playwright test --ui
```

---

## Load Tests (k6)

> Start the API server first: `npm run server`

| Test | Command | VUs | Purpose |
|---|---|---|---|
| Smoke | `npm run load:smoke` | 2 × 1 min | Zero-error baseline |
| Load | `npm run load:load` | Ramp to 50 | Realistic concurrency |
| Stress | `npm run load:stress` | Ramp to 200 | Find breaking point |
| Spike | `npm run load:spike` | Burst to 300 | Flash sale simulation |

---

## Test Case Coverage

**Total: 144 tests** across 9 spec files.

### Product Listing — `@listing` (31 tests)

| TC ID | Scenario | Expected Result | Type |
|---|---|---|---|
| PL-01 | Page title contains ShopEase | Title matches `/ShopEase/` | Functional |
| PL-02 | Heading "All Products" is visible | Heading visible | UI |
| PL-03 | All 20 products are loaded | Count = 20 | Functional |
| PL-04 | Product grid is visible | `product-grid` visible | UI |
| PL-05 | Each product card shows name, price, add-to-cart | All 3 elements visible | UI |
| PL-06 | Product price is correctly displayed | Price = $299.99 | Functional |
| PL-07 | Search by name filters products | Count > 0 and < 20 | Functional |
| PL-07a | Search result contains the searched product | Correct card visible | Functional |
| PL-07b | Search with no match shows empty state | `empty-state` visible | Edge |
| PL-07c | Clearing search restores all products | Count = 20 | Functional |
| PL-07d | Search is case-insensitive | Count > 0 | Edge |
| PL-08a | Filtering by Electronics shows 5 products | Count = 5 | Functional |
| PL-08b | Filtering by Clothing shows 5 products | Count = 5 | Functional |
| PL-08c | Filtering by Books shows 5 products | Count = 5 | Functional |
| PL-08d | Filtering by Home & Kitchen shows 5 products | Count = 5 | Functional |
| PL-08e | Selecting "All" restores all products | Count = 20 | Functional |
| PL-09 | Sort by price ascending | Each price ≥ previous | Functional |
| PL-09a | Sort by price descending | Each price ≤ previous | Functional |
| PL-10 | Adding product increments cart badge | Badge = before + 1 | Functional |
| PL-10a | Adding same product twice increments badge to 2 | Badge = 2 | Edge |
| PL-10b | Adding different products increments badge correctly | Badge = 2 | Functional |
| PL-10c | Toast notification appears after adding to cart | `toast` visible | UI |
| PL-11 | API failure shows error state | `error-state` visible | Negative |
| PL-12 | Slow API response shows loading skeleton | `loading-state` → `product-grid` | Edge |
| PL-13 | Clicking product card navigates to detail page | URL matches `/product/:id` | Functional |
| PL-N01 | API returns empty array shows empty state | `empty-state` visible, no error | Negative |
| PL-N02 | API returns products with missing fields renders without crash | Grid renders, count = 20 | Negative |
| PL-N03 | API returns extra product does not crash grid | Count = 21, no error | Edge |
| PL-N04 | Rapid search input does not crash the page | Root visible, no error | Edge |
| PL-N05 | API network failure shows error state | `error-state` visible | Negative |
| PL-N06 | Invalid category injected via DOM shows empty state | `empty-state` visible, no crash | Negative |

---

### Product Details — `@details` (24 tests)

| TC ID | Scenario | Expected Result | Type |
|---|---|---|---|
| PD-01 | Product name is displayed | Name = "Wireless Noise-Cancelling Headphones" | UI |
| PD-02 | Product price is correct | Price = 299.99 | Functional |
| PD-03 | Product image is visible | `product-image` visible | UI |
| PD-04 | Star rating is visible | `star-rating` visible | UI |
| PD-05 | Product category badge is visible | "Electronics" text visible | UI |
| PD-06 | Product description is visible | Description paragraph visible | UI |
| PD-07 | Default quantity is 1 | Qty = 1 | Functional |
| PD-07a | Increasing quantity works | Qty = 3 after +2 | Functional |
| PD-07b | Decreasing quantity works | Qty = 3 after +3 then -1 | Functional |
| PD-07c | Quantity cannot go below 1 | Qty = 1 after -5 | Edge |
| PD-08 | Large quantity (20) is handled correctly | Qty = 20, badge = 20 | Edge |
| PD-09 | Adding product updates cart badge to 1 | Badge = 1 | Functional |
| PD-09a | Adding qty 3 updates cart badge to 3 | Badge = 3 | Functional |
| PD-09b | Toast appears after adding to cart | `toast` visible | UI |
| PD-10 | Back button returns to product listing | URL = `/` | Functional |
| PD-11 | Direct URL navigation to product works | Correct product name shown | Functional |
| PD-11a | Navigating from listing to detail shows correct product | Correct product name shown | Functional |
| PD-12 | Invalid product ID shows error state | `error-state` visible | Negative |
| PD-N01 | Missing description field renders page without crash | Name, price, button visible | Negative |
| PD-N02 | Broken product image does not crash the page | Name and button still visible | Edge |
| PD-N03 | UI enforces minimum quantity of 1 via repeated decrease | Qty = 1 after -10 | Security |
| PD-N04 | UI prevents negative quantity — cart receives exactly 1 item | Qty ≥ 1, badge = 1 | Security |
| PD-N05 | Extremely large quantity (50) keeps UI stable | Qty = 50, badge = 50 | Edge |
| PD-N06 | Slow product API shows loading state before content | `loading-state` → product visible | Edge |

---

### Cart — `@cart` (24 tests)

| TC ID | Scenario | Expected Result | Type |
|---|---|---|---|
| CT-01 | Empty cart message shown when no items added | `empty-cart` visible | Functional |
| CT-02 | Empty cart has Continue Shopping link | URL = `/` after click | Functional |
| CT-03 | Added item appears in cart | `cart-item-{id}` visible | Functional |
| CT-04 | Item count reflects number of items | Count = 1 | Functional |
| CT-05 | Item quantity defaults to 1 | Qty = 1 | Functional |
| CT-06 | Subtotal equals price × quantity | Subtotal ≈ $299.99 | Functional |
| CT-07 | Cart total equals sum of item subtotals | Total ≈ $299.99 | Functional |
| CT-08 | Increasing quantity updates qty value | Qty = 2 | Functional |
| CT-08a | Increasing quantity updates subtotal | Subtotal ≈ $599.98 | Functional |
| CT-08b | Increasing quantity updates cart total | Total ≈ $599.98 | Functional |
| CT-08c | Decreasing quantity updates qty value | Qty = 1 | Functional |
| CT-09 | Decreasing qty to 0 removes item | `empty-cart` visible | Edge |
| CT-10 | Remove item button removes the item | Item not visible | Functional |
| CT-10a | Removing last item shows empty cart state | `empty-cart` visible | Functional |
| CT-11 | Multiple products appear in cart | Both items visible | Functional |
| CT-11a | Total is sum of all item subtotals | Total ≈ electronics + book | Functional |
| CT-11b | Removing one product updates total correctly | Total ≈ book price only | Functional |
| CT-12 | Checkout button navigates to checkout page | URL = `/checkout` | Functional |
| CT-13 | Large cart with all 20 products remains stable | Count = 20, total > 0 | Edge |
| CT-N01 | Price mismatch between API and cart is detectable | Listing price ≠ cart subtotal | Integration |
| CT-N02 | Cart state persists after full page refresh | Item visible after reload | Edge |
| CT-N03 | Rapid quantity increase clicks produce correct count | Qty = 6 after 5 rapid clicks | Edge |
| CT-N05 | Corrupted sessionStorage cart handled gracefully | Empty cart shown, no crash | Security |
| CT-N06 | Cart total with many items shows valid number | Finite, positive, formatted as $X.XX | Edge |

---

### Checkout + Order Success — `@checkout` (22 tests)

| TC ID | Scenario | Expected Result | Type |
|---|---|---|---|
| CH-01 | Accessing checkout with empty cart redirects | URL = `/cart` | Security |
| CH-02 | Checkout heading is visible | "Checkout" heading visible | UI |
| CH-03 | Order summary shows added product | Summary visible, item shown | Functional |
| CH-04 | Checkout total matches product price | Total ≈ $299.99 | Functional |
| CH-05 | All 7 form fields are present | All fields visible | UI |
| CH-06 | Submitting empty form shows all required errors | All 7 error messages shown | Negative |
| CH-06a | Invalid email shows email error | Error contains "valid email" | Negative |
| CH-06b | Invalid phone shows phone error | Error contains "valid phone" | Negative |
| CH-06c | Invalid ZIP shows ZIP error | Error contains "valid ZIP" | Negative |
| CH-06d | Valid form has no validation errors | No email error visible | Functional |
| CH-07 | Long input values (200 chars) handled gracefully | No crash | Edge |
| CH-08 | Special characters in fields handled correctly | Navigates to `/order-success` | Edge |
| CH-09 | Cart preserved if order submission fails | URL stays `/checkout`, badge > 0 | Negative |
| CH-N01 | Double-click submit creates only one order | Order count = before + 1 | Concurrency |
| CH-N05 | Slow order API shows loading indicator, no duplicates | "Placing Order…" visible & disabled, 1 POST only | Edge |
| OS-01 | Valid form submission navigates to success page | URL = `/order-success` | Functional |
| OS-02 | Success page shows order ID | Order ID matches `/^ORD-/` | Functional |
| OS-03 | Success page shows correct total | Total ≈ checkout total | Functional |
| OS-03a | Success shows confirmation message | Message contains "confirmation" | Functional |
| OS-03b | Cart is cleared after successful order | Cart badge = 0 | Functional |
| OS-04 | Direct access to /order-success without state redirects | URL = `/` | Security |
| OS-05 | Refreshing order success page redirects gracefully | No crash, root visible | Edge |

---

### E2E Full Purchase Flows — `@e2e` (7 tests)

| TC ID | Scenario | Expected Result | Type |
|---|---|---|---|
| E2E-01 | Browse listing → Add → Checkout → Confirm (single item) | Order ID matches `/^ORD-/`, badge = 0 | E2E |
| E2E-02 | Add multiple items → Update qty → Checkout → Confirm | Qty = 2, total correct, order total matches | E2E |
| E2E-03 | Add item → Remove in cart → Add again → Checkout | Empty cart shown after remove, order placed | E2E |
| E2E-04 | Search → Open detail → Add → Cart → Checkout | Search results > 0, order success visible | E2E |
| E2E-05 | Filter by category → Add → Checkout | Count = 5 (Books), order total ≈ book price | E2E |
| E2E-06 | Detail page qty > 1 → Cart total is correct | Badge = 3, total ≈ homeKitchen × 3 | E2E |
| E2E-07 | Continue Shopping from success page lands on listing | URL = `/`, "All Products" heading visible | E2E |

---

### API Layer — `@api` (13 tests)

| TC ID | Scenario | Expected Result | Type |
|---|---|---|---|
| API-01 | POST valid order returns 201 and created order | Status = 201, id and total match | Functional |
| API-02 | Created order includes customer details | customer.email and firstName match | Functional |
| API-03 | Created order includes items array | items is array, length = 1, correct product id | Functional |
| API-04 | Created order includes createdAt timestamp | createdAt truthy, parses to valid Date | Functional |
| API-05 | Order with multiple items stored correctly | Status = 201, items length = 2 | Functional |
| API-06 | GET /orders returns 200 with array | Status = 200, body is array | Functional |
| API-06a | Previously created order appears in order list | Order found, total matches | Functional |
| API-07a | POST empty object — server responds without crashing | Status 200 or 201 | Negative |
| API-07b | POST unexpected fields — server stores and responds | Status 200/201, body has id | Negative |
| API-07c | POST missing all required fields — server stays up | Status 200/201, GET still returns 200 | Negative |
| API-N02 | Invalid data types in fields — server stays up | Status 200/201, GET still returns 200 | Negative |
| API-N03 | Large payload with 100 items accepted | Status = 201, id matches | Edge |
| API-N04 | Duplicate order ID — server stays operational | GET /orders returns 200 after duplicate POST | Concurrency |

---

### Cross-Layer Validation — `@cross-layer` (5 tests)

| TC ID | Scenario | Expected Result | Type |
|---|---|---|---|
| CL-01 | API price matches UI listing price for all 20 products | Each uiPrice ≈ apiPrice (2dp) | Integration |
| CL-01b | API price matches UI on product details page | uiPrice ≈ apiPrice | Integration |
| CL-02 | UI cart total equals sum of API prices × quantities | uiTotal ≈ Σ(apiPrice × qty) | Integration |
| CL-02b | Cart subtotal per item matches API price × quantity | uiSubtotal ≈ apiPrice × 3 | Integration |
| CL-03 | Order stored in API matches what was shown in UI | id, total, customer.email, product.id all match | Integration |

---

## Test Strategy

```
┌─────────────────────────────────────┐
│   Load Tests (k6)                   │ ← Capacity & performance
├─────────────────────────────────────┤
│   E2E Tests (Playwright + POM)      │ ← Full user journey
├─────────────────────────────────────┤
│   API Tests (Playwright request)    │ ← Data layer validation
├─────────────────────────────────────┤
│   Lint (ESLint + Prettier)          │ ← Code quality gate
└─────────────────────────────────────┘
All layers automated via GitHub Actions on every push.
```

---

## Project Structure

```
E-commerce Dummy Cases/
├── src/
│   ├── components/        # Reusable UI components (with data-testid)
│   ├── pages/             # Page-level components
│   ├── context/           # CartContext (global state via useReducer + sessionStorage)
│   ├── hooks/             # useProducts, useProduct
│   ├── types/             # TypeScript interfaces
│   └── data/              # 20 products across 4 categories
├── tests/
│   ├── pages/             # POM — BasePage + 5 page objects
│   ├── api/               # API test specs                    (@api)
│   ├── specs/
│   │   ├── product-listing.spec.ts           (@listing)
│   │   ├── product-listing-negative.spec.ts  (@listing @negative)
│   │   ├── product-details.spec.ts           (@details)
│   │   ├── product-details-negative.spec.ts  (@details @negative)
│   │   ├── cart.spec.ts                      (@cart)
│   │   ├── checkout.spec.ts                  (@checkout)
│   │   ├── e2e-full-flow.spec.ts             (@e2e)
│   │   └── cross-layer.spec.ts              (@cross-layer)
│   ├── fixtures/          # testData.ts, users.ts
│   └── helpers/           # cartHelpers.ts
├── load/                  # k6 smoke, load, stress, spike scripts
├── .github/workflows/     # GitHub Actions CI
├── db.json                # json-server database
└── playwright.config.ts   # 3 browsers, auto web server startup
```

---

## Locator Strategy

| Element Type | Approach | Example |
|---|---|---|
| Dynamic / repeated (product cards, cart items) | `data-testid` | `[data-testid="product-card-1"]` |
| Qty controls, prices, totals | `data-testid` | `[data-testid="cart-total"]` |
| Semantic buttons | Role | `getByRole('button', { name: 'Place Order' })` |
| Form fields | Label | `getByLabel('Email Address')` |
| Navigation links | Role | `getByRole('link', { name: 'Cart' })` |

---

## CI/CD Pipeline (GitHub Actions)

```
Push → Lint → API Tests → E2E Tests → Load Smoke
```

Each stage gates the next. HTML reports and screenshots are uploaded as artifacts on every run.

---

## Mock Data

20 products across 4 categories (5 per category):

- **Electronics** — Headphones, Smart TV, Mechanical Keyboard, Smartwatch, Bluetooth Speaker
- **Clothing** — Slim-Fit Chinos, Running Jacket, White Sneakers, Merino Jumper, Denim Jacket
- **Books** — Clean Code, DDIA, Atomic Habits, Pragmatic Programmer, You Don't Know JS
- **Home & Kitchen** — Ergonomic Chair, Water Bottle, Cookware Set, Cutting Boards, Diffuser

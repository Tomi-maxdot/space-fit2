# SpaceFit: Fixes and Features (prompt for the VS Code AI)

How to use: open the SpaceFit project in VS Code, start the AI in agent mode (Copilot, Claude Code or similar), and give it this whole file. Or paste one section at a time. Sections are grouped by page so each one can be done and tested on its own.

---

## Ground rules (read first)

1. Inspect the project before changing anything: find the framework, the router, the shared Navbar component, the state or store that holds cart and favorites, the product data, and the `assets` folder. Follow the conventions you find. Do not switch frameworks and do not add new libraries unless there is no reasonable alternative (tell me if you add one).
2. Make only the changes listed here. Do not redesign, restyle or rename anything else. Keep the current flat look (no glassmorphism, blur or gradients).
3. Do not create the Profile page. I will build it myself. Only link to it (see section 1.3).
4. Keep these existing rules working. Do not break them:
   - Cart and favorites each live in one shared store, so every page shows the same counts.
   - Users who have not registered can only view the Home page. Anything that leaves Home, saves an item, or uses the AI assistant shows the "Register to continue" pop-up.
   - The footer appears on the Home page only.
   - The navbar has no search bar. Search bars live in the page body (the Home hero and the Shop page).
5. When you finish, give me a short report: files changed, anything you assumed, anything you could not do, and every TODO you left in the code.

---

## 1. Global behavior (shared across pages)

### 1.1 Favorites count only counts saved products
- The number badge on the navbar favorites icon must be calculated from the real saved list (the number of product IDs actually in favorites). Never hardcode a number and never start with a sample number.
- If the list is empty, the badge is hidden. If a saved product no longer exists in the product data, drop it from the list so the count is correct.
- The badge updates instantly on every page when a heart is toggled or an item is removed on the Favorites page.
- The cart badge follows the same rule: it is calculated from the real cart contents.

### 1.2 Hearts start unselected
- Every heart on every product card and product page starts as an outline. No product is pre-saved.
- A heart is filled only if its product ID is in the saved list. Clicking toggles it on and off, and the state is the same everywhere that product appears (Home, Shop, Product page, "You may also like", Favorites).
- Remove any hardcoded "liked" or "active" flag from the product data or components that makes a heart start filled.

### 1.3 Sign in, "Remember me" and the profile icon
- Add a "Remember me" checkbox to the Sign in form (unchecked by default). Registering also signs the user in; treat it the same way.
- Session storage:
  - "Remember me" ticked: keep the session in persistent storage (for example a cookie with a long expiry or localStorage), so the user stays signed in after closing and reopening the browser.
  - Not ticked: keep the session only for the current browser session (session cookie or sessionStorage). It ends when the browser is closed.
  - Clearing site data or cache removes the session in both cases, so the user has to sign in again.
- Never store the password. Store only a token or a signed-in flag with the user ID. If the project has no real backend yet, keep the current mock approach and mark it with a `TODO: replace with real auth`.
- Route guard: if the user is signed in, the authentication pages (Sign in, Register, Forgot password) must not show. Visiting them redirects to the Home page. If the user is not signed in (never signed in, session ended, or data cleared), the authentication pages show as normal.
- Profile icon (the humanoid in the navbar):
  - Not signed in: opens the Register page (existing behavior).
  - Signed in: opens the user profile page at the route `/profile` (use this project's route naming if it differs). I will create that page. If the route does not exist yet, add only an empty placeholder route file with a `TODO: profile page` comment so the link does not give a 404. Do not design it.
- Add one shared `logout()` helper that clears both the persistent and session storage and returns the user to the Home page, so the profile page can call it later.

### 1.3b Search works across the whole website
- Every search bar on the site (the Home hero search and the Shop page search, and any other) must use one shared search function over the full product data (all products from all category folders, not only the ones currently on screen).
- Match against title, category, condition, location, description and specs. Not case-sensitive, partial words work (typing "mat" finds "Mattress").
- While typing, show a dropdown of up to 6 matches (photo, title, price). Choosing a match opens that product's page. Pressing Enter opens the Shop page showing the matching products.
- Show an x button to clear the text. If nothing matches, show "No items found".
- Registration rule still applies: an unregistered user who opens a result sees the "Register to continue" pop-up.

---

## 2. Home page

### 2.1 Navbar
- Remove the "Home" link from the Home page navbar. Do not leave a gap. Keep every other item as it is.

### 2.2 Remove "How selling works"
- In the call-to-action section "Have a furniture to sell", remove the "How selling works" button or link completely, with no gap left. Keep the other button in that section.

### 2.3 Category clicks show that category's products
- In the Categories section, clicking a category (Beds, Mattresses, Rugs, Chairs, and every other category shown) opens the Shop page with only that category selected, for example `/shop?category=beds`. All products of that category show, including the ones from the new assets (see section 6).
- This works for every category card on the Home page, using the same category list the Shop page uses. There must be one shared list of categories, not two.
- "Explore all" opens `/shop` with no category selected.
- Registration rule still applies for unregistered users.

---

## 3. Shop page

### 3.1 Navbar
- Remove the "Shop" link from the Shop page navbar. No gap. Keep everything else.

### 3.2 Filters
- On page load, no filter is selected. The page shows what it currently shows by default, which is all products.
- Selecting categories filters the products:
  - Select Beds: only beds show.
  - Select Beds and Mattresses: only beds and mattresses show (products from any selected category).
  - Select nothing: all products show, exactly like the default view.
- The same logic applies to any other filter group that already exists in the filter panel (for example condition or price). Groups combine: a product must match the selected options in each group, and within one group any selected option matches.
- Reset link (top of the filter panel): fix it. One click clears every selection in every group, resets the count, and returns the page to the default view showing all products. It also clears the `category` value from the URL.
- Apply filters button (bottom of the filter panel):
  - It shows a number beside it, for example `Apply filters (18)`. The number is the count of products that match the current selections, and it updates instantly as the user picks and unpicks filters. With nothing selected it shows the total number of products.
  - Clicking it applies the selections to the product grid and closes the panel (on mobile).
  - If no products match, the button shows `Apply filters (0)` and the grid shows "No items match these filters" with a "Reset filters" button.
- Keep the selected filters in the URL (for example `?category=beds,mattresses`) so refreshing, sharing and the browser back button keep the same view. Arriving from a Home category click pre-selects that category and applies it immediately.

### 3.3 Category images
- Category cards or chips on the Shop page use the new assets (section 6): the image for a category comes from that category's folder (use a file named `cover` in the folder if it exists, otherwise the first image).

---

## 4. Product page

### 4.1 Navbar
- Remove the "Products" link from the Product page navbar.
- Add a "Sell" link. The navbar links on this page are Home, Shop and Sell, placed on the left side of the navbar (after the logo icon and wordmark), in that order. The favorites, cart and profile icons stay on the right.
- This reverses my earlier instruction to remove Sell from this page.

### 4.2 Nothing is pre-selected
- The heart on the product (for example the "Three-door minimal ..." product) and every heart in "You may also like" start unselected, and are filled only when their product ID is in the saved list (see section 1.2).
- Check the product page for any other toggle or option that is selected by default without the user clicking it (saved state, wishlist state, variant or size options, "in cart" state). Make them start unselected, except the main image thumbnail, which stays selected. List anything you changed in your report.

---

## 5. Sell page

### 5.1 Live preview scrolls on its own
- The live preview panel scrolls independently from the rest of the page. The form scrolls with the page, while the preview stays fixed on the right (sticky, with `top` below the navbar) and has its own vertical scroll when its content is taller than the screen.
- Set the panel height to fit the visible screen (for example `calc(100vh - navbar height - spacing)`) and use `overflow-y: auto`. Use `overscroll-behavior: contain` so scrolling the preview does not scroll the page behind it.
- Hide the scrollbar visually (`scrollbar-width: none` and the WebKit equivalent) while keeping mouse wheel and touch scrolling working, because I find visible scrollbars distracting.
- This replaces my earlier instruction that the preview must not scroll.
- On mobile, keep the current "Preview" button behavior.

---

## 6. Assets become the product data (categories and products)

I am adding new assets. Use them as the source of the products and categories.

1. Look in the `assets` folder. Treat each subfolder that represents a category (for example `beds`, `mattresses`, `rugs`, `chairs`) as one category, and every image inside it as one product in that category. Show the folder structure you found before you build on it.
2. Build the product data from the folders automatically, so that when I drop new images into a folder they appear on the site without editing code. Use the mechanism that fits this project (for example `import.meta.glob` in Vite, `require.context` in webpack, or reading the folder on the server in Next.js). If no automatic method fits, generate a single `products` data file with a script and tell me how to rerun it.
3. For every product create: `id` (stable, made from the category and file name), `title` (made from the file name, for example `three-door-minimal-wardrobe.jpg` becomes "Three Door Minimal Wardrobe"), `category` (from the folder name), `image`, and the other fields the site already uses (price, condition, location, description, specs). Do not invent realistic-looking values silently: if a product has existing data, keep it. If it has none, fill the data file with clearly marked placeholders (`TODO`) in one central file so I can edit them, and list them in your report.
4. The category list for the Home page, the Shop page filters and the category chips must all come from this one data source, so a new folder automatically becomes a new category and a new image automatically becomes a new product.
5. Clicking a category shows every product from that category's folder. The default Shop view shows the products from all folders.
6. If a category folder is empty, show "No items in this category yet" instead of a blank space.
7. Use optimized image handling that fits the project (correct `alt` text from the title, lazy loading for images below the fold, fixed aspect ratio so the grid does not jump while loading).

---

## 7. Checklist to test before you finish

Run the app and confirm each point. Tell me which ones you could not verify.

1. Fresh load (no saved data): every heart is an outline and there is no favorites badge and no cart badge.
2. Click a heart on Home: the badge shows 1. Click it again: the badge disappears. Save 3 items: the badge shows 3, and the Favorites page shows exactly those 3.
3. Remove an item on the Favorites page: the badge drops and the heart on the Shop page turns back to an outline.
4. Home navbar has no "Home" link. Shop navbar has no "Shop" link. Product navbar shows Home, Shop and Sell on the left, and no "Products".
5. "How selling works" is gone from the "Have a furniture to sell" section.
6. Home: click each category. The Shop page opens with only that category, and every image from that category folder shows.
7. Shop: select Beds, then add Mattresses: only those two categories show, and the Apply filters number changes at each click. Unselect both: all products show again.
8. Shop: select several filters, click Reset: everything clears, the number returns to the total, the URL loses its filters, and all products show.
9. Sign in with "Remember me" ticked, close the browser and reopen: the user is still signed in, the authentication pages redirect to Home, and the profile icon opens `/profile`.
10. Sign in without "Remember me", close the browser and reopen: the authentication pages show again. Clear site data while signed in: same result.
11. Search from the Home hero and from the Shop page: products from every category can be found, suggestions show, and Enter opens the Shop page with results.
12. Sell page: scroll the form and the live preview separately, with no visible scrollbar on the preview, and the page behind does not move when the preview reaches its end.
13. Unregistered user: the "Register to continue" pop-up still shows for hearts, Shop, Product, Sell and the AI assistant.
14. The footer appears on the Home page only.

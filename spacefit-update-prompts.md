# SpaceFit: Update Prompts for Stitch (by page)

How to use: paste the "Global changes" section first, then paste one page section at a time. Every section is self-contained and tells Stitch to change only what is listed.

---

## 0. Global changes (all pages)

```
Update all existing pages of the SpaceFit marketplace. Make only the changes listed below and keep everything else (layout, colors, fonts, spacing and all earlier changes) exactly as it is now.

1. SHOPPING BAG BECOMES SHOPPING CART
- Find every shopping bag icon on every page (navbar, product cards, product page, buttons, bottom navigation) and replace it with a shopping cart icon from the same line icon set. Same size and position, same color rules.
- The navbar cart icon opens the Cart page when tapped or clicked.
- A cart icon or "Add to cart" button on a product card or product page adds that item to the cart. The cart icon in the navbar shows a small flat count badge with the number of items in the cart, and the badge appears only when the cart has at least one item.

2. ONE SHARED CART, ALWAYS IN SYNC
- The cart count badge must show the same number on every page (Home, Shop, Product, Cart, Sell, Favorites). When an item is added or removed, the number updates everywhere at once.
- Connect the screens in the prototype so this works.

3. POP-UP WHEN ADDING TO CART
- When an item is added: a small flat pop-up at the bottom of the screen, "Added to cart" with a "View cart" link that opens the Cart page. It closes by itself after about 3 seconds and has an x to close it. It must not cover the bottom navigation on mobile.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 1. Home page

```
Update the existing Home page. Make only the changes listed below and keep everything else exactly as it is now.

1. CART ICON WORKS
- The navbar icon is now a shopping cart (not a bag). Tapping it opens the Cart page.
- The cart icon or "Add to cart" button on every product card on this page adds the item to the cart and shows the "Added to cart" pop-up. The navbar badge count goes up by one.

2. SEARCH BAR WORKS
- The search bar on the Home page must actually search all products in the shop. It matches title, category, condition, location, description and specifications. Matching is not case-sensitive and works with partial words (typing "mat" finds "Mattress").
- While the user types, show a short dropdown of up to 6 matching products (small photo, title, price) under the search bar. Tapping a suggestion opens that product's page.
- Pressing Enter or the search button opens the Shop page showing the results for that search.
- If nothing matches, the dropdown shows "No items found".
- Show a clear (x) control inside the bar once the user has typed something.

3. CATEGORIES SECTION: "EXPLORE ALL"
- The "Explore all" link in the Categories section is a clickable link (with a small arrow, hover and pressed states). Tapping it opens the Shop page.
- Tapping an individual category card opens the Shop page with that category already selected.

4. "VIEW ALL" LINKS
- Every "View all" link on the Home page (featured items, recent items, and any other section) opens the Shop page. Give each one clear hover and pressed states.

5. "CREATE YOUR SPACE" BUTTON
- The "Create your space" call-to-action button opens the AI assistant page. Connect the screens in the prototype so this works.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 2. Shop page

```
Update the existing Shop page. Make only the changes listed below and keep everything else exactly as it is now.

1. REMOVE THE RECOMMENDATION SECTION
- Remove the recommendation section completely, including its heading, cards and any "recommended for you" or "picked for you" labels. No replacement content and no empty gap.

2. ALIGN THE OPENING TEXT TO THE LEFT
- The opening text at the top of the page (the page heading and the line under it) is left-aligned, lined up with the left edge of the product grid. It is not centered.

3. REMOVE THE FOOTER
- Remove the footer completely. Nothing sits below the product grid except the "Showing items" bar and, on mobile, the bottom navigation.

4. NAVBAR SAME AS THE HOME PAGE
- Use the exact same navbar as the Home page: same layout, height, spacing, logo icon and wordmark, search bar, favorites icon, shopping cart icon, profile icon and style. No "Home", "Shop" or "Products" links.

5. CART ICON ON PRODUCT CARDS
- The cart icon or "Add to cart" button on every product card is a shopping cart (not a bag). Tapping it adds the item to the cart, shows the "Added to cart" pop-up, and updates the navbar badge.

(New items will be added to this page by me. Do not add sample items.)

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 3. Product page

```
Update the existing Product page. Make only the changes listed below and keep everything else exactly as it is now.

1. "ADD TO CART" BUTTON ICON
- The icon on the "Add to cart" button is a shopping cart (not a bag).

2. CART COUNT IN THE NAVBAR
- The cart icon in the navbar shows the same count badge as every other page. When the user taps "Add to cart" on this page, the badge number goes up immediately, and the "Added to cart" pop-up appears. If the item is already in the cart, the button shows "In cart" and the count does not change.
- The number must match the Cart page at all times.

3. "YOU MAY ALSO LIKE" SECTION
- Show 6 products taken from the other product pages and categories in the shop (a mix of categories, not only this product's own category). Use the standard product card (photo, price, title, condition tag, location, heart button, shopping cart button).
- Put an arrow link "See more" (with a right arrow) at the top right of the section heading. Tapping it opens the Shop page.
- On mobile, the 6 products scroll sideways in one row with a visible arrow control, or sit in a 2-column grid. Choose whichever fits the page without sideways scrolling of the whole page.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 4. Cart page

```
Update the existing Cart page. Make only the changes listed below and keep everything else exactly as it is now.

1. REMOVE THE CART ICON FROM THE NAVBAR
- On this page only, remove the shopping cart icon from the navbar, since the user is already on the Cart page. Nothing takes its place and no gap is left.

2. HEART BECOMES THE FAVORITES ICON
- On every cart item, replace the heart icon (used for "save for later" or "move to favorites") with the same favorites icon used in the Home page navbar. It is NOT a heart shape.
- It works as a toggle: tapping it saves the item to Favorites and shows the "Added to favorites" pop-up with a "View favorites" link. Tapping it again removes it.
- Tap target of at least 44px.

3. CART COUNT
- The page title shows the number of items (for example "Cart (3)"), which matches the count badge shown on every other page.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 5. Sell page

```
Update the existing "Sell an item" page. Make only the changes listed below and keep everything else exactly as it is now.

1. SMALLER LIVE PREVIEW THAT STAYS IN VIEW
- Make the live preview panel smaller: narrower and more compact, with smaller text and smaller photos, but still readable.
- On desktop, keep it fixed in place on the right side of the screen (sticky at the top) so it stays visible the whole time the seller scrolls down the form. The panel is never taller than the screen. If the content is longer, the content inside the panel scrolls.
- On mobile, keep the "Preview" button in the bottom bar as before.
- It still updates instantly as the seller fills in the form, and still shows the "Your listing preview" message when nothing is filled in.

2. REMOVE THE "SELL" ICON FROM THE NAVBAR
- Remove the "Sell" icon or link from the navbar on this page only. Nothing takes its place and no gap is left. Do not change anything else in the navbar.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 6. Authentication pages (Register, Sign in, and any other login screens)

```
Update all authentication pages (Register, Sign in, Forgot password and any other login screens). Make only the change listed below and keep everything else exactly as it is now.

1. REMOVE THE FAVORITES ICON
- Remove the favorites icon (the one that leads to the Favorites page) from the navbar on every authentication page. Nothing takes its place and no gap is left.
- Leave the logo icon and wordmark and everything else in the navbar unchanged.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 7. Favorites page

No changes in this round. The Favorites page is already empty until an item is saved (covered by the earlier prompt).

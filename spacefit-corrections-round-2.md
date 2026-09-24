# SpaceFit: Corrections, Round 2 (Stitch prompts by page)

How to use: paste the "Global changes" section first, then paste one page section at a time. Every section is self-contained and tells Stitch to change only what is listed. This round overrides earlier prompts wherever they disagree (for example: guests can no longer save items, and the footer now appears only on the Home page).

---

## 0. Global changes (all pages)

```
Update all existing pages of the SpaceFit marketplace. Make only the changes listed below and keep everything else (layout, colors, fonts, spacing and all earlier changes) exactly as it is now.

1. REGISTRATION REQUIRED TO USE THE SITE
- This replaces my earlier instruction that guests can save items. A user who has not registered can only look at the Home page. Anything that takes them away from the Home page, or saves something, needs registration first. This includes: tapping a heart on any product, opening the Shop page, a product page or the Sell page, using the AI assistant ("Create your space"), the cart icon, the favorites icon, "Explore all" and "View all" links, and opening a search result.
- When an unregistered user tries any of these, show a pop-up in the middle of the screen (full width on mobile, about 400px wide on desktop):
  Heading: "Register to continue"
  Text: "You have not registered yet. Create an account or sign in to save items, shop, sell and use the AI assistant."
  Buttons: "Register" (primary), "Sign in" (secondary), and an x in the corner to close.
- The overlay behind the pop-up is a flat dark color at 50% opacity, with no blur.
- Tapping the profile icon (the humanoid silhouette) opens the Register page directly, without this pop-up.
- After the user registers or signs in, take them back to the action they tried (for example, the item they wanted to save is saved).
- A registered user sees no pop-up and everything works normally. Design both states and connect the screens in the prototype.

2. FOOTER ON THE HOME PAGE ONLY
- Remove the footer from every page except the Home page: Shop, Product, Cart, Sell, Favorites, AI assistant, Profile, Register, Sign in and any other screen. Nothing sits below the content except what the page needs (for example the "Showing items" bar or the mobile bottom navigation).
- The Home page keeps its footer exactly as it is.

3. CART AND FAVORITES BADGES LOOK IDENTICAL
- The count badge on the favorites icon is currently bigger and higher than the badge on the cart icon. Make them exactly the same on every page.
- Both icons: same size (24px icon inside a 44px tap target), same stroke, same color, same alignment on the same horizontal line in the navbar.
- Both badges: same size (18px circle), same font size (11px, bold), same accent color fill with white text, and the same position, anchored to the top right corner of the icon (offset 4px up and 4px right). Numbers above 9 show as "9+".
- Design them side by side once so the match is clear. Use these badges on every page.

4. CART AND FAVORITES STAY IN SYNC ON EVERY PAGE
- The cart icon and favorites icon in the navbar of every page (Home, Shop, Product, Sell, AI assistant, Profile and so on) show the current count. When the user adds or removes an item on the Cart page or the Favorites page (or anywhere else), the count badge changes on every other page too.
- Every heart, badge and list reads from one shared list of saved items, and one shared list of cart items.

5. HEART BUTTONS ARE CLICKABLE EVERYWHERE
- The heart on every product card, on every page, is a clickable toggle. First tap: filled with the accent color, saved to Favorites, "Added to favorites" pop-up. Second tap: back to an outline, removed, "Removed from favorites" pop-up with "Undo". It can be tapped on and off as many times as needed.
- Tap target of at least 44px. (For unregistered users, tapping it shows the registration pop-up from point 1.)

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 1. Home page

```
Update the existing Home page. Make only the changes listed below and keep everything else (including the footer) exactly as it is now.

1. FIX THE HEART IN "IN STOCK, FAST DELIVERY"
- The heart on the products in the "In stock, fast delivery" section does not respond. Fix it. It must work exactly like the heart on every other product card: tap to save (filled, accent color), tap again to remove (outline), with the "Added to favorites" and "Removed from favorites" pop-ups, and the favorites badge in the navbar updating.
- Check every other product section on the Home page (featured, recent, and so on) and make sure each heart works the same way.
- If the user is not registered, tapping the heart shows the "Register to continue" pop-up instead.

2. REMOVE THE SEARCH BAR FROM THE NAVBAR
- Remove the search bar from the Home page navbar. Nothing takes its place and no gap is left. The navbar keeps the logo icon, wordmark, links, favorites icon, shopping cart icon and profile icon.
- The search bar in the hero section stays exactly where it is and keeps working (suggestions while typing, Enter opens the Shop page with results).

3. REGISTRATION CHECK ON LINKS
- For an unregistered user, everything on the page that leads away from Home (Explore all, View all, category cards, product cards, "Create your space", the cart icon, the favorites icon, search suggestions) shows the "Register to continue" pop-up.
- For a registered user, all of them work normally.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 2. Shop page

```
Update the existing Shop page. Make only the changes listed below and keep everything else exactly as it is now.

1. NAVBAR SAME AS THE HOME PAGE, WITHOUT THE SEARCH BAR
- This replaces my earlier instruction to remove the Home, Shop and Products links. Bring back the full navbar from the Home page: logo icon, wordmark, the links Home, Shop, Products and Sell, the favorites icon, the shopping cart icon and the profile icon. Same layout, height, spacing and style as the Home page navbar.
- The only difference: there is NO search bar in the navbar. Remove it completely, with no gap left.

2. WORKING SEARCH BAR ON THE PAGE
- Put the search bar in the page body, directly under the page heading (not in the navbar).
- It must respond as the user types. Show a dropdown of up to 6 matching products (small photo, title, price, category) under the bar, the same way the search in the Home page hero section works. Tapping a suggestion opens that product's page.
- It searches all products in the shop by title, category, condition, location, description and specifications. Not case-sensitive, partial words work (typing "mat" finds "Mattress").
- While the user types, the product grid also filters to the matching products. Clearing the search brings back the normal category view.
- Show a clear (x) control inside the bar once the user has typed something. If nothing matches: "No items found" with a "Clear search" button.

3. REMOVE "SORT BY" COMPLETELY
- Remove the entire "Sort by" control and everything in it, including the price sorting options and any dropdown, label or icon that belongs to it. Nothing takes its place and no gap is left. The category chips and the search bar are the only controls above the grid.

4. CART BUTTON ON PRODUCT CARDS
- Remove the "Add to cart" text button from every product card. Keep only the shopping cart icon button. Tapping it adds the item to the cart, shows the "Added to cart" pop-up and updates the badge. Tap target of at least 44px.

5. HEART ON PRODUCT CARDS
- The heart on every product card is a clickable toggle (see the Global section).

6. NO FOOTER
- Remove the footer completely. Only the "Showing items" bar sits below the grid.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 3. Product page

```
Update the existing Product page. Make only the changes listed below and keep everything else exactly as it is now.

1. REMOVE "SELL" FROM THE NAVBAR
- Remove the "Sell" link from the navbar on this page completely. Nothing takes its place and no gap is left. The rest of the navbar stays the same.

2. HEART ON THE PRODUCT IS CLICKABLE
- The heart on the main product (beside the price or on the main photo) is a clickable toggle: tap to save (filled, accent color), tap again to remove (outline). It works on every product's page, with the "Added to favorites" and "Removed from favorites" pop-ups and the favorites badge updating.

3. "YOU MAY ALSO LIKE" USES THE HEART
- On the products in the "You may also like" section, the favorites button is a heart shape, not the favorites icon from the navbar. Each heart is clickable and unclickable, works exactly like the heart on the Shop page cards, and updates the badge.

4. NO FOOTER
- Remove the footer completely.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 4. Sell page

```
Update the existing "Sell an item" page. Make only the changes listed below and keep everything else exactly as it is now.

1. NO SCROLLBAR IN THE LIVE PREVIEW
- Remove every visible scrollbar and scroll area from the live preview panel. The preview does not scroll inside itself and shows no scroll bar, arrows or scroll hints.
- Keep the content compact so the whole preview fits in the panel: a small cover photo, a row of small thumbnails, price, title, condition tag, location, a short specs list and a short description. Long text is cut after 2 or 3 lines with "..." instead of scrolling.
- The panel stays fixed in place on the right side of the screen while the seller scrolls the form.

2. BANK SELECTION IN THE BUYER'S REQUIREMENTS / PAYOUT SECTION
- The "Bank" field is a searchable selector.
  a) Tapping the field opens a list of banks (for example Access Bank, First Bank, GTBank, Zenith Bank, UBA, Fidelity Bank, Stanbic IBTC, Sterling Bank, Union Bank, Wema Bank, Opay, Kuda, Moniepoint). Design the list only. My developer connects the real list of banks.
  b) While the user types in the field, the list narrows to the banks that contain the typed letters (typing "ze" shows Zenith Bank). Matching is not case-sensitive.
  c) If no bank matches, show "No bank found".
  d) Tapping a bank fills the field with its name and closes the list.
- Once a bank has been chosen, a "Change" link appears at the right side of the field. Tapping it works: it reopens the list so the seller can choose a different bank. Before a bank is chosen, the "Change" link is not shown.
- Show the states: empty, list open, typing (filtered list), no match, and bank chosen (with "Change" visible).

3. NO FOOTER
- The footer stays removed.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 5. Cart page

```
Update the existing Cart page. Make only the changes listed below and keep everything else exactly as it is now.

1. NO FOOTER
- Remove the footer completely.

2. BADGES
- The favorites icon badge uses the same size and position as the cart badge (see the Global section). Both show the current counts and update immediately when the user adds or removes something on this page.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 6. Favorites page

```
Update the existing Favorites page. Make only the changes listed below and keep everything else exactly as it is now.

1. NO FOOTER
- Remove the footer completely.

2. BADGES AND SYNC
- The favorites and cart badges in the navbar use the same size and position (see the Global section).
- When the user removes an item here, the favorites badge changes here and on every other page, and the heart on that item turns back to an outline everywhere else.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 7. AI assistant page

```
Update the existing AI assistant page. Make only the changes listed below and keep everything else exactly as it is now.

1. NO FOOTER
- Remove the footer completely.

2. REGISTRATION REQUIRED
- A user who has not registered cannot open this page. Tapping "Create your space" on the Home page shows the "Register to continue" pop-up instead. Registered users open the page normally.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

---

## 8. Authentication pages (Register, Sign in, and other login screens)

```
Update all authentication pages (Register, Sign in, Forgot password and any other login screens). Make only the changes listed below and keep everything else (including the removed favorites icon) exactly as it is now.

1. NO FOOTER
- Remove the footer completely.

2. RETURN TO THE ACTION
- After the user registers or signs in, take them back to the page or action they came from (for example, the product they wanted to save or the page they wanted to open). If they came from the profile icon, take them to the Home page.

STYLE REMINDERS
Flat solid colors, thin 1px borders, no glassmorphism or blur, no gradients or glows, no emoji as icons, one accent color, plain direct microcopy.
```

# Collaborative Shopping List

## Current State
A shared shopping list where anyone with the link can add, toggle, and delete items. No authentication -- all users are anonymous and share a single global list.

## Requested Changes (Diff)

### Add
- Internet Identity sign-in button in the header
- Signed-in user's display (principal/identity indicator)
- Sign-out button
- Each item records who added it (addedBy principal)
- Items show who added them (optional display)

### Modify
- Header: add Sign In / Sign Out button and user info
- Backend: track `addedBy` field on ShoppingItem
- The list remains fully shared -- all signed-in and anonymous users see the same list

### Remove
- Nothing removed

## Implementation Plan
1. Select `authorization` Caffeine component
2. Regenerate backend with `addedBy: Principal` field on ShoppingItem
3. Frontend: wire up authorization hooks for login/logout, show user identity in header, show "Added by" label on items

# Collaborative Shopping List

## Current State
New project with no existing code.

## Requested Changes (Diff)

### Add
- Shared shopping list stored on Motoko backend, accessible by all users
- Items with: name, optional quantity, optional unit, category, purchased status
- Add item form with name (required), quantity, unit, and category fields
- Check off items as purchased (toggles visual strike-through)
- Delete individual items
- Organize items by category (grouped display)
- Polling or refresh mechanism to sync state across users
- Mobile-friendly, clean UI

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Backend: stable storage for items array; functions: addItem, togglePurchased, deleteItem, getItems, clearPurchased
2. Frontend: single-page app with grouped list view, add item form, category filter/grouping, item actions
3. Auto-refresh every few seconds to simulate real-time sync

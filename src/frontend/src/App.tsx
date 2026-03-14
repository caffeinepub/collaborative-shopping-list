import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import {
  Leaf,
  Loader2,
  Plus,
  RefreshCw,
  ShoppingBasket,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ShoppingItem } from "./backend.d";
import {
  useAddItem,
  useClearPurchased,
  useDeleteItem,
  useGetItems,
  useTogglePurchased,
} from "./hooks/useQueries";

const CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Bakery",
  "Frozen",
  "Beverages",
  "Snacks",
  "Household",
  "Personal Care",
  "Other",
];

const CATEGORY_ICONS: Record<string, string> = {
  Produce: "🥦",
  Dairy: "🥛",
  Meat: "🥩",
  Bakery: "🍞",
  Frozen: "🧊",
  Beverages: "🧃",
  Snacks: "🍿",
  Household: "🧹",
  "Personal Care": "🧴",
  Other: "📦",
};

const CATEGORY_COLORS: Record<string, string> = {
  Produce: "bg-green-100 text-green-800 border-green-200",
  Dairy: "bg-blue-100 text-blue-800 border-blue-200",
  Meat: "bg-red-100 text-red-800 border-red-200",
  Bakery: "bg-amber-100 text-amber-800 border-amber-200",
  Frozen: "bg-sky-100 text-sky-800 border-sky-200",
  Beverages: "bg-purple-100 text-purple-800 border-purple-200",
  Snacks: "bg-orange-100 text-orange-800 border-orange-200",
  Household: "bg-slate-100 text-slate-800 border-slate-200",
  "Personal Care": "bg-pink-100 text-pink-800 border-pink-200",
  Other: "bg-zinc-100 text-zinc-800 border-zinc-200",
};

function getCategoryColor(category: string): string {
  return (
    CATEGORY_COLORS[category] ||
    "bg-violet-100 text-violet-800 border-violet-200"
  );
}

function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || "🛒";
}

function groupByCategory(
  items: ShoppingItem[],
): Record<string, ShoppingItem[]> {
  const groups: Record<string, ShoppingItem[]> = {};
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }
  // Sort items within each group: unpurchased first
  for (const cat of Object.keys(groups)) {
    groups[cat].sort((a, b) => {
      if (a.purchased === b.purchased) return a.name.localeCompare(b.name);
      return a.purchased ? 1 : -1;
    });
  }
  return groups;
}

function ItemRow({
  item,
  index,
  onToggle,
  onDelete,
  isToggling,
  isDeleting,
}: {
  item: ShoppingItem;
  index: number;
  onToggle: (id: bigint) => void;
  onDelete: (id: bigint) => void;
  isToggling: boolean;
  isDeleting: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      data-ocid={`todo.item.${index}`}
      className={`item-row flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border shadow-xs group hover:border-primary/30 transition-colors ${
        item.purchased ? "purchased" : ""
      }`}
    >
      <Checkbox
        data-ocid={`todo.checkbox.${index}`}
        checked={item.purchased}
        onCheckedChange={() => onToggle(item.id)}
        disabled={isToggling}
        className="shrink-0 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        aria-label={`Mark ${item.name} as ${item.purchased ? "unpurchased" : "purchased"}`}
      />
      <div className="flex-1 min-w-0">
        <span
          className={`text-sm font-medium leading-tight block truncate transition-all duration-200 ${
            item.purchased
              ? "line-through text-muted-foreground"
              : "text-foreground"
          }`}
        >
          {item.name}
        </span>
        {(item.quantity !== undefined || item.unit) && (
          <span className="text-xs text-muted-foreground mt-0.5 block">
            {item.quantity !== undefined ? item.quantity : ""}
            {item.quantity !== undefined && item.unit ? " " : ""}
            {item.unit || ""}
          </span>
        )}
      </div>
      <Button
        data-ocid={`todo.delete_button.${index}`}
        variant="ghost"
        size="icon"
        onClick={() => onDelete(item.id)}
        disabled={isDeleting}
        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        aria-label={`Delete ${item.name}`}
      >
        {isDeleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </Button>
    </motion.div>
  );
}

export default function App() {
  const { data: items = [], isLoading, isError } = useGetItems();
  const addItem = useAddItem();
  const togglePurchased = useTogglePurchased();
  const deleteItem = useDeleteItem();
  const clearPurchased = useClearPurchased();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("Produce");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const purchasedCount = items.filter((i) => i.purchased).length;
  const totalCount = items.length;

  const effectiveCategory = isCustomCategory
    ? customCategory.trim() || "Other"
    : category;

  const groupedItems = groupByCategory(items);
  const sortedCategories = Object.keys(groupedItems).sort();

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const qty = quantity !== "" ? Number.parseFloat(quantity) : null;
    const unitVal = unit.trim() || null;

    try {
      await addItem.mutateAsync({
        name: trimmedName,
        quantity: qty,
        unit: unitVal,
        category: effectiveCategory,
      });
      setName("");
      setQuantity("");
      setUnit("");
      nameInputRef.current?.focus();
      toast.success(`"${trimmedName}" added to list`);
    } catch {
      toast.error("Failed to add item. Please try again.");
    }
  };

  const handleToggle = async (id: bigint) => {
    try {
      await togglePurchased.mutateAsync(id);
    } catch {
      toast.error("Failed to update item.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteItem.mutateAsync(id);
    } catch {
      toast.error("Failed to delete item.");
    }
  };

  const handleClearPurchased = async () => {
    if (purchasedCount === 0) return;
    try {
      await clearPurchased.mutateAsync();
      toast.success(
        `${purchasedCount} purchased item${purchasedCount === 1 ? "" : "s"} cleared`,
      );
    } catch {
      toast.error("Failed to clear purchased items.");
    }
  };

  // Build a flat list index for deterministic markers
  const flatItemIndex: Record<string, number> = {};
  let idx = 1;
  for (const cat of sortedCategories) {
    for (const item of groupedItems[cat]) {
      flatItemIndex[item.id.toString()] = idx++;
    }
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <ShoppingCart className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-700 leading-none text-foreground">
                CartShare
              </h1>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">
                Shared shopping list
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isLoading && (
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className="text-xs font-medium bg-secondary text-secondary-foreground border-0"
                >
                  {purchasedCount}/{totalCount}
                </Badge>
              </div>
            )}
            <Button
              data-ocid="header.clear_button"
              variant="outline"
              size="sm"
              onClick={handleClearPurchased}
              disabled={purchasedCount === 0 || clearPurchased.isPending}
              className="text-xs h-8 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors disabled:opacity-40"
            >
              {clearPurchased.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Trash2 className="h-3 w-3 mr-1" />
              )}
              Clear done
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pb-16 pt-4">
        {/* Add item form */}
        <section className="mb-6">
          <form
            onSubmit={handleAddItem}
            className="bg-card border border-border rounded-xl shadow-card p-4 space-y-3"
          >
            <div className="flex gap-2">
              <Input
                ref={nameInputRef}
                data-ocid="todo.input"
                placeholder="Add an item…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 text-sm h-9 bg-background border-input focus-visible:ring-ring"
                autoComplete="off"
                required
              />
              <Button
                data-ocid="todo.add_button"
                type="submit"
                size="sm"
                disabled={!name.trim() || addItem.isPending}
                className="h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shrink-0"
              >
                {addItem.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span className="ml-1.5 hidden sm:inline">Add</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_1.5fr]">
              <Input
                data-ocid="add_form.quantity_input"
                type="number"
                placeholder="Qty"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step="any"
                className="text-sm h-9 bg-background border-input"
              />
              <Input
                data-ocid="add_form.unit_input"
                placeholder="Unit (kg, pcs…)"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="text-sm h-9 bg-background border-input"
                autoComplete="off"
              />
              <div className="col-span-2 sm:col-span-1">
                {isCustomCategory ? (
                  <div className="flex gap-1.5">
                    <Input
                      placeholder="Custom category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="text-sm h-9 bg-background border-input flex-1"
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsCustomCategory(false);
                        setCustomCategory("");
                      }}
                      className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={category}
                    onValueChange={(val) => {
                      if (val === "__custom__") {
                        setIsCustomCategory(true);
                      } else {
                        setCategory(val);
                      }
                    }}
                  >
                    <SelectTrigger
                      data-ocid="add_form.category_select"
                      className="text-sm h-9 bg-background border-input"
                    >
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {getCategoryIcon(cat)} {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__">
                        ✏️ Custom category…
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </form>
        </section>

        {/* List */}
        <section>
          {isLoading && (
            <div
              data-ocid="list.loading_state"
              className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground"
            >
              <RefreshCw className="h-6 w-6 animate-spin text-primary/60" />
              <p className="text-sm">Loading your list…</p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <p className="text-sm text-destructive font-medium">
                Couldn't load your list.
              </p>
              <p className="text-xs text-muted-foreground">
                Check your connection and try again.
              </p>
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <motion.div
              data-ocid="list.empty_state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                <ShoppingBasket className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-display text-base font-semibold text-foreground">
                  Your list is empty
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first item above to get started
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
                <Leaf className="h-3 w-3 text-primary" />
                <span>Synced in real time for everyone</span>
              </div>
            </motion.div>
          )}

          {!isLoading && !isError && items.length > 0 && (
            <div className="space-y-5">
              <AnimatePresence mode="popLayout">
                {sortedCategories.map((cat) => (
                  <motion.section
                    key={cat}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Category header */}
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span className="text-base leading-none">
                        {getCategoryIcon(cat)}
                      </span>
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryColor(
                          cat,
                        )}`}
                      >
                        {cat}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">
                        {groupedItems[cat].filter((i) => !i.purchased).length}/
                        {groupedItems[cat].length}
                      </span>
                    </div>

                    {/* Items in category */}
                    <div className="space-y-1.5">
                      <AnimatePresence mode="popLayout">
                        {groupedItems[cat].map((item) => {
                          const itemIndex = flatItemIndex[item.id.toString()];
                          return (
                            <ItemRow
                              key={item.id.toString()}
                              item={item}
                              index={itemIndex}
                              onToggle={handleToggle}
                              onDelete={handleDelete}
                              isToggling={
                                togglePurchased.isPending &&
                                togglePurchased.variables === item.id
                              }
                              isDeleting={
                                deleteItem.isPending &&
                                deleteItem.variables === item.id
                              }
                            />
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.section>
                ))}
              </AnimatePresence>

              {purchasedCount > 0 && (
                <motion.div layout className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    {purchasedCount} item{purchasedCount === 1 ? "" : "s"}{" "}
                    purchased
                    {" · "}
                    <button
                      type="button"
                      onClick={handleClearPurchased}
                      className="text-primary hover:underline focus-visible:underline outline-none"
                    >
                      Clear all done
                    </button>
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";

actor {
  type ShoppingItem = {
    id : Nat;
    name : Text;
    quantity : ?Float;
    unit : ?Text;
    category : Text;
    purchased : Bool;
    createdAt : Int;
  };

  module ShoppingItem {
    public func compareByCategoryAndTime(item1 : ShoppingItem, item2 : ShoppingItem) : Order.Order {
      switch (Text.compare(item1.category, item2.category)) {
        case (#less) { #less };
        case (#greater) { #greater };
        case (#equal) {
          Int.compare(item1.createdAt, item2.createdAt);
        };
      };
    };
  };

  var currentId = 0;

  let shoppingItems = Map.empty<Nat, ShoppingItem>();

  public shared ({ caller }) func addItem(
    name : Text,
    quantity : ?Float,
    unit : ?Text,
    category : Text,
  ) : async ShoppingItem {
    let item : ShoppingItem = {
      id = currentId;
      name;
      quantity;
      unit;
      category;
      purchased = false;
      createdAt = Time.now();
    };

    shoppingItems.add(currentId, item);
    currentId += 1;
    item;
  };

  public shared ({ caller }) func togglePurchased(id : Nat) : async ShoppingItem {
    switch (shoppingItems.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        let updatedItem = {
          id = item.id;
          name = item.name;
          quantity = item.quantity;
          unit = item.unit;
          category = item.category;
          purchased = not item.purchased;
          createdAt = item.createdAt;
        };
        shoppingItems.add(id, updatedItem);
        updatedItem;
      };
    };
  };

  public shared ({ caller }) func deleteItem(id : Nat) : async Bool {
    if (shoppingItems.containsKey(id)) {
      shoppingItems.remove(id);
      true;
    } else {
      false;
    };
  };

  public query ({ caller }) func getItems() : async [ShoppingItem] {
    shoppingItems.values().toArray().sort(ShoppingItem.compareByCategoryAndTime);
  };

  public shared ({ caller }) func clearPurchased() : async Nat {
    let originalSize = shoppingItems.size();

    let filteredItems = shoppingItems.toArray().filter(
      func((_, item)) { not item.purchased }
    );

    shoppingItems.clear();
    for ((id, item) in filteredItems.values()) {
      shoppingItems.add(id, item);
    };

    let newSize = shoppingItems.size();
    originalSize - newSize;
  };

  public shared ({ caller }) func updateItem(
    id : Nat,
    name : Text,
    quantity : ?Float,
    unit : ?Text,
    category : Text,
  ) : async ShoppingItem {
    switch (shoppingItems.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?existingItem) {
        let updatedItem = {
          id;
          name;
          quantity;
          unit;
          category;
          purchased = existingItem.purchased;
          createdAt = existingItem.createdAt;
        };
        shoppingItems.add(id, updatedItem);
        updatedItem;
      };
    };
  };
};

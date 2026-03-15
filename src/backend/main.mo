import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type ShoppingItem = {
    id : Nat;
    name : Text;
    quantity : ?Float;
    unit : ?Text;
    category : Text;
    purchased : Bool;
    createdAt : Int;
    addedBy : Principal;
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

  public query ({ caller }) func isAnonymous(caller : Principal) : async Bool {
    caller.isAnonymous();
  };

  public shared ({ caller }) func addItem(
    name : Text,
    quantity : ?Float,
    unit : ?Text,
    category : Text,
  ) : async ShoppingItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add items");
    };

    let item : ShoppingItem = {
      id = currentId;
      name;
      quantity;
      unit;
      category;
      purchased = false;
      createdAt = Time.now();
      addedBy = caller;
    };

    shoppingItems.add(currentId, item);
    currentId += 1;
    item;
  };

  public shared ({ caller }) func togglePurchased(id : Nat) : async ShoppingItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can toggle items");
    };

    switch (shoppingItems.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        let updatedItem = { item with purchased = not item.purchased };
        shoppingItems.add(id, updatedItem);
        updatedItem;
      };
    };
  };

  public shared ({ caller }) func deleteItem(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete items");
    };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can clear items");
    };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update items");
    };

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
          addedBy = existingItem.addedBy;
        };
        shoppingItems.add(id, updatedItem);
        updatedItem;
      };
    };
  };
};


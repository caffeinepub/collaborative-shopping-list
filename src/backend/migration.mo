import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldShoppingItem = {
    id : Nat;
    name : Text;
    quantity : ?Float;
    unit : ?Text;
    category : Text;
    purchased : Bool;
    createdAt : Int;
  };

  type OldActor = {
    shoppingItems : Map.Map<Nat, OldShoppingItem>;
    currentId : Nat;
  };

  type NewShoppingItem = {
    id : Nat;
    name : Text;
    quantity : ?Float;
    unit : ?Text;
    category : Text;
    purchased : Bool;
    createdAt : Int;
    addedBy : Principal;
  };

  type NewActor = {
    shoppingItems : Map.Map<Nat, NewShoppingItem>;
    currentId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newShoppingItems = old.shoppingItems.map<Nat, OldShoppingItem, NewShoppingItem>(
      func(_id, oldItem) {
        {
          id = oldItem.id;
          name = oldItem.name;
          quantity = oldItem.quantity;
          unit = oldItem.unit;
          category = oldItem.category;
          purchased = oldItem.purchased;
          createdAt = oldItem.createdAt;
          addedBy = Principal.anonymous();
        };
      }
    );
    {
      shoppingItems = newShoppingItems;
      currentId = old.currentId;
    };
  };
};


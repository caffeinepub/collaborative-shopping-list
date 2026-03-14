import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ShoppingItem {
    id: bigint;
    name: string;
    createdAt: bigint;
    unit?: string;
    purchased: boolean;
    quantity?: number;
    category: string;
}
export interface backendInterface {
    addItem(name: string, quantity: number | null, unit: string | null, category: string): Promise<ShoppingItem>;
    clearPurchased(): Promise<bigint>;
    deleteItem(id: bigint): Promise<boolean>;
    getItems(): Promise<Array<ShoppingItem>>;
    togglePurchased(id: bigint): Promise<ShoppingItem>;
    updateItem(id: bigint, name: string, quantity: number | null, unit: string | null, category: string): Promise<ShoppingItem>;
}

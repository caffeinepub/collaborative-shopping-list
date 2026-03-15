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
    addedBy: Principal;
    purchased: boolean;
    quantity?: number;
    category: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addItem(name: string, quantity: number | null, unit: string | null, category: string): Promise<ShoppingItem>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearPurchased(): Promise<bigint>;
    deleteItem(id: bigint): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getItems(): Promise<Array<ShoppingItem>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAnonymous(caller: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    togglePurchased(id: bigint): Promise<ShoppingItem>;
    updateItem(id: bigint, name: string, quantity: number | null, unit: string | null, category: string): Promise<ShoppingItem>;
}

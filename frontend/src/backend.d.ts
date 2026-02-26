import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HabitView {
    id: HabitId;
    created: Date_;
    executions: Array<Execution>;
    name: string;
}
export type HabitId = bigint;
export type Execution = bigint;
export type Date_ = bigint;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createHabit(name: string, created: Date_): Promise<HabitId>;
    deleteHabit(id: HabitId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHabit(id: HabitId): Promise<HabitView>;
    getHabits(): Promise<Array<[HabitId, HabitView]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markComplete(id: HabitId, date: Date_): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unmarkComplete(id: HabitId, date: Date_): Promise<void>;
}

import type { Readable } from "svelte/store";

export type CustomStore<State, Actions> = Readable<State> & Actions;
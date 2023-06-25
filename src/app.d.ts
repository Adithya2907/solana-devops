// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { InfoState } from "$lib//types/info.cookie";

declare global {
	namespace App {
		interface Locals {
			info?: InfoState;
		}
	}
}

export { };

/// <reference types="@sveltejs/kit" />
/// <reference types="unplugin-icons/types/svelte" />
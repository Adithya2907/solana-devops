<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';

	import { enhance } from '$app/forms';

	import { invalidate } from '$app/navigation';

	import ChevronDown from '~icons/carbon/chevron-down';

	import Frame from '$lib/components/frame.svelte';
	import Button from '$lib/components/button.svelte';
	import Search from '$lib/components/search.svelte';
	import Repo from '$lib/components/repo.svelte';
	import Deploy from '$lib/components/deploy.svelte';

	export let data: PageData;

	let tokenform: HTMLFormElement;

	onMount(async () => {
		if (data.userCookie.authenticating) {
			tokenform.submit();
		}

		invalidate('/');
	});
</script>

{#if !data.userCookie.authenticated}
	{#if data.userCookie.authenticating}
		<p>Authenticating...</p>
		<form bind:this={tokenform} method="POST" action="?/token" use:enhance />
	{/if}
{:else}
	<div class="content">
		<Frame id="projects" heading="Projects">
			<Button slot="cta">
				Add New...
				<ChevronDown slot="icon-right" />
			</Button>
			<Search slot="search" />
			{#each data.repos as repo}
				<Repo {repo} />
			{/each}
		</Frame>
		<Frame id="deploys" heading="Deploys">
			{#each data.deploys as deploy}
				<Deploy {deploy} />
			{/each}
		</Frame>
		<Frame id="builds" heading="Builds">
			{#each data.builds as build}
				<Deploy deploy={build} />
			{/each}
		</Frame>
	</div>
{/if}

<style>
	.content {
		width: 100%;
		padding: 25px 120px;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-rows: repeat(2, minmax(0, 1fr));
		gap: 15px;
	}

	:global(.content > #projects) {
		grid-column: 1 / 3;
		grid-row: 1 / 2;
	}

	:global(.content > #deploys) {
		grid-column: 1 / 2;
		grid-row: 2 / 3;
	}

	:global(.content > #builds) {
		grid-column: 2 / 3;
		grid-row: 2 / 3;
	}
</style>

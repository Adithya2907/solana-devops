<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';

	import { enhance } from '$app/forms';

	import { PUBLIC_GITHUB_ACCESS_URL } from '$env/static/public';
	import { invalidate } from '$app/navigation';
	
	import Header from '$lib/components/header.svelte';

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
		<div class="grid grid--1-col">
			<h2>Installed Repos</h2>
			<div class="line thick" />
			{#if data.user?.repos}
				<ul>
					{#each data.user?.repos as repo}
						<li><a href="/repo/{repo.name}">{repo.name}</a></li>
					{/each}
				</ul>
			{/if}
		</div>
		<span>Can't find your repo?</span>
		<a href={PUBLIC_GITHUB_ACCESS_URL}> Configure access here </a>
	</div>
{/if}

<style>
	h2 {
		padding-left: 20px;
		font-size: 1.5rem;
	}

	li {
		margin-bottom: 20px;
	}
</style>

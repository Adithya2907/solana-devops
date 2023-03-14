<script lang="ts">
	import './styles.css';
	import type { PageData } from './$types';

	import { Octokit } from 'octokit';

	import { onMount } from 'svelte';

	import { enhance } from '$app/forms';

	import { user } from '$lib/stores/user.store';
	import Header from './components/header.svelte';

	export let data: PageData;

	let tokenform: HTMLFormElement;

	let installations = [];
	let repos = [];

	onMount(async () => {
		if (data.userCookie.authenticating) {
			tokenform.submit();
		}

		if (data.userCookie.authenticated && $user === null) {
			const octokit = new Octokit({
				auth: 'Bearer ' + data.userCookie.token
			});

			user.initialize(data.userCookie.token!, data.info!, octokit);
		}

		let response = await $user?.octokit.rest.apps.listInstallationsForAuthenticatedUser();
		installations =
			response?.data.installations.filter(
				(installation) => installation.account?.id === $user?.id
			) ?? [];

		let x = await $user?.octokit.rest.apps.listInstallationReposForAuthenticatedUser({
			installation_id: installations[0].id
		});
		repos = x?.data.repositories ?? [];
	});
</script>

{#if !data.userCookie.authenticated}
	{#if data.userCookie.authenticating}
		<p>Authenticating...</p>
		<form bind:this={tokenform} method="POST" action="?/token" use:enhance />
	{:else}
		<form method="POST" action="?/login">
			<button type="submit">Login with github</button>
		</form>
	{/if}
{:else}
	<Header {data} />
	<div class="content">
		<div class="grid grid--1-col">
			<h2>Installed Repos</h2>
			<div class="line thick"></div>
			{#if data.user?.repos}
			<ul>
				{#each data.user?.repos as repo}
				<li><a href="/repo/{repo.name}">{repo.name}</a></li>
				{/each}
			</ul>
			{/if}
		</div>
			<span>Can't find your repo?</span>
			<a href="https://www.github.com/apps/sidharth-anand-ghat/installations/new">
				Configure access here
			</a>
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
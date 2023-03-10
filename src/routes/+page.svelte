<script lang="ts">
	import './styles.css';
	import type { PageData } from './$types';

	import { Octokit } from 'octokit';

	import { onMount } from 'svelte';

	import { enhance } from '$app/forms';

	import { user } from '$lib/stores/user.store';

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
	<p>Logged in as <b>{data.info?.login}</b></p>
	<form method="POST" action="?/logout">
		<button type="submit">Logout</button>
	</form>

	<p>Installed Repos</p>
	{#if data.user?.repos}
		<ul>
			{#each data.user?.repos as repo}
				<li><a href="/repo/{repo.name}">{repo.name}</a></li>
			{/each}
		</ul>
	{/if}

	<p>Can't find your repo?</p>
	<a href="https://www.github.com/apps/sidharth-anand-ghat/installations/new">
		Configure access here
	</a>
{/if}

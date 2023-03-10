<script lang="ts">
	import type { PageData } from './$types';

	import type { Build } from '@prisma/client';

	import { enhance } from '$app/forms';

	export let data: PageData;

	const listeners = data.repo?.listeners;
	const builds = listeners?.reduce<Build[]>((acc, listener) => {
		return [...acc, ...listener.builds];
	}, []);
</script>

<p>Details for repo: {data.repo?.name}</p>

<p>Branches:</p>
<ul>
	{#each data.branches as branch}
		<li>
			{branch.name}
		</li>
	{/each}
</ul>

{#if data.repo}
	<p>Listeners</p>
	<ul>
		{#each data.repo.listeners as listener}
			<li>{listener.branch} on {listener.type}</li>
		{/each}
	</ul>
{/if}

{#if builds}
	<p>Builds</p>
	<ul>
		{#each builds as build}
			<li>
				<a href="/repo/{data.repo?.name}/build/{build.id}">Build {build.id}</a>
			</li>
		{/each}
	</ul>
{/if}

<p>Add Listener</p>
<form method="POST" action="?/listener:add" use:enhance>
	<label>Branch: </label>
	<select name="branch" placeholder="Choose branch">
		{#each data.branches as branch}
			<option value={branch.name}>{branch.name}</option>
		{/each}
	</select>
	<br />
	<label>Event</label>
	<select name="type">
		<option value="PULL_REQUEST">Push</option>
		<option value="PUSH">Pull Request</option>
	</select>
	<br />
	<input checked name="autodeploy" type="checkbox" />
	<label>Auto deploy</label>
	<br />
	<label>Deploy Target: </label>
	<select name="deploytarget">
		<option value="DEV">devnet</option>
		<option value="TEST">testnet</option>
		<option value="PROD">mainnet</option>
	</select>
	<input name="repoID" class="hidden" type="number" value={data.repo?.id} />
	<br /><button type="submit">Create</button>
</form>

<style>
	form {
		width: 25%;
		padding: 25px;
		border: 1px solid black;
	}

	input.hidden {
		display: none;
	}
</style>

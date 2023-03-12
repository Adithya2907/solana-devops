<script lang="ts">
	import type { PageData } from './$types';

	import type { Build, Deploy } from '@prisma/client';

	import { enhance } from '$app/forms';

	export let data: PageData;

	const listeners = data.repo?.listeners;

	const builds = listeners?.reduce<Build[]>((acc, listener) => {
		return [...acc, ...listener.builds];
	}, []);
	const deploys = listeners?.reduce<Deploy[]>((acc, listener) => {
		return [...acc, ...listener.deploys];
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

{#if deploys}
	<p>Deploys</p>
	<ul>
		{#each deploys as deploy}
			<li>
				<a href="/repo/{data.repo?.name}/deploy/{deploy.id}">Deploy {deploy.id}</a>
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
		<option value="PUSH">Push</option>
		<option value="PULL_REQUEST">Pull Request</option>
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
	<br>
	<input checked name="deployfe" type="checkbox" />
	<label>Deploy frontend</label>
	<br>
	<label>Frontend Deploy Plugin</label>
	<select name="feplugin" placeholder="netlify">
		<option value="netlify">Netlify</option>
		<option value="vercel" disabled>Vercel</option>
	</select>
	<br>
	<label>Frontend Deploy Target</label>
	<input name="fetarget" type="text" placeholder="site name" />
	<br>
	<label>Plugin API Key</label>
	<input name="fekey" type="text" placeholder="API key">
	<br>
	<label>Frontend Directory</label>
	<input name="fedir" value="app">
	<br>
	<label>Frontend IDL Directory</label>
	<input name="feidl" value="app/idl">
	<br>
	<label>Frontend Build Command <small>Use {"{{cluster}}"} to get cluster</small></label>
	<input name="febuild" value="npm run build">
	<br>
	<label>Frontend Build Directory</label>
	<input name="feoutput" value="app/build">
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

<script lang="ts">
	import type { PageData } from './$types';

	import type { Build, Deploy } from '@prisma/client';

	import { enhance } from '$app/forms';
	import Header from '../../components/header.svelte';

	export let data: PageData;

	const listeners = data.repo?.listeners;

	const builds = listeners?.reduce<Build[]>((acc, listener) => {
		return [...acc, ...listener.builds];
	}, []);
	const deploys = listeners?.reduce<Deploy[]>((acc, listener) => {
		return [...acc, ...listener.deploys];
	}, []);

</script>

<Header />
<div class="content">

	<h1>{data.repo?.name}</h1>

	<div class="grid-repo grid--2-cols">

		<div class="detail">

			<h2>Branches</h2>
			<div class="line"></div>
			<ul>
				{#each data.branches as branch}
				<li>
					<i class='fas fa-code-branch'></i>
					{branch.name}
				</li>
				{/each}
				{#if data.branches.length == 0} 
				<p class="text-center">Nothing yet!</p>
			{/if}
			</ul>
		</div>
		<div class="detail">

			{#if data.repo}
			<h2>Listeners</h2>
			<div class="line"></div>
			<ul>
				{#each data.repo.listeners as listener}
				
				<li><i class="fa-solid fa-ear-listen"></i>{listener.branch} on {listener.type}</li>
				{/each}
				{#if data.repo.listeners.length == 0} 
				<p class="text-center">Nothing yet!</p>
			{/if}
			</ul>
			{/if}
		</div>
<div class="detail">

	{#if builds}
	<h2>Builds</h2>
	<div class="line"></div>
		<ul>
			{#each builds as build}
			<li>
				<i class="fa-solid fa-gear"></i>
					<a href="/repo/{data.repo?.name}/build/{build.id}">Build {build.id}
					<i class="fa-solid fa-up-right-from-square"></i></a>
				</li>
				{/each}
				{#if builds.length == 0} 
				<p class="text-center">Nothing yet!</p>
			{/if}
			</ul>
	{/if}

</div>
<div class="detail">

	{#if deploys}
	<h2>Deploys</h2>
	<div class="line"></div>
	<ul>
			{#each deploys as deploy}
			<li>
				<i class="fa-solid fa-truck"></i>
				<a href="/repo/{data.repo?.name}/deploy/{deploy.id}">Deploy {deploy.id}</a>
				</li>
			{/each}
			{#if deploys.length == 0} 
				<p class="text-center">Nothing yet!</p>
			{/if}
		</ul>
		{/if}
	</div>
	</div>

	<h2 style="margin-top: 80px;">Add a new Listener</h2>
	<form method="POST" action="?/listener:add" use:enhance>
		<label>Branch</label>
		<select name="branch" placeholder="Choose branch">
			{#each data.branches as branch}
				<option value={branch.name}>{branch.name}</option>
			{/each}
		</select>
		<label>Event</label>
		<select name="type">
			<option value="PUSH">Push</option>
			<option value="PULL_REQUEST">Pull Request</option>
		</select>
		
		<label >Auto deploy</label>
		<select name="deploytarget">
			<option value="DEV">devnet</option>
			<option value="TEST">testnet</option>
			<option value="PROD">mainnet</option>
		</select>
		<label>Deploy Target: </label>
		
		
	
		<select name="feplugin" placeholder="netlify">
			<option value="netlify">Netlify</option>
			<option value="vercel" disabled>Vercel</option>
		</select>
		<label>Frontend Deploy Target</label>
		<input name="fetarget" type="text" placeholder="site name" />
		<label>Plugin API Key</label>
		<input name="fekey" type="text" placeholder="API key">
		<label>Frontend Directory</label>
		<input name="fedir" value="app">
		<label>Frontend IDL Directory</label>
		<input name="feidl" value="app/idl">
		<label>Frontend Build Command <small>Use {"{{cluster}}"} to get cluster</small></label>
		<input name="febuild" value="npm run build">
		<label>Frontend Build Directory</label>
		<input name="feoutput" value="app/build">
		<input name="repoID" class="hidden" type="number" value={data.repo?.id} />

			<label>Deploy frontend</label>
			<input checked name="deployfe" type="checkbox" />

			<label>Frontend Deploy Plugin</label>
			<input checked name="autodeploy" type="checkbox" />
		<button class="create" type="submit">Create</button>
	</form>
</div>

<style>
	form {
		width: 25%;
		padding: 25px;
		border: 1px solid black;
	}

	input.hidden {
		display: none;
	}

	.grid-repo {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 30px;
		justify-content: space-between;
	}

	.detail {
		background: var(--solana-secondary);
		
		border-radius: 10px;
		padding: 20px;
	}

	h2 {
		font-size: 1.5rem;
	}

	.grid-repo li {
		margin-bottom: 10px;
	}

	.grid-repo a {
		color: var(--solana-accent);
	}

	.fa-code-branch {
		color: var(--solana-accent);
		margin-right: 10px;
	}


	.fa-solid {
		color: var(--solana-accent);
		margin-right: 10px;
	}
	.fa-up-right-from-square {
		margin-left: 5px;
	}

	.text-center {
		margin: 0;
		padding: 0;
	}

	form {
		width: 100%;
		background: var(--solana-secondary);
		border: none;
		margin-bottom: 30px;
		border-radius: 10px;
	}

	form {
		display: grid;
		grid-template-columns: 1fr 7fr;
		align-items: center;
	}

	form select {
		background: var(--solana-secondary);
		border: 1px solid var(--solana-grey);
		color: white;
		padding: 10px;
		border-radius: 8px;
		height: 40px;
		margin-bottom: 10px;
	}

	form input {
		background: var(--solana-secondary);
		border: 1px solid var(--solana-grey);
		color: white;
		padding: 10px;
		border-radius: 8px;
		height: 40px;
		margin-bottom: 10px;
	}

	select:focus {
		outline: 1px solid var(--solana-accent);
		border: 1px solid transparent;
	}

	input:focus:not([type="checkbox"]) {
		outline: 1px solid var(--solana-accent);
		border: 1px solid transparent;
	}

	form label {
		margin-bottom: 5px;
	}

	button {
        background: var(--solana-accent);
        border: none;
        outline: none;
        padding: 15px;
        color: #1b4e3f;
        border-radius: 8px;
        transition: all 0.3s;
        margin-bottom: 10px;
        margin-top: 30px;
    }

    button:hover{
        background: #19b784;
        color: white;
        cursor: pointer;
    }
</style>

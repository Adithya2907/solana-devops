<script lang="ts">
	import type { PageData } from './$types';

	import Header from '../../../../components/header.svelte';

	export let data: PageData;
</script>

<Header />
<div class="content">
	<div class="back">
		<a href="/repo/{data.repo.name}">
			<i class="fa-solid fa-arrow-left-long" style="margin-right: 10px" />Back
		</a>
	</div>
	<h1>Deploy</h1>
	<div class="wrapper">
		<div class="left">
			<div class="grid-item">
				<h2>
					<i class="fa-solid fa-magnifying-glass" />

					Status
				</h2>
				<p>{data.deploy.status}</p>
			</div>
			<div class="grid-item">
				<h2>
					<i class="fa-solid fa-file" />
					Conclusion
				</h2>
				<p>{data.deploy.conclusion}</p>
			</div>
			<div class="grid-item">
				<h2>
					<i class="fa-solid fa-fingerprint" />
					Type
				</h2>
				<p>{data.deploy.listener.type}</p>
			</div>
			<div class="grid-item">
				<h2>
					<i class="fa-solid fa-clock" />
					Deployed
				</h2>
				<p>{data.deploy.deployed}</p>
			</div>
			{#if data.deploy.idls}
				<p class="m-0">Programs</p>
				<ul>
					{#each data.deploy.idls as idl}
						<li>{idl.program} - <a href="/idl/{idl.id}/test">Test your program here!</a></li>
					{/each}
				</ul>
			{/if}
			<p class="m-0">
				{#if data.deploy.listener.type == 'PULL_REQUEST'}
					<a href="{data.repo.url}/issues/{data.deploy.build.issue}">
						<i class="fa-solid fa-arrow-up-right-from-square" />

						View on github</a
					>
				{/if}
			</p>
			<p class="m-0">
				{#if data.deploy.build}
					<a href="/repo/{data.repo.name}/build/{data.deploy.build.id}"
						><i class="fa-solid fa-arrow-up-right-from-square" /> Build</a
					>
				{/if}
			</p>
		</div>
		<div class="right">
			<h2>Deploy logs</h2>
			{#if data.log}
				<p>Backed Deploy log</p>
				<pre>
					{#each data.log as line}
						{line}
					{/each}
				</pre>
			{/if}
			{#if data.felog}
				<p>Frontend Deploy log</p>
				<pre>
		{#each data.felog as line}
						{line}
					{/each}
	</pre>
			{/if}
		</div>
	</div>
</div>

<style>
	.m-0,
	ul {
		margin: 0;
	}
	.back {
		color: var(--solana-accent);
	}
	h2 {
		font-size: 1.5rem;
	}
	p {
		color: var(--solana-accent);
	}
	pre {
		background: transparent;
		outline: none;
		border: none;
		box-shadow: none;
		color: white;
		white-space: pre-wrap;
		max-height: 40vh;
		width: 100%;
		overflow: scroll;
	}

	.grid-item h2 .fa-solid {
		margin-right: 10px;
		margin-left: 5px;
	}

	.content {
		width: 80% !important;
	}

	.wrapper {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.left {
		display: grid;
		grid-template-columns: 1fr;
		gap: 20px;
	}

	.right {
		border: 1px solid var(--solana-grey);
		padding-left: 5px;
	}

	.grid-item {
		border: 1px solid var(--solana-grey);
		border-radius: 8px;
		padding-left: 10px;
	}
</style>

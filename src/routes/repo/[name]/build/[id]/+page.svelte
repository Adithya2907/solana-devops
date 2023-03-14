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
	<h1>Build</h1>
	<div class="wrapper">
		<div class="left">
			<div class="grid-item">
				<h2>
					<i class="fa-solid fa-magnifying-glass" />

					Status
				</h2>
				<p>{data.build.status}</p>
			</div>
			<div class="grid-item">
				<h2>
					<i class="fa-solid fa-file" />
					Conclusion
				</h2>
				<p>{data.build.conclusion}</p>
			</div>
			<div class="grid-item">
				<h2>
					<i class="fa-solid fa-fingerprint" />
					Type
				</h2>
				<p>{data.build.listener.type}</p>
			</div>
			<div class="grid-item">
				<h2>
					<i class="fa-solid fa-clock" />
					Started
				</h2>
				<p>{data.build.started}</p>
			</div>
			<div class="grid-item">
				<h2>
					<i class="fa-solid fa-flag-checkered" />
					Ended
				</h2>
				<p>{data.build.ended}</p>
			</div>

			<p>
				{#if data.build.listener.type == 'PULL_REQUEST'}
					<a href="{data.repo.url}/issues/{data.build.issue}">
						<i class="fa-solid fa-arrow-up-right-from-square" />

						View on github</a
					>
				{/if}
			</p>
			{#if data.build.idls}
				<p class="m-0">Programs</p>
				<ul>
					{#each data.build.idls as idl}
						<li>{idl.program} - <a href="/idl/{idl.id}/docs">View Documentation</a></li>
					{/each}
				</ul>
			{/if}
			{#if data.build.deploys}
				<p class="m-0">Deploys</p>
				<ul>
					{#each data.build.deploys as deploy}
						<li>
							<a href="/repo/{data.repo.name}/deploy/{deploy.id}">
								<i class="fa-solid fa-arrow-up-right-from-square" />
								Deploy {deploy.id}</a
							>
							- {deploy.status} ({deploy.conclusion})
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<div class="right">
			<h2>Build logs</h2>
			{#if data.log}
				<pre>
					{#each data.log as line}
						{line}
					{/each}
				</pre>
			{/if}
		</div>
	</div>
</div>

<style>
	.m-0, ul {
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
		max-height: 60vh;
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

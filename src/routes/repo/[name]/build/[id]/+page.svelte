<script lang="ts">
	import type { PageData } from './$types';
	import { ListenerType } from '@prisma/client';
	import Header from '../../../../components/header.svelte';

	export let data: PageData;
</script>

<Header/>
<div class="content">
	<div class="back">
		<a href="/repo/{data.repo.name}">
			<i class="fa-solid fa-arrow-left-long" style="margin-right: 10px"></i>Back
		</a>
	</div>
	<h1>Build</h1>
	<div class="wrapper">
		<div class="left">

			<div class="grid-item">
				<h2>
				<i class="fa-solid fa-magnifying-glass"></i>
					
					Status</h2>
				<p>{data.build.status}</p>
			</div>
			<div class="grid-item">

				<h2>
					<i class="fa-solid fa-file"></i>
					Conclusion</h2>
				<p>{data.build.conclusion}</p>
			</div>
			<div class="grid-item">

				<h2>
					<i class="fa-solid fa-fingerprint"></i>
					Type</h2>
				<p>{data.build.listener.type}</p>
			</div>
			<div class="grid-item">

				<h2>
					<i class="fa-solid fa-clock"></i>
					Started</h2>
				<p>{data.build.started}</p>
			</div>
			<div class="grid-item">

				<h2>
					<i class="fa-solid fa-flag-checkered"></i>
					Ended</h2>
				<p>{data.build.ended}</p>
			</div>
			

			<p>
				{#if data.build.listener.type == ListenerType.PULL_REQUEST}
					<a href="{data.repo.url}/issues/{data.build.issue}">
				<i class="fa-solid fa-arrow-up-right-from-square"></i>
						
						View on github</a>
				{/if}
			</p>
			{#if data.build.idls}
				<a href="/{data.repo.name}/docs">
				<i class="fa-solid fa-arrow-up-right-from-square"></i>
					
					Programs</a>
				{#each data.build.idls as idl}
					<p>
						{idl.program} - <a href="/idl/{idl.id}">View Documentation</a>
					</p>
				{/each}
			{/if}
			{#if data.build.deploys}
				<p>Deploys</p>
				{#each data.build.deploys as deploy}
					<p>
						<i class="fa-solid fa-up-right-from-square"></i>
						<a href="/repo/{data.repo.name}/deploy/{deploy.id}">
							<i class="fa-solid fa-arrow-up-right-from-square"></i>
							Deploy {deploy.id}</a> - {deploy.status} ({deploy.conclusion})
					</p>
				{/each}
			{/if}
			<p>
				{#if data.build.listener.type == ListenerType.PULL_REQUEST}{/if}
			</p>
		</div>
		<div class="right">

			{#if data.log}
				<p>Build logs</p>
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
		background: black;
		color: white;
		white-space: pre-wrap;
		height: 200px;
		width: 50%;
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
		border: 2px solid grey;
	}

	.grid-item {
		border: 1px solid var(--solana-grey);
		border-radius: 8px;
		padding-left: 10px;
	}
</style>

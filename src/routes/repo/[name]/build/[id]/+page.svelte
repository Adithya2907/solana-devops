<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Build</h1>
<p>Status: {data.build.status}</p>
<p>Conclusion: {data.build.conclusion}</p>
<p>Type: {data.build.listener.type}</p>
<p>Started: {data.build.started}</p>
<p>Ended: {data.build.ended}</p>
<p>
	{#if data.build.listener.type == 'PULL_REQUEST'}
		<a href="{data.repo.url}/issues/{data.build.issue}">View on github</a>
	{/if}
</p>
{#if data.build.idls}
	<p>Programs</p>
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
			<a href="/repo/{data.repo.name}/deploy/{deploy.id}">Deploy {deploy.id}</a> - {deploy.status} ({deploy.conclusion})
		</p>
	{/each}
{/if}
{#if data.log}
	<p>Build logs</p>
	<pre>
		{#each data.log as line}
			{line}
		{/each}
	</pre>
{/if}

<style>
	pre {
		background: black;
		color: white;
		white-space: pre-wrap;
		height: 200px;
		width: 50%;
		overflow: scroll;
	}
</style>

<script lang="ts">
	import type { PageData } from './$types';
	import { ListenerType } from '@prisma/client';

	export let data: PageData;
</script>

<h1>Deploy</h1>
<p>Status: {data.deploy.status}</p>
<p>Conclusion: {data.deploy.conclusion}</p>
<p>Type: {data.deploy.listener.type}</p>
<p>Deployed: {data.deploy.deployed}</p>
<p>
	{#if data.deploy.listener.type == ListenerType.PULL_REQUEST}
		<a href="{data.repo.url}/issues/{data.deploy.build.issue}">View on github</a>
	{/if}
</p>
<p><a href="/repo/{data.repo.name}/build/{data.deploy.build.id}">Build</a></p>
{#if data.log}
	<p>Build logs</p>
	<pre>
		{#each data.log as line}
			{line}
		{/each}
	</pre>
{/if}
{#if data.deploy.idls}
	<p>Programs</p>
	{#each data.deploy.idls as idl}
		<p>
			{idl.program} - <a href="/idl/{idl.id}">View Documentation</a>
		</p>
	{/each}
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
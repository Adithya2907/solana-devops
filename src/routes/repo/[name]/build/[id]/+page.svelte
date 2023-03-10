<script lang="ts">
	import type { PageData } from './$types';
	import { ListenerType } from '@prisma/client';

	export let data: PageData;
</script>

<h1>Build</h1>
<p>Status: {data.build.status}</p>
<p>Conclusion: {data.build.conclusion}</p>
<p>Type: {data.build.listener.type}</p>
<p>Started: {data.build.started}</p>
<p>Ended: {data.build.ended}</p>
<p>
	{#if data.build.listener.type == ListenerType.PULL_REQUEST}
		<a href="{data.repo.url}/issues/{data.build.issue}">View on github</a>
	{/if}
</p>
<p>
	{#if data.build.listener.type == ListenerType.PULL_REQUEST}{/if}
</p>
<p>Build logs</p>
<pre>
	{#each data.log as line}
		{line}
	{/each}
</pre>

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

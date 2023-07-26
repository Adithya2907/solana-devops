<script lang="ts">
	import type { IDL } from '@prisma/client';

	import { slide } from 'svelte/transition';

	import { mapBuild, mapDeploy } from '$lib/mappers';

	import { Accordion } from 'teil-ui';

	import DetailsItem from './detailsitem.svelte';
	import Deploy from './deploy.svelte';

	export let log: string | undefined | null;
	export let build: boolean = false;
	export let duration: string = '';
	export let programs: Array<IDL>;
	export let linked:
		| Array<NonNullable<Parameters<typeof mapBuild>[0]>>
		| Array<NonNullable<Parameters<typeof mapDeploy>[0]>>;

	const title = build ? 'Build' : 'Deploy';
</script>

<Accordion.Container class="accordion__container details">
	<DetailsItem value="logs" title="{title} Logs" status="complete" info={duration} override={!!log}>
		{#if log}
			<pre>{log}</pre>
		{:else}
			Logs are unavailable for this build
		{/if}
	</DetailsItem>
	<DetailsItem value="summary" title="{title} Summary">
		Summaries for builds are not a publicly available feature yet
	</DetailsItem>
	<DetailsItem value="programs" title="Programs" override={programs.length > 0}>
		{#if programs.length > 0}
			<div class="text" transition:slide>
				{#each programs as idl}
					<span>{idl.program}</span> - <a href="/app/documentation">View documentation</a>
				{/each}
			</div>
		{:else}
			This build does not have any assosciated IDL files or programs
		{/if}
	</DetailsItem>
	<DetailsItem
		value="linked"
		title={build ? 'Deployments' : 'Linked Build'}
		override={linked.length > 0}
	>
		{#if linked.length > 0}
			<div transition:slide>
				{#each linked as data}
                {@debug data}
					<Deploy deploy={build ? mapDeploy(data) : mapBuild(data)} />
				{/each}
			</div>
		{:else if build}
			This build does not have any linked deployments
		{:else}
			Could not locate the assosciated build for this deployment
		{/if}
	</DetailsItem>
</Accordion.Container>

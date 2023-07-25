<script lang="ts">
	import type { PageData } from './$types';

	import {slide} from 'svelte/transition';

	import { mapBuild, mapListener, mapDeploy } from '$lib/mappers';

	import RightArrowIcon from '~icons/ri/arrow-right-s-line';
	import CompleteIcon from '~icons/ri/checkbox-circle-fill';
	import InfoIcon from '~icons/ri/information-fill';

	import { Accordion } from 'teil-ui';

	import Summary from '$lib/components/summary.svelte';
	import Deploy from '$lib/components/deploy.svelte';

	export let data: PageData;
</script>

<div class="page">
	<div class="summary">
		<Summary
			deploy={mapBuild(data.build)}
			listener={mapListener(data.build.listener, null)}
			repo={data.build.listener?.project.repo.fullname ?? ''}
			user={data.user?.login ?? ''}
			message={data.message ?? ''}
		/>
	</div>
	<div class="header">
		<h3>Build Summary</h3>
	</div>
	<div class="details">
		<Accordion.Container class="accordion__container details">
			<Accordion.Item value="logs" class="accordion__item">
				<Accordion.Trigger class="accordion__trigger">
					<div class="title">
						<RightArrowIcon></RightArrowIcon>
						<span>Build Logs</span>
					</div>
					<div class="info success">
						<span>36s</span>
						<CompleteIcon></CompleteIcon>
					</div>
				</Accordion.Trigger>
				<Accordion.Content class="accordion__content">
					{#if data.log}
						<pre>{data.log}</pre>
					{:else}
						<div class="text none" transition:slide>Logs are unavailable for this build</div>
					{/if}
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="summary" class="accordion__item">
				<Accordion.Trigger class="accordion__trigger">
					<div class="title">
						<RightArrowIcon></RightArrowIcon>
						<span>Build Summary</span>
					</div>
					<div class="info">
						<InfoIcon></InfoIcon>
					</div>
				</Accordion.Trigger>
				<Accordion.Content class="accordion__content">
					<div class="text none" transition:slide>Summaries for builds are not a publicly available feature yet.</div>
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="programs" class="accordion__item">
				<Accordion.Trigger class="accordion__trigger">
					<div class="title">
						<RightArrowIcon></RightArrowIcon>
						<span>Programs</span>
					</div>
					<div class="info">
						<InfoIcon></InfoIcon>
					</div>
				</Accordion.Trigger>
				<Accordion.Content class="accordion__content">
					{#if data.idls.length > 0}
						{#each data.idls as idl}
							<div class="text" transition:slide>
								<span>{idl.program}</span> - <a href="/app/documentation">View documentation</a>
							</div>
						{/each}
					{:else}
						<div class="text none" transition:slide>This build does not have any assosciated IDL files</div>
					{/if}
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="deployments" class="accordion__item">
				<Accordion.Trigger class="accordion__trigger">
					<div class="title">
						<RightArrowIcon></RightArrowIcon>
						<span>Deployments</span>
					</div>
					<div class="info">
						<InfoIcon></InfoIcon>
					</div>
				</Accordion.Trigger>
				<Accordion.Content class="accordion__content">
					{#if data.deploys.length > 0}
						{#each data.deploys as deploy}
							<div transition:slide>
								<Deploy deploy={mapDeploy({
									...deploy,
									listener: data.build.listener,
									build: data.build
								})}></Deploy>
							</div>
						{/each}
					{:else}
						<div class="text none" transition:slide>This build does not have any assosciated deployments</div>
					{/if}
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Container>
	</div>
</div>

<style>
	.page {
		width: 100%;
		padding: 25px 120px;
	}

	.header {
		border-bottom: 1px solid var(--line-color);
		margin: 30px 0;
		padding-bottom: 5px;
	}

	.header h3 {
		font-size: 30px;
		font-weight: bold;
		margin: 0;
	}

	.summary {
		max-width: 75%;
	}
</style>

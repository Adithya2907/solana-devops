<script lang="ts">
	import type { PageData } from './$types';

	import { mapDeploy, mapListener } from '$lib/mappers';

	import Summary from '$lib/components/summary.svelte';
	import Details from '$lib/components/details.svelte';

	export let data: PageData;

	//TODO: Extract build and design pages to a layout and pass data back to the layout
</script>

<div class="page">
	<div class="summary">
		<Summary
			deploy={mapDeploy(data.deploy)}
			listener={mapListener(data.deploy.listener, null)}
			repo={data.deploy.listener?.project.repo.fullname ?? ''}
			user={data.user?.login ?? ''}
			message={data.message ?? ''}
		/>
	</div>
	<div class="header">
		<h3>Deployment Summary</h3>
	</div>
	<Details log={data.log} duration="36s" programs={data.idls} linked={[{
		...data.deploy.build,
		listener: data.deploy.listener
	}]}></Details>
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
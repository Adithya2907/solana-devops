<script lang="ts">
	import type { PageData } from './$types';


	import { mapBuild, mapListener, mapDeploy } from '$lib/mappers';

	import Summary from '$lib/components/summary.svelte';
	import Details from '$lib//components/details.svelte';

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
	<Details log={data.log} build duration="36s" programs={data.idls} linked={data.deploys.map(deploy => ({
		...deploy,
		listener: data.build.listener,
		build: data.build
	}))}></Details>
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

<script lang="ts">
	import type { ComponentProps } from 'svelte';

	import type { RepoDeploy } from '$lib/types/data';
	import { RepoStatus } from '$lib/types/data';

	import Badge from './badge.svelte';

	import BranchIcon from '~icons/ri/git-branch-fill';
    import ChevronRight from '~icons/ri/arrow-right-s-line';

	export let deploy: RepoDeploy;

	const StatusMap: Map<RepoStatus, Required<ComponentProps<InstanceType<typeof Badge>>>['state']> =
		new Map([
			[RepoStatus.SUCCESS, 'success'],
			[RepoStatus.NEUTRAL, 'warning'],
			[RepoStatus.FAILURE, 'error'],
			[RepoStatus.PROGRESS, 'info']
		]);
</script>

<div class="deploy">
	<div>
		<div class="title">
			<h3>{deploy.project}</h3>
			<span>&nbsp;#{deploy.id}</span>
		</div>
		<Badge state={StatusMap.get(deploy.status)}>
			{#if deploy.status === RepoStatus.NEUTRAL}
				Queued
			{:else}
				{deploy.status}
			{/if}
		</Badge>
		<div>
			<a href="https://github.com">{deploy.commit}</a>
			<span>&nbsp;on&nbsp;</span>
			<BranchIcon />
			<span>&nbsp;{deploy.branch}</span>
		</div>
		<span>{deploy.time}</span>
	</div>
    <ChevronRight></ChevronRight>
</div>

<style>
	.deploy {
		display: flex;
		padding: 15px;
		gap: 10px;
		height: 70px;
		width: 100%;
		align-items: center;
	}

	.deploy > div {
		display: flex;
		padding: 13px 0;
		gap: 40px;
		align-items: center;
        flex-grow: 1;
	}

	.deploy > div > div {
        display: flex;
        gap: 0;
        align-items: center;
    }

    .deploy a {
        font-size: 12px;
    }

	h3 {
		text-transform: capitalize;
		margin: 0;
		font-size: 15px;
		color: var(--white);
	}

	.deploy .title span {
		font-size: 15px;
		color: var(--gray-2);
		font-weight: 200;
	}

	.deploy span {
		font-size: 12px;
		color: var(--gray-2);
	}

    :global(.deploy svg) {
        width: 10px;
        height: 10px;
    }

    :global(.deploy > svg) {
        width: 15px;
        height: 15px;
    }
</style>

<script lang="ts">
	import type { ListenerInfo } from '$lib/types/data';

	import PRIcon from '~icons/ri/git-pull-request-line';
	import CommitIcon from '~icons/ri/git-commit-fill';
	import BranchIcon from '~icons/ri/git-branch-line';
	import DotsIcon from '~icons/mdi/dots-vertical';

	import Badge from './badge.svelte';

	export let listener: ListenerInfo;
</script>

<div class="listener">
	<div class="info">
		<div class="type">
			{#if listener.type === 'PULL_REQUEST'}
				<PRIcon />
			{:else}
				<CommitIcon />
			{/if}
			<span>{listener.type.replace('_', ' ').toLowerCase()}</span>
		</div>
		<div class="branch">
			<BranchIcon />
			<span>{listener.branch}</span>
		</div>
		<div class="time">
			{listener.time}
		</div>
		<div class="production">
			{#if listener.production}
				<Badge state="info">Production</Badge>
			{/if}
		</div>
	</div>
	<div class="menu">
		<DotsIcon />
	</div>
</div>

<style>
	.listener {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 15px;
	}

	.listener .info {
		display: flex;
		gap: 30px;
		align-items: center;
		flex: 1 1 90%;
	}

	.type,
	.branch {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.type {
		flex: 1 1 12%;
	}

	.branch, .time {
		flex: 1 1 5%;
	}

	:global(.type > svg, .branch > svg) {
		width: 18px;
		height: 18px;
		margin: 0;
		color: var(--gray-2);
	}

	.type > span,
	.branch > span {
		color: var(--white);
		font-size: 15px;
	}

	.type > span {
		text-transform: capitalize;
	}

	.time {
		font-size: 12px;
		font-weight: 300;
		color: var(--gray-2);
	}

	:global(.menu > svg) {
		color: var(--gray-2);
		width: 18px;
		height: 18px;
		margin: 0;
	}

	.production {
		flex: 1 1 5%;
	}
</style>

<script lang="ts">
	import { ProjectStatus } from '$lib/types/data';

	export let status: ProjectStatus = ProjectStatus.SUCCESS;

	const TextMap: Record<ProjectStatus, string> = {
		[ProjectStatus.SUCCESS]: 'Ready',
		[ProjectStatus.FAILURE]: 'Failed',
		[ProjectStatus.PROGRESS]: 'In Progress',
		[ProjectStatus.NEUTRAL]: 'Waiting'
	};
</script>

<div class="status">
	<span class="indicator {status}" />
	<span class="text">{TextMap[status]}</span>
</div>

<style>
	.status {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0;
	}

	.indicator {
        display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 100%;
		background-color: var(--indicator-color);
	}

	.indicator.success {
		--indicator-color: var(--green);
	}

	.indicator.failure {
		--indicator-color: var(--red);
	}

    .indicator.progress {
        --indicator-color: var(--yellow);
    }

    .indicator.neutral {
        --indicator-color: var(--blue);
    }

    .text {
        font-size: 12px;
        color: var(--white);
    }
</style>

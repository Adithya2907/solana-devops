<script lang="ts">
	import type { ProjectInfo } from '$lib/types/data';

	import GithubIcon from '~icons/ri/github-fill';
	import BranchIcon from '~icons/ri/git-branch-fill';
	import LinkIcon from '~icons/ri/link';
	import FileIcon from '~icons/ri/file-list-line';
	import ExternalLinkIcon from '~icons/ri/external-link-line';
	import DotsIcon from '~icons/mdi/dots-vertical';

	export let project: ProjectInfo;
</script>

<div class="repo">
	<GithubIcon />
	<div class="info">
		<div class="multiline">
			<a href="/app/project/{project.id}"><h3>{project.name}</h3></a>
			<p>{project.owner}/{project.name}</p>
		</div>
		<div class="multiline">
			<p>{project.commit.message}</p>
			<div>
				<span>{project.commit.time} on</span>
				<BranchIcon />
				<span>{project.commit.branch}</span>
			</div>
		</div>
		<div class="multiline">
			{#if project.deploy === null}
				<p>This project has not been deployed yet</p>
			{:else}
				<div>
					<span>Deployed&nbsp;</span>
					<span class="status-{project.deploy.status}">{project.deploy.commit}</span>
					<span>&nbsp;on</span>
					<BranchIcon />
					<span>{project.deploy.branch}</span>
				</div>
				<div>
					<span>{project.deploy.time}</span>
				</div>
			{/if}
		</div>
		<div class="multiline">
			{#if project.build === null}
				<p>The project has not been built yet</p>
			{:else}
				<div>
					<span>Build&nbsp;</span>
					<span class="status-{project.build.status}">
						{#if project.build.status === 'neutral'}
							in progress
						{:else}
							{project.build.status}
						{/if}
					</span>
					<span>&nbsp;on</span>
					<BranchIcon />
					<span>{project.build.branch}&nbsp;</span>
					<span>(<a href="https://github.com/{project.owner}/{project.name}/issues/{project.build.issue}">#{project.build.issue}</a>)</span>
				</div>
				<div>
					<span>{project.build.time}</span>
				</div>
			{/if}
		</div>
	</div>
	<div class="utils">
		<LinkIcon />
		<FileIcon />
		<ExternalLinkIcon />
		<DotsIcon />
	</div>
</div>

<style>
	.repo {
		height: 70px;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 15px;
		color: var(--white);
	}

	:global(.repo > svg) {
		width: 40px;
		height: 40px;
	}

	.info {
		display: flex;
		align-items: center;
		gap: 3px;
		padding: 0 16px;
		flex-grow: 1;
	}

	.utils {
		display: flex;
		align-items: center;
		justify-content: end;
		flex-grow: 1;
		gap: 10px;
		color: var(--gray-2);
	}

	.multiline {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}

	.multiline > a {
		color: var(--white);
	}

	.multiline > a > h3 {
		text-transform: capitalize;
		color: var(--white);
		margin: 0;
		font-size: 15px;
	}

	.multiline > p,
	.multiline > div > span {
		color: var(--gray-2);
		margin: 0;
		font-size: 13px;
		font-weight: 200;
	}

	.multiline > div {
		display: flex;
		align-items: center;
		color: var(--white);
	}

	:global(.multiline > div > svg) {
		width: 10px;
		height: 10px;
		margin: 2px 2px 0 2px;
	}

	:global(.utils > svg) {
		width: 20px;
		height: 20px;
		cursor: pointer;
	}

	:global(.utils > svg:hover) {
		color: var(--white);
	}

	.status-success {
		color: var(--green) !important;
	}

	.status-neutral {
		color: var(--blue) !important;
	}

	.status-failure {
		color: var(--red) !important;
	}
</style>

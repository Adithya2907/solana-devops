<script lang="ts">
	import type { RepoInfo } from '$lib/types/data';

	import GithubIcon from '~icons/ri/github-fill';
	import BranchIcon from '~icons/ri/git-branch-fill';
	import LinkIcon from '~icons/ri/link';
	import FileIcon from '~icons/ri/file-list-line';
	import ExternalLinkIcon from '~icons/ri/external-link-line';
	import DotsIcon from '~icons/mdi/dots-vertical';

	export let repo: RepoInfo;
</script>

<div class="repo">
	<GithubIcon />
	<div class="info">
		<div class="multiline">
			<h3>{repo.name.split('-').join(' ')}</h3>
			<p>{repo.owner}/{repo.name}</p>
		</div>
		<div class="multiline">
			<p>{repo.commit.message}</p>
			<div>
				<span>{repo.commit.time} on</span>
				<BranchIcon />
				<span>{repo.commit.branch}</span>
			</div>
		</div>
		<div class="multiline">
			{#if repo.deploy === null}
				<p>This project has not been deployed yet</p>
			{:else}
				<div>
					<span>Deployed&nbsp;</span>
					<span class="status-{repo.deploy.status}">{repo.deploy.commit}</span>
					<span>&nbsp;on</span>
					<BranchIcon />
					<span>{repo.deploy.branch}</span>
				</div>
				<div>
					<span>{repo.deploy.time}</span>
				</div>
			{/if}
		</div>
		<div class="multiline">
			{#if repo.build === null}
				<p>The project has not been built yet</p>
			{:else}
				<div>
					<span>Build&nbsp;</span>
					<span class="status-{repo.build.status}">
						{#if repo.build.status === 'neutral'}
							in progress
						{:else}
							{repo.build.status}
						{/if}
					</span>
					<span>&nbsp;on</span>
					<BranchIcon />
					<span>{repo.build.branch}&nbsp;</span>
					<span>(<a href="https://github.com/{repo.owner}/{repo.name}/issues/{repo.build.issue}">#{repo.build.issue}</a>)</span>
				</div>
				<div>
					<span>{repo.build.time}</span>
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

	.multiline > h3 {
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

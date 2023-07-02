<script lang="ts">
	import type { ActionData, PageData } from './$types';

	import { onMount } from 'svelte';

	import { enhance } from '$app/forms';

	import { invalidate } from '$app/navigation';

	import ChevronDown from '~icons/carbon/chevron-down';
	import PlusIcon from '~icons/ri/add-line';
	import TickIcon from '~icons/ri/check-line';
	import CloseIcon from '~icons/ri/close-line';

	import { Dialog } from 'teil-ui';

	import Frame from '$lib/components/frame.svelte';
	import Button from '$lib/components/button.svelte';
	import Search from '$lib/components/search.svelte';
	import Repo from '$lib//components/project.svelte';
	import Deploy from '$lib/components/deploy.svelte';
	
	import { PUBLIC_GITHUB_ACCESS_URL } from '$env/static/public';
	
	export let data: PageData;
	export let form: ActionData;

	const ReposAdded: Array<number> = [];

	let tokenform: HTMLFormElement;

	onMount(async () => {
		if (data.userCookie.authenticating) {
			tokenform.submit();
		}

		invalidate('/');
	});

	const present = (id: number, name: string) => {
		return ReposAdded.includes(id) || data.projects.map((project) => project.name).includes(name.replace('-', ' '));
	};

	$: form?.added && ReposAdded.push(form.added);
</script>

{#if !data.userCookie.authenticated}
	{#if data.userCookie.authenticating}
		<p>Authenticating...</p>
		<form bind:this={tokenform} method="POST" action="?/token" use:enhance />
	{/if}
{:else}
	<div class="content">
		<Frame id="projects" heading="Projects">
			<Dialog.Container modal slot="cta">
				<Dialog.Trigger class="dialog__trigger">
					<Button>
						Add New...
						<ChevronDown slot="icon-right" />
					</Button>
				</Dialog.Trigger>
				<Dialog.Overlay class="dialog__overlay" />
				<Dialog.Content class="dialog__content">
					<Dialog.Title class="dialog__title">
						Add New Project
						<Dialog.Trigger class="dialog__close">
							<CloseIcon class="dialog__exit"/>
						</Dialog.Trigger>
					</Dialog.Title>
					<Dialog.Description>
						<div>
							{#if data.user && data.user.repos && data.user.repos.length > 0}
								<ul class="repos">
									{#each data.user.repos as repo (repo.id)}
										{@const selected = present(repo.id, repo.name)}
										<li>
											<form method="POST" action="?/project" use:enhance>
												<input type="number" name="id" value={repo.id} hidden />
												<button disabled={selected} class="repo" class:selected type="submit">
													{repo.name}
													{#if selected}
														<TickIcon />
													{:else}
														<PlusIcon />
													{/if}
												</button>
											</form>
										</li>
									{/each}
								</ul>
							{:else}
								<span>No repos found</span>
							{/if}
						</div>
						<span>
							Can't find your repo? <a href={PUBLIC_GITHUB_ACCESS_URL}>Configure access here</a>
						</span>
					</Dialog.Description>
					<Dialog.Close class="dialog__close">Done</Dialog.Close>
				</Dialog.Content>
			</Dialog.Container>
			<Search slot="search" />
			{#each data.projects as project}
				<Repo {project} />
			{/each}
		</Frame>
		<Frame id="deploys" heading="Deploys">
			{#each data.deploys as deploy}
				<Deploy {deploy} />
			{/each}
		</Frame>
		<Frame id="builds" heading="Builds">
			{#each data.builds as build}
				<Deploy deploy={build} />
			{/each}
		</Frame>
	</div>
{/if}

<style>
	.content {
		width: 100%;
		padding: 25px 120px;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-rows: repeat(2, minmax(0, 1fr));
		gap: 15px;
	}

	:global(.content > #projects) {
		grid-column: 1 / 3;
		grid-row: 1 / 2;
	}

	:global(.content > #deploys) {
		grid-column: 1 / 2;
		grid-row: 2 / 3;
	}

	:global(.content > #builds) {
		grid-column: 2 / 3;
		grid-row: 2 / 3;
	}

	:global(.dialog__trigger) {
		padding: 0;
		margin: 0;
		outline: none;
		border: none;
		background: transparent;
		border-radius: 5px;
	}

	:global(.dialog__overlay) {
		background-color: black;
		opacity: 0.3;
		position: fixed;
		inset: 0;
	}
	:global(.dialog__content) {
		background-color: var(--color-bg-1);
		border-radius: 10px;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 90vw;
		max-width: 450px;
		max-height: 85vh;
		padding: 25px;
		color: #4c566a;
		z-index: 99;
		color: var(--white);
	}
	:global(.dialog__title) {
		color: var(--white);
		font-size: 1.5rem;
		margin: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	:global(.dialog__exit) {
		color: var(--gray-2);
		width: 24px;
		height: 24px;
		cursor: pointer;
	}
	:global(.dialog__exit:hover) {
		color: var(--white);
	}
	:global(.dialog__close) {
		color: var(--green);
		background: transparent;
		border: none;
		outline: none;
		cursor: pointer;
	}

	:global(.repos .repo) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: var(--gray-2);
		cursor: pointer;
		width: 100%;
		background: transparent;
		border: none;
		outline: none;
	}

	:global(.repos .repo > svg) {
		height: 16px;
		width: 16px;
	}

	:global(.repos .repo:hover) {
		color: var(--white);
	}

	:global(.repos .repo.selected) {
		color: var(--white);
	}

	:global(.repos .repo.selected > svg) {
		color: var(--green);
	}
</style>

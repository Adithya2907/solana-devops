<script lang="ts">
	import type { PageData } from './$types';

	import { enhance } from '$app/forms';

	import { Dialog, Select, Checkbox } from 'teil-ui';

	import RedoIcon from '~icons/ei/redo';
	import BranchIcon from '~icons/ri/git-branch-line';
	import CommitIcon from '~icons/ri/git-commit-fill';
	import TagIcon from '~icons/ri/input-method-line';
	import ChevronDown from '~icons/carbon/chevron-down';
	import CloseIcon from '~icons/ri/close-line';
	import VersionIcon from '~icons/ri/price-tag-3-line';
	import DropdownIcon from '~icons/ri/arrow-drop-down-line';
	import CheckIcon from '~icons/ri/check-line';

	import Frame from '$lib/components/frame.svelte';
	import Button from '$lib/components/button.svelte';
	import Status from '$lib/components/status.svelte';
	import Listener from '$lib/components/listener.svelte';
	import Deploy from '$lib/components/deploy.svelte';
	import SelectItem from '$lib/components/selectitem.svelte';

	export let data: PageData;

	let trigger = '';
	let branch = '';
	let target = '';
	let deployfe = false;

	const productionListenerExists = data.listeners.filter(listener => listener.production).length > 0;
	
	const validString = (text: string | null | undefined): boolean =>  text !== undefined && text !== null && text.length > 0;

	$: uniqueListener = data.listeners.filter(listener => listener.branch === branch && listener.type === trigger).length === 0;
	$: validListener = validString(trigger) && validString(branch) && validString(target) && uniqueListener;
</script>

<div class="page">
	<div class="title">
		<div class="name">
			<h1>{data.project.name}</h1>
		</div>
		<div class="actions">
			<Button style="outline">Git Repository</Button>
			<Button style="outline">Documentation</Button>
			<Button style="outline">
				<RedoIcon slot="icon-left" />
				Instant Rollback
			</Button>
		</div>
	</div>
	<div class="content">
		<Frame heading="Production Deployment">
			<div class="actions" slot="cta">
				<Button style="outline">Build Logs</Button>
				<Button style="outline">Runtime Logs</Button>
			</div>
			<div class="production">
				<div class="multiline">
					<h5>deployment</h5>
					<p>
						{data.idls && data.idls.length > 0 ? data.idls[0].programid : ''}
						(<a
							href="https://github.com/{data.project.repo.fullname}/{data.production.build?.issue}"
							>#{data.production.id}</a
						>)
					</p>
				</div>
				<div class="multicol">
					<div class="multiline">
						<h5>Status</h5>
						<Status status={data.production.status} />
					</div>
					<div class="multiline">
						<h5>created</h5>
						<p>{data.production.time} by <span class="author">{data.user?.login}</span></p>
					</div>
				</div>
				<div class="multicol">
					<div class="multiline">
						<h5>source</h5>
						<div class="iconline">
							<BranchIcon />
							<span>{data.production.branch}</span>
						</div>
						<div class="iconline">
							<CommitIcon />
							<span
								>{data.production.message}
								(<a
									href="https://github.com/{data.project.repo.fullname}/tree/{data.production
										.commit}">{data.production.commit}</a
								>)</span
							>
						</div>
					</div>
					<div class="multiline">
						<h5>TAG</h5>
						<div class="iconline">
							<TagIcon />
							<span>prod</span>
						</div>
						<div class="iconline">
							<VersionIcon />
							<span>0.21.6</span>
						</div>
					</div>
				</div>
			</div>
		</Frame>
		<Frame heading="Listeners">
			<Dialog.Container slot="cta">
				<Dialog.Trigger class="dialog__trigger">
					<Button>
						Add New...
						<ChevronDown slot="icon-right" />
					</Button>
				</Dialog.Trigger>
				<Dialog.Overlay class="dialog__overlay" />
				<Dialog.Content class="dialog__content large">
					<Dialog.Title class="dialog__title">
						Add Listener to {data.project.name}
						<Dialog.Trigger class="dialog__close">
							<CloseIcon class="dialog__exit" />
						</Dialog.Trigger>
					</Dialog.Title>
					<Dialog.Description>
						<form method="POST" action="?/listener:add">
							<div class="formrow">
								<Select.Container bind:value={trigger}>
									<Select.Trigger class="select__trigger">
										<Select.Value>
											<span class="placeholder">Trigger</span>
										</Select.Value>
										<Select.Icon class="select__icon">
											<DropdownIcon />
										</Select.Icon>
									</Select.Trigger>
									<Select.Content class="select__content">
										<Select.Viewport class="select__viewport">
											<SelectItem value="PUSH">Push</SelectItem>
											<SelectItem value="PULL_REQUEST">Pull Request</SelectItem>
										</Select.Viewport>
									</Select.Content>
								</Select.Container>

								<span>on</span>

								<Select.Container bind:value={branch}>
									<Select.Trigger class="select__trigger" aria-label="branch">
										<Select.Value>
											<span class="placeholder">Branch</span>
										</Select.Value>
										<Select.Icon class="select__icon">
											<DropdownIcon />
										</Select.Icon>
									</Select.Trigger>
									<Select.Content class="select__content">
										<Select.Viewport class="select__viewport">
											{#each data.branches as branch (branch.name)}
												<SelectItem value={branch.name}>{branch.name}</SelectItem>
											{/each}
										</Select.Viewport>
									</Select.Content>
								</Select.Container>

								<span>to</span>

								<Select.Container bind:value={target}>
									<Select.Trigger class="select__trigger">
										<Select.Value>
											<span class="placeholder">Target</span>
										</Select.Value>
										<Select.Icon class="select__icon">
											<DropdownIcon />
										</Select.Icon>
									</Select.Trigger>
									<Select.Content class="select__content">
										<Select.Viewport class="select__viewport">
											<SelectItem value="DEV">devnet</SelectItem>
											<SelectItem value="TEST">testnet</SelectItem>
											<SelectItem value="PROD">mainnet</SelectItem>
										</Select.Viewport>
									</Select.Content>
								</Select.Container>
							</div>

							<div class="formcol">
								<div class="checkbox__container">
									<Checkbox.Box id="production" slot="component" class="checkbox__box" disabled={productionListenerExists}>
										<Checkbox.Indicator class="checkbox__indicator">
											<CheckIcon slot="checked"></CheckIcon>
										</Checkbox.Indicator>
									</Checkbox.Box>
									<label for="production">Mark listener as production</label>
								</div>

								<div class="checkbox__container">
									<Checkbox.Box id="autodeploy" slot="component" class="checkbox__box">
										<Checkbox.Indicator class="checkbox__indicator">
											<CheckIcon slot="checked"></CheckIcon>
										</Checkbox.Indicator>
									</Checkbox.Box>
									<label for="autodeploy">Deploy automatically when build succeeds</label>
								</div>

								<div class="checkbox__container">
									<Checkbox.Box id="deployfe" slot="component" class="checkbox__box" disabled>
										<Checkbox.Indicator class="checkbox__indicator">
											<CheckIcon slot="checked"></CheckIcon>
										</Checkbox.Indicator>
									</Checkbox.Box>
									<label for="deployfe">Enable linked frontend deployments</label>
								</div>
							</div>

							{#if deployfe}
								<label>Frontend Deploy Plugin</label>
								<select name="feplugin" placeholder="netlify">
									<option value="netlify">Netlify</option>
									<option value="vercel" disabled>Vercel</option>
								</select>

								<label>Frontend Deploy Target</label>
								<input name="fetarget" type="text" placeholder="site name" />

								<label>Plugin API Key</label>
								<input name="fekey" type="text" placeholder="API key" />

								<label>Frontend Directory</label>
								<input name="fedir" value="app" />
								<label>Frontend IDL Directory</label>

								<input name="feidl" value="app/idl" />

								<label
									>Frontend Build Command <small>Use {'{{cluster}}'} to get cluster</small></label
								>
								<input name="febuild" value="npm run build" />
								<label>Frontend Build Directory</label>
								<input name="feoutput" value="app/build" />
							{/if}

							<input name="project" type="hidden" value={data.project.id} />
							<input name="trigger" type="hidden" value={trigger}>
							<input name="branch" type="hidden" value={branch}>
							<input name="target" type="hidden" value={target}>

							<button class="dialog__close" type="submit" disabled={!validListener}>
								Add
							</button>
						</form>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Container>
			{#each data.listeners as listener (listener.id)}
				<Listener {listener} />
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
</div>

<style>
	.page {
		width: 100%;
		padding: 25px 120px;
	}

	.page .title {
		display: flex;
		padding: 25px 10px;
		height: 75px;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--line-color);
	}

	.title > .name > h1 {
		text-transform: capitalize;
		margin: 0;
	}

	.actions {
		display: flex;
		padding: 0;
		gap: 10px;
	}

	:global(.actions svg) {
		width: 20px;
		height: 25px;
	}

	.content {
		width: 100%;
		height: calc(100% - 75px);
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-rows: repeat(2, minmax(0, 1fr));
		gap: 20px;
		padding: 20px 0;
	}

	form .formrow {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 25px;
		margin-top: 15px;
	}

	form .formcol {
		width: 100%;
		display: flex;
		flex-direction: column;
		margin: 20px 0 25px 0;
		gap: 4px;
	}

	:global(form .formrow .select__trigger) {
		min-width: 130px;
		justify-content: space-between;
	}
</style>

<script lang="ts">
	import { slide } from 'svelte/transition';

	import RightArrowIcon from '~icons/ri/arrow-right-s-line';
	import CompleteIcon from '~icons/ri/checkbox-circle-fill';
	import InfoIcon from '~icons/ri/information-fill';

	import { Accordion } from 'teil-ui';

	type Status = 'complete' | 'info';

	export let value: string;
	export let title: string;
	export let status: Status = 'info';
	export let info: string = '';
	export let override: boolean = false;
</script>

<Accordion.Item class="accordion__item" {value}>
	<Accordion.Trigger class="accordion__trigger">
		<div class="title">
			<RightArrowIcon />
			<span>{title}</span>
		</div>
		<div class="info {status === 'complete' ? 'success' : ''}">
			{#if info}
				<span>{info}</span>
			{/if}
			{#if status === 'info'}
				<InfoIcon />
			{:else if status === 'complete'}
				<CompleteIcon />
			{/if}
		</div>
	</Accordion.Trigger>
	<Accordion.Content class="accordion__content">
		{#if override}
			<slot />
		{:else}
			<div class="text none" transition:slide>
				<slot />
			</div>
		{/if}
	</Accordion.Content>
</Accordion.Item>

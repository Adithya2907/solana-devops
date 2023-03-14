<script lang="ts">
	import { update_keyed_each } from 'svelte/internal';
	import { IdlTypeToString, type IDL } from '../../IDL';
	export let idl: IDL;
</script>

<div class="grid grid--2-cols">
	<div class="grid-header">
		<div>
			<h2 class="name">Name</h2>
		</div>
		<div>
			<h2>Fields</h2>
		</div>
	</div>
	{#if idl.events}
		{#each idl.events as event}
			<h2>{event.name}</h2>
			<div class="fields">
				{#each event.fields as field}
					<div class="field">
						<span class="text-clr-green">{field.name}</span>
						<span class="bg-text bg--grey">{IdlTypeToString(field.type)}</span>
					</div>
				{/each}
			</div>
			<div class="line" />
		{/each}
	{:else}
		<h2 class="text-center grid-span">There's nothing here!</h2>
	{/if}
</div>

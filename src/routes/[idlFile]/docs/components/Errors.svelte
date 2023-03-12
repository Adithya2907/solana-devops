<script lang="ts">
	import type { IDL } from '../../IDL';
	export let idl: IDL;
</script>

<div class="grid grid--3-cols">
	<div class="grid-header">
		<div>
			<h2 class="name">Code</h2>
		</div>
		<div>
			<h2 class="name">Name</h2>
		</div>
		<div>
			<h2 class="name">Message</h2>
		</div>
	</div>

	{#if idl.errors}
		{#each idl.errors as error}
			<h2 class="text-clr-red">{error.code}</h2>
			<h2 class="text-clr-green">{error.name}</h2>
			<h2>{error.msg ?? ''}</h2>
			<div class="line" />
		{/each}
	{:else}
		<h2 class="text-center grid-span">There's nothing here!</h2>
	{/if}
</div>

<style>
	.grid--3-cols {
		grid-template-columns: 1fr 2fr 5fr;
	}
</style>

<script lang="ts">
	import { IdlTypeToString, type IDL } from '../../IDL';
	export let idl: IDL;
</script>

<div class="grid grid--3-cols">
	<div class="grid-header">
		<div>
			<h2 class="name">Name</h2>
		</div>
		<div>
			<h2>Field</h2>
		</div>
		<div>
			<h2>Value</h2>
		</div>
	</div>
	{#if idl.constants}
		{#each idl.constants as constant}
			<h2>{constant.name}</h2>
			<h2>{IdlTypeToString(constant.type)}</h2>
			<h2 class="text-clr-green">{constant.value}</h2>
			<div class="line" />
		{/each}
	{:else}
		<h2 class="text-center grid-span">There's nothing here!</h2>
	{/if}
</div>

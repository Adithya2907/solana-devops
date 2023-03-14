<script lang="ts">
	import { IdlTypeToString, type IDL } from '../../IDL';
	export let idl: IDL;
</script>

<!-- For enum variant, should we dislpay the fields? -->
<div class="grid grid--2-cols">
	<div class="grid-header">
		<div>
			<h2 class="name">Name</h2>
		</div>
		<div>
			<h2>Fields</h2>
		</div>
	</div>
	{#if idl.types}
		{#each idl.types as type}
			<div class="name">
				<span style="margin-right: 10px" class="bg-text bg--grey">{type.type.kind}</span>
				<span>{type.name}</span>
			</div>
			<div class="fields">
				<div class="field">
					{#if type.type.kind === 'enum'}
						{#each type.type.variants as variant}
							<p class="text-clr-green">{variant.name}</p>
						{/each}
					{:else}
						{#each type.type.fields as field}
							<div class="pd-lt-0">
								<span class="name text-clr-green">{field.name}</span>
								<span class="bg-text bg--grey">{IdlTypeToString(field.type)}</span>
							</div>
						{/each}
					{/if}
				</div>
			</div>
			<div class="line" />
		{/each}
	{:else}
		<h2 class="text-center grid-span">There's nothing here!</h2>
	{/if}
</div>

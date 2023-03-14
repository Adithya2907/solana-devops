<script lang="ts">
	import { Separator } from 'teil-ui';
	import { IdlTypeToString, type IDL } from '../../IDL';
	export let idl: IDL;
</script>

{#if idl.accounts}
	<div class="accounts grid grid--2-cols">
		<div class="grid-header">
			<div>
				<h2 class="name">Name</h2>
			</div>
			<div>
				<h2>Fields</h2>
			</div>
		</div>
		{#each idl.accounts as account}
			<h2>{account.name}</h2>
			<div class="fields">
				{#each account.type.fields as field}
					<div class="field">
						<span class="name text-clr-green">{field.name}</span>
						<span class="bg-text bg--grey">{IdlTypeToString(field.type)}</span>
					</div>
				{/each}
			</div>
			<div class="line" />
		{/each}
	</div>
{:else}
	<h2 class="text-center grid-span">There's nothing here!</h2>
{/if}

<script lang="ts">
	type Style = 'filled' | 'outline';

	export let style: Style = 'filled';
</script>

<button
	on:click
	class={style}
	class:left={$$slots['icon-left']}
	class:right={$$slots['icon-right']}
>
	<slot name="icon-left" />
	<slot />
	<slot name="icon-right" />
</button>

<style>
	button {
		outline: none;
		padding: 10px 15px;
		border-radius: 5px;
		display: flex;
		justify-content: space-between;
		cursor: pointer;
		height: 35px;
		font-size: 0.8rem;
		align-items: center;
	}

	button.filled {
		background: var(--color-theme-1);
		padding-right: 5px;
		border: none;
		color: var(--white);
		min-width: 135px;
	}

	button.outline {
		background: transparent;
		border: 1px solid var(--gray-2);
		color: var(--gray-2);
	}

	button.left {
		padding-left: 5px;
	}

	button.right {
		padding-right: 5px;
	}
</style>

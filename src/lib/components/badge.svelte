<script lang="ts">
	type State = 'success' | 'warning' | 'error' | 'info';

	export let state: State = 'success';
</script>

<div class="badge badge-{state}">
	<span><slot /></span>
</div>

<style>
	.badge {
		--badge-background: #037746;
		--badge-text: #57eba1;

		display: inline-block;
		width: 75px;
		height: 15px;
		border-radius: 5px;
		font-size: 10px;

		background: var(--badge-background);
		color: var(--badge-text);

        display: flex;
        align-items: center;
        justify-content: center;
        text-transform: capitalize;
	}

	.badge-warning {
		--badge-background: #ce6c00;
		--badge-text: #fccc75;
	}

	.badge-error {
		--badge-background: #ff8080;
		--badge-text: #ff3b3b;
	}

	.badge-info {
		--badge-background: #009fac;
		--badge-text: #a9eff2;
	}
</style>

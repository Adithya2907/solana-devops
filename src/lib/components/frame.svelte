<script lang="ts">
    export let heading: string = '';
</script>

<div class="frame" {...$$restProps}>
	<div class="header">
		<h2>{heading}</h2>
		<div>
            <slot name="search"></slot>
            <slot name="cta"></slot>
        </div>
	</div>
	<div class="body">
        <slot></slot>
    </div>
</div>

<style>
	.frame {
		width: 100%;
		background: #28293d;
		padding: 0 15px 10px 15px;
		display: flex;
		flex-direction: column;
        border-radius: 20px;
	}

	.header {
		background: transparent;
		width: 100%;
		padding: 10px 25px;
		border-bottom: 1px solid var(--line-color);
        display: flex;
        justify-content: space-between;
	}

    .header > div {
        display: flex;
        gap: 10px;
    }

	.header h2 {
		font-size: 1.5rem;
	}
</style>

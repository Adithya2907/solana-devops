<button on:click>
    <slot></slot>
    <slot name="icon-right"></slot>
</button>

<style>
    button {
        background: var(--color-theme-1);
        outline: none;
        border: none;
        padding: 10px 5px 10px 15px;
        border-radius: 5px;
        color: var(--white);
        font-size: 0.8rem;
        display: flex;
        justify-content: space-between;
        cursor: pointer;
        height: 35px;
        min-width: 135px;
    }
</style>
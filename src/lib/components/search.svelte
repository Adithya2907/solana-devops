<script lang='ts'>
    import SearchIcon from '~icons/carbon/search';
</script>

<div class="search">
    <SearchIcon></SearchIcon>
    <input type="text" placeholder="Search..." on:change>
</div>

<style>
    .search {
        background: transparent;
        height: 35px;
        min-width: 135px;
        border: 1px solid var(--line-color);
        display: flex;
        align-items: center;
        padding: 10px;
        color: var(--gray-2);
        gap: 10px;
        border-radius: 5px;
    }

    input {
        background: transparent;
        outline: none;
        border: none;
        color: var(--white);
        font-weight: 200;
    }

    input:focus {
        outline: none;
        border: none;
    }

    input::placeholder {
        color: var(--gray-2);
    }

    .search:has(input:focus) {
        border-color: var(--white);
    }
</style>
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Build</h1>
<p>Status: {data.build.status}</p>
<p>Conclusion: {data.build.conclusion}</p>

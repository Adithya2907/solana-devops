<script lang="ts">
	import CheckIcon from '~icons/ri/check-line';

	import { Select } from 'teil-ui';

	export let value: string;
</script>

<Select.Item {value} class="select__item">
	<Select.Indicator class="select__indicator">
		<CheckIcon />
	</Select.Indicator>
	<Select.Text class="select__text">
		<slot />
	</Select.Text>
</Select.Item>

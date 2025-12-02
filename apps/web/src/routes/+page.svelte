<script>
	import { client } from '$lib/api';
	import { onMount } from 'svelte';

	onMount(() => {
	    fetchTest();
	});

	// Just testing Eden Treaty
	async function fetchTest() {
		const { data, error } = await client.get();
		if (error) {
			console.error(error);
		}
		console.log(data);
		return data;
	}

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

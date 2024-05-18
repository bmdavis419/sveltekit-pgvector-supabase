<script lang="ts">
	import { deserialize, enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { ActionResult } from '@sveltejs/kit';
	import type { ActionData, SubmitFunction } from './$types';

	let query = $state('');

	let timeoutId = $state<NodeJS.Timeout | null>(null);

	let searchResults = $state<
		{
			name: string;
			id: string;
			type: string;
			cik: string;
		}[]
	>([]);

	const search = async (query: string) => {
		timeoutId = setTimeout(async () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			const data = new FormData();

			data.append('query', query);

			const response = await fetch('insiderviz-testing/?/search', {
				method: 'POST',
				body: data
			});

			const result: ActionResult = deserialize(await response.text());

			// idk how I feel about all these types being needed here, to be revisited...
			if (result.type === 'success') {
				const resData = result.data as ActionData;
				if (resData && resData.searchRes) {
					searchResults = resData.searchRes;
				}
			}
		}, 200);
	};

	let isSeeding = $state(false);

	const submitSeed: SubmitFunction = () => {
		isSeeding = true;
		return ({ result }) => {
			if (result.type === 'success' && result.data) {
				if ('status' in result.data) {
					alert('seed ran, status: ' + result.data.status);
				}
			}
			isSeeding = false;
		};
	};

	$effect(() => {
		if (query !== '') {
			search(query);
		} else {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			searchResults = [];
		}
	});
</script>

<Card class="w-[350px]">
	<CardHeader>search (ACTUALLY NICE)</CardHeader>
	<CardContent>
		<p class="text-sm italic text-stone-500">
			this implementation is more useful in the real world probably
		</p>
		<div class="relative">
			<Label>query</Label>
			<Input
				name="query"
				bind:value={query}
				placeholder="search for a company or issuer"
				class="relative"
			></Input>
			{#if searchResults.length > 0}
				<div class="absolute left-0 top-16 flex w-full flex-col rounded-md bg-white p-2 shadow-md">
					{#each searchResults as res}
						<div class="flex flex-col gap-2">
							<Button variant="ghost" class="w-full justify-start">{res.name}</Button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</CardContent>
</Card>

<Card class="w-[350px]">
	<CardHeader>seed the db with some exercises</CardHeader>
	<CardContent class="text-sm italic text-stone-500"
		>you can add more in the "+page.server.ts"</CardContent
	>
	<CardFooter>
		<form method="post" use:enhance={submitSeed} action="?/seed">
			<Button type="submit" disabled={isSeeding}>seed the db</Button>
		</form>
	</CardFooter>
</Card>

<script lang="ts">
	import { deserialize, enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Card } from '$lib/components/ui/card';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardFooter from '$lib/components/ui/card/card-footer.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import type { ActionResult } from '@sveltejs/kit';
	import type { SubmitFunction } from './$types';
	import type { ActionData } from './$types';
	import * as Command from '$lib/components/ui/command';

	let openDialog = $state(false);

	$effect(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				openDialog = !openDialog;
			}
		}

		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	let searchResults = $state<
		{
			name: string;
			id: string;
		}[]
	>([]);

	let timeoutId = $state<NodeJS.Timeout | null>(null);

	const customSearch = async (query: string) => {
		timeoutId = setTimeout(async () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			const data = new FormData();

			data.append('query', query);

			const response = await fetch('?/search', {
				method: 'POST',
				body: data
			});

			const result: ActionResult = deserialize(await response.text());

			// idk how I feel about all these types being needed here, to be revisited...
			if (result.type === 'success') {
				const resData = result.data as ActionData;
				if (resData && 'dbExercises' in resData && resData.dbExercises) {
					searchResults = resData.dbExercises;
				}
			}
		}, 500);
	};

	let dialogSearchResults = $state<
		{
			name: string;
			id: string;
		}[]
	>([]);

	let dialogTimeoutId = $state<NodeJS.Timeout | null>(null);

	const dialogCustomSearch = async (query: string) => {
		dialogTimeoutId = setTimeout(async () => {
			if (dialogTimeoutId) {
				clearTimeout(dialogTimeoutId);
			}

			const data = new FormData();

			data.append('query', query);

			const response = await fetch('?/search', {
				method: 'POST',
				body: data
			});

			const result: ActionResult = deserialize(await response.text());

			// idk how I feel about all these types being needed here, to be revisited...
			if (result.type === 'success') {
				const resData = result.data as ActionData;
				if (resData && 'dbExercises' in resData && resData.dbExercises) {
					dialogSearchResults = resData.dbExercises;
				}
			}
		}, 500);
	};

	let customSearchQuery = $state('');
	let customDialogQuery = $state('');

	$effect(() => {
		if (customSearchQuery !== '') {
			customSearch(customSearchQuery);
		} else {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			searchResults = [];
		}
	});

	$effect(() => {
		if (customDialogQuery !== '') {
			dialogCustomSearch(customDialogQuery);
		} else {
			if (dialogTimeoutId) {
				clearTimeout(dialogTimeoutId);
			}
			dialogSearchResults = [];
		}
	});

	$inspect(searchResults);

	let isSeeding = $state(false);
	let isButtonSearching = $state(false);

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

	const submitSearch: SubmitFunction = () => {
		isButtonSearching = true;
		return ({ result }) => {
			if (result.type === 'success' && result.data) {
				if ('dbExercises' in result.data) {
					console.log('SEARCH RESULTS:', result.data.dbExercises);
				}
			}
			isButtonSearching = false;
		};
	};
</script>

<Command.Dialog bind:open={openDialog}>
	<Command.Input placeholder="search for an exercise" bind:value={customDialogQuery} />
	<Command.List>
		<Command.Group heading="Exercises">
			{#each dialogSearchResults as exercise}
				<Command.Item on:click={() => console.log(exercise)}>
					{exercise.name}
				</Command.Item>
			{/each}
		</Command.Group>
	</Command.List>
</Command.Dialog>

<main class="flex min-h-screen w-full flex-col items-center justify-center gap-4">
	<Card class="w-[350px]">
		<CardHeader>search for an exercise (BASIC WITH BUTTON PRESS)</CardHeader>
		<CardContent>
			<p class="text-sm italic text-stone-500">results will be returned in the console</p>
			<form action="?/search" class="flex flex-col gap-2" method="post" use:enhance={submitSearch}>
				<div>
					<Label>query</Label>
					<Input name="query" placeholder="search for an exercise"></Input>
				</div>
				<Button type="submit" disabled={isButtonSearching}>search</Button>
			</form>
		</CardContent>
	</Card>

	<Card class="w-[350px]">
		<CardHeader>search for an exercise (ACTUALLY NICE)</CardHeader>
		<CardContent>
			<p class="text-sm italic text-stone-500">
				this implementation is more useful in the real world probably
			</p>
			<div class="relative">
				<Label>query</Label>
				<Input
					name="query"
					bind:value={customSearchQuery}
					placeholder="search for an exercise"
					class="relative"
				></Input>
				{#if searchResults.length > 0}
					<div
						class="absolute left-0 top-16 flex w-full flex-col rounded-md bg-white p-2 shadow-md"
					>
						{#each searchResults as exercise}
							<div class="flex flex-col gap-2">
								<Button variant="ghost" class="w-full justify-start">{exercise.name}</Button>
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
	<Card class="w-[350px]">
		<CardHeader>press cmd + k for something neat</CardHeader>
	</Card>
</main>

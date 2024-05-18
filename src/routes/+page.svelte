<script lang="ts">
	import { applyAction, deserialize, enhance } from '$app/forms';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Card } from '$lib/components/ui/card';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardFooter from '$lib/components/ui/card/card-footer.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import * as Command from '$lib/components/ui/command';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import type { ActionResult } from '@sveltejs/kit';
	import type { ActionData, SubmitFunction } from './$types';

	let openDialog = $state(false);

	// instead of manually deserializing the results we can just use the native
	// form prop that contain that data
	const { form } = $props();

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

	// searchResults then become just a derived for the result of
	// form...if no form we fallback to empty array
	let searchResults = $derived(form?.dbExercises ?? []);

	// this doesn't need to be a state since we don't use it in any effect
	// or UI
	let timeoutId: ReturnType<typeof setTimeout>;

	let dialogSearchResults = $state<
		{
			name: string;
			id: string;
		}[]
	>([]);

	// same for this
	let dialogTimeoutId: ReturnType<typeof setTimeout>;

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

	let customDialogQuery = $state('');

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

	// we store the input in a variable to be able to refocus automatically
	let input: HTMLInputElement;
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
				<!-- 
					we just use a native form to submit the query...this 
					means that is the user doesn't have javascript can still
					submit pressing enter 😎
				-->
				<form
					action="?/search"
					method="post"
					use:enhance={() => {
						return ({ result }) => {
							// if the return type is success
							if (result.type === 'success') {
								// we apply the action (this prevent the input from being deleted on any submit)
								applyAction(result);
								// this is weird i know but we need to wait a bit to refocus
								// or we will not be able to write...this is sometimes noticeable but just
								// barely and the experience is still smooth.
								setTimeout(() => {
									input?.focus();
								}, 10);
							}
						};
					}}
				>
					<Label>query</Label>
					<Input
						name="query"
						value={form?.query ?? ''}
						on:input={(e) => {
							// on input we write our debounce and if the debounce
							// is successful we request the submit of the form
							clearTimeout(timeoutId);
							input = e.currentTarget;
							if (input.value) {
								const form = input.form;
								timeoutId = setTimeout(() => {
									form?.requestSubmit();
								}, 500);
							}
						}}
						placeholder="search for an exercise"
						class="relative"
					></Input>
				</form>
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

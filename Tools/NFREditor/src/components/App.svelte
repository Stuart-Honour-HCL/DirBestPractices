<script lang="ts">
	import queryString, { StringifyOptions } from "query-string";
	import cookie from "cookie";
	import APIHelper from "../api";
	import AuthPage from "./AuthPage.svelte";
	import Control from "../control";
	import Debug from "../debug";
	import Infolog from "./Infolog.svelte";
	import GitExplorer from "./GitExplorer.svelte";
	import { ROOT_FOLDER } from "../gitContents";
	import TextEdit from "./TextEdit.svelte";

	let parsed = queryString.parse(location.search);

	let authenticated = false;
	let infologShown = false;
	let infologMessage: string;
	let currentContents = Control.currentContents;

	function checkAuthentication() {
		let cookies = cookie.parse(document.cookie);
		if (cookies.nfrGitToken && cookies.nfrGitUser && cookies.nfrGitRepo) {
			APIHelper.token = cookies.nfrGitToken;
			APIHelper.user = cookies.nfrGitUser;
			APIHelper.repo = cookies.nfrGitRepo;
			authenticated = true;

			if (parsed && parsed.path) {
				Control.openPath(parsed.path.toString());
			} else {
				Control.openPath(ROOT_FOLDER);
			}
		} else {
			authenticated = false;
		}
	}

	Control.stateChange.subscribe((what) => {
		if (!what) {
			return;
		}

		Debug.log("APP - state changed: ", what.action);
		switch (what.action) {
			case "signalAuthChanged":
				checkAuthentication();
				break;
			case "showInfolog":
				infologMessage = what.infolog;
				infologShown = true;
				setTimeout(function () {
					infologShown = false;
					infologMessage = undefined;
				}, 2000);
				break;
			case "pathChanged":
				currentContents = Control.currentContents;
				break;
		}
	});

	checkAuthentication();
	Control.initOnPopState();
</script>

<main>
	{#if infologShown}
		<Infolog message={infologMessage} />
	{/if}

	{#if authenticated}
		{#if currentContents}
			<!--<Editor /> -->
			{#if currentContents.type == "file"}
				<div id="editorback">
					<i
						on:click={(x) => {
							Control.openPath(
								currentContents.parentPath(),
								true
							);
						}}
						class="fa fa-arrow-circle-left"
					/>
				</div>
				<TextEdit currentFile={currentContents.file} />
			{:else}
				<GitExplorer {currentContents} />
			{/if}
		{/if}
	{:else}
		<AuthPage />
	{/if}
</main>
<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
	/><script
		src="https://cdn.rawgit.com/beautify-web/js-beautify/v1.13.5/js/lib/beautify-html.js"></script></svelte:head
>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	#editorback {
		font-size: large;
		text-align: left;
	}
	#editorback:hover {
		color: cadetblue;
		cursor: default;
	}
</style>

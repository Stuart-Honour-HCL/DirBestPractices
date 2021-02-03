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
	import PopupDialog from "./PopupDialog.svelte";
	import AuthMenu from "./AuthMenu.svelte";
	import RepoExporter from "./RepoExporter.svelte";

	let parsed = queryString.parse(location.search);

	let authenticated = false;
	let infologShown = false;
	let popupOpen = false;
	let menuOpen = false;
	let popupControl: Control;
	let unsavedChanges: boolean = false;

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
			Debug.log("APP - state changed what undefined: ", what);
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
			case "showPopup":
				popupOpen = true;
				popupControl = what;
				break;
			case "closePopup":
				popupOpen = false;
				popupControl = undefined;
				break;
			case "pathChanged":
				currentContents = Control.currentContents;
				break;
			case "closeMenu":
				menuOpen = false;
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
		{#if parsed && parsed.page}
			{#if parsed.page == "export"}
				<RepoExporter />
			{:else if parsed.page == "contents" && currentContents}
				{#if currentContents.type == "file"}
					<TextEdit
						currentFile={currentContents.file}
						{unsavedChanges}
					/>
				{:else}
					<GitExplorer {currentContents} />
				{/if}
			{/if}
		{:else}
			<RepoExporter />
		{/if}
	{:else}
		<AuthPage />
	{/if}

	{#if popupOpen && popupControl}
		<PopupDialog
			popupText={popupControl.popupText}
			showOKButton={popupControl.popupShowOK}
			showCancelButton={popupControl.popupShowCancel}
			showinput={popupControl.popupShowInput}
			closePopup={popupControl.popupOnclose}
		/>
	{/if}

	{#if authenticated}
		{#if menuOpen}
			<AuthMenu />
		{:else}
			<div id="menuButton" on:click={(x) => (menuOpen = true)}>
				<i
					id="menuButtonIcon"
					on:click={(x) => {}}
					class="fa fa-bars"
				/>
			</div>
		{/if}
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

	#menuButton {
		position: absolute;
		top: 32px;
		right: 0;
		width: 35px;
		height: 35px;
		border: 1px solid darkgray;
		background-color: black;
		color: blanchedalmond;
		font-size: 30px;
		text-align: center;
		line-height: 35px;
	}
	#menuButton:hover {
		color: cadetblue;
	}
</style>

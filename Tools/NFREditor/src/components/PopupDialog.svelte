<script lang="ts">
    export let closePopup: Function;
    export let showOKButton: boolean;
    export let showCancelButton: boolean;
    export let showinput: boolean;
    export let popupText: string;

    let inputText: string;

    import { DialogOverlay, DialogContent } from "svelte-accessible-dialog";
    import Control from "../control";

    function doClosePopup(button: string) {
        if (closePopup) {
            closePopup(button, inputText);
        }
        Control.closePopup();
    }
</script>

<DialogOverlay isOpen={true} onDismiss={(x) => doClosePopup("Cancel")}>
    <DialogContent aria-label="Announcement">
        <div id="divPopupText">
            {popupText}
        </div>
        {#if showinput}
            <div id="divPopupInput">
                <input bind:value={inputText} />
            </div>
        {/if}
        {#if showCancelButton}
            <button on:click={(x) => doClosePopup("Cancel")}>Cancel</button>
        {/if}
        {#if showOKButton}
            <button on:click={(x) => doClosePopup("OK")}>OK</button>
        {/if}
    </DialogContent>
</DialogOverlay>

<style>
    #divPopupInput {
        width: 100%;
    }
    #divPopupInput input {
        width: 100%;
    }
</style>

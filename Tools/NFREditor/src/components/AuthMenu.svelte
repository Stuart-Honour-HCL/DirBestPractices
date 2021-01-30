<script lang="ts">
    import APIHelper from "../api";
    import Control from "../control";

    function logout() {
        document.cookie =
            "nfrGitUser= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
            "nfrGitRepo= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
            "nfrGitToken= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";

        APIHelper.token = undefined;
        APIHelper.user = undefined;
        APIHelper.repo = undefined;
        location.reload();
    }
</script>

<div id="authMenu">
    <div id="authInfo">
        Authenticated with token ***** to; https://github.com/{APIHelper.user}/{APIHelper.repo}
    </div>
    <div id="authControls">
        <button class="customButton" on:click={(x) => Control.closeMenu()}>Close</button>
        <button class="customButton" on:click={logout}>Log out</button>
    </div>
</div>

<style>
    #authMenu {
        position: absolute;
        top: 32px;
        right: 0;
        width: 300px;
        height: 100px;
        border: 1px solid darkgray;
        background-color: black;
        color:blanchedalmond;
        font-size: 12px;
        text-align: left;
        padding: 10px;
    }

    #authControls {
        position: absolute;
        bottom: 5px;
    }
</style>

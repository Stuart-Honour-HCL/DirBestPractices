import { writable } from 'svelte/store';
import APIHelper from './api';
import type GitFile from './gitFile';
import queryString, { StringifyOptions } from "query-string";
import type GitContents from './gitContents';

export default class Control {
    action: string;
    infolog: string;
 
    static currentContents: GitContents;
    static stateChange = writable<Control>(undefined);

    constructor(what: string) {
        this.action = what;
    }

    static signalAuthChanged() {
        this.stateChange.update(c => new Control("signalAuthChanged"));
    }

    static showInfolog(message: string) {
        let ctrl = new Control("showInfolog");
        ctrl.infolog = message;
        this.stateChange.update(c => ctrl);
    }

    static setQueryString(obj: any) {
        const stringified = queryString.stringify(obj);
        window.history.pushState({}, '', `${window.origin}?${stringified}`);
    }

    static initOnPopState() {
        window.onpopstate = function (event) {
            let parsed = queryString.parse(location.search);
            if (parsed && parsed.path) {
                Control.openPath(parsed.path.toString(), false);
            }
        };
    }



    static openPath(path: string, updateQueryString: boolean = true) {

        APIHelper.getContent(path).then(contents => {
            if (updateQueryString) {
                this.setQueryString({ path: path });
            }
            Control.currentContents = contents; 

            this.stateChange.update(c => new Control("pathChanged"));
        });

    }

}
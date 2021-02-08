import { writable } from 'svelte/store';
import APIHelper from './api';
import type GitFile from './gitFile';
import queryString, { StringifyOptions } from "query-string";
import type GitContents from './gitContents';
import Debug from './debug';

export default class Control {
    action: string;
    infolog: string;
    popupText: string;
    popupShowOK: boolean;
    popupShowCancel: boolean;
    popupShowInput: boolean;
    popupOnclose: Function; 

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
    
    static showPopup(message: string, showOKButton: boolean = true, showCancelButton: boolean = true, showInput: boolean = true, onClose: Function = undefined) {
        let ctrl = new Control("showPopup");
        ctrl.popupText = message;
        ctrl.popupOnclose = onClose;
        ctrl.popupShowOK = showOKButton;
        ctrl.popupShowCancel = showCancelButton;
        ctrl.popupShowInput = showInput;

        Debug.log("Showing popup");
        this.stateChange.update(c => ctrl);
    }
    static closePopup(){
        this.stateChange.update(c => new Control("closePopup"));
    }
    static closeMenu(){
        this.stateChange.update(c => new Control("closeMenu"));
    }



    static setQueryString(obj: any) {
        const stringified = queryString.stringify(obj);
        window.history.pushState({}, '', `${window.origin}?${stringified}`);
        this.stateChange.update(c => new Control("queryStringChanged"));
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
                this.setQueryString({ path: path, page: "contents" });
            }
            Control.currentContents = contents; 

            this.stateChange.update(c => new Control("pathChanged"));
        });

    }

    static openExporter() { 
        this.setQueryString({ page: "export" });            
    }
    static openMainMenu() { 
        this.setQueryString({ page: "mainmenu" });            
    }

}
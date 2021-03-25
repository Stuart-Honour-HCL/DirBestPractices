import type BestPracticeEntry from "./bestPracticeEntry";
import Debug from "./debug";
import GitContents from "./gitContents";
import SurveyEntry from "./surveyEntry";

export default class NFRHelpers {
    static exportSurvey(paths: string[], data: object) {
        Debug.log("Helpers - exportSurvey");
        Debug.log(paths);

        let res: SurveyEntry[] = [];
        paths.forEach(p => {
            let bp: BestPracticeEntry = data[p];
            bp.surveyQuestions.forEach(element => {
                let crtEntry = new SurveyEntry();
                crtEntry.path = p;
                crtEntry.question = element;
                res.push(crtEntry);
            });
        });
        return res;
    }

    /**
     * Creates a file with the given content and serves it for download.
     * 
     * @param filename name of file to download
     * @param text content to put in file
     */
    static downloadFile(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }


    static createOutputDocument(paths: string[], data: object): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fetch("outputDocumentStyled.html").then(resp => {
                resp.text().then(content => {

                    var el = document.createElement("html");
                    el.innerHTML = content;

                    let nav: HTMLElement = el.querySelector("#navbarSupportedContent");
                    let sectionParent: HTMLElement = el.querySelector("#docMainContent");
                
                    let firstPageTemplate: string = el.querySelector("#firstPage").innerHTML; // Used for each NFR
                    let bpEntryTemplate = el.querySelector(".nfr-bp-entry").innerHTML; // Used for each BP entry                    
                    let existingLinks = nav.getElementsByTagName("li");
                   

                    let listEntry = existingLinks[1].innerHTML;
                    let ul = existingLinks[0].parentElement;
                    ul.innerHTML = "";
                    sectionParent.innerHTML = "";


                    // Add first page
                    let firstPage = document.createElement("section"); 
                    firstPage.innerHTML = firstPageTemplate;
                    firstPage.classList.add("resume-section");
                    let exportTime = firstPage.querySelector(".subheading");
                    exportTime.innerHTML = (new Date()).toDateString();

                    sectionParent.appendChild(firstPage);

                    //Get full list of NFRs and lists of best practices grouped by NFRs in entriesForNFR
                    let list: string[] = [];
                    let entriesForNFR = {};

                    paths.forEach(p => {
                        let parts = GitContents.pathComponentsOfPath(p);
                        if (!list.includes(parts[1])) {
                            list.push(parts[1]);
                            entriesForNFR[parts[1]] = new Array();
                        }
                        entriesForNFR[parts[1]].push(p);
                    });
                    list.sort();


                    // Create sections based on list of NFRs
                    for (let i = 0; i < list.length; ++i) {
                        let cnt = i + 1;
                        let sectionID = "nfr" + cnt++;

                        // Add entry to section list
                        let entry = document.createElement("li");
                        entry.innerHTML = listEntry;
                        let a = entry.querySelector("a");
                        a.innerHTML = list[i];
                        a.href = "#" + sectionID;
                        ul.appendChild(entry)


                        // Add section for NFR
                        let section = document.createElement("section"); 
                        section.classList.add("resume-section");
                        section.id = sectionID;

                        let sectionContainer = document.createElement("div"); 
                        sectionContainer.classList.add("resume-section-content");

                        // Sets section title - NFR name                    
                        let sectionTitle = document.createElement("h2");
                        sectionTitle.innerHTML = list[i];


                        sectionContainer.appendChild(sectionTitle);                      
                     

                        entriesForNFR[list[i]].forEach(p => {
                            // Foreach BP entry under the current NFR, create BP div
                            let bp: BestPracticeEntry = data[p];

                            let bpEntry = document.createElement("div");
                            bpEntry.innerHTML = bpEntryTemplate;

                            let bpCont = bpEntry.querySelector(".nfr-bp-content");
                            bpCont.innerHTML = bp.descriptionHTML;

                            let bpEntryTitle = bpEntry.querySelector("h3");
                            bpEntryTitle.innerHTML = bp.titleHTML;

                            sectionContainer.appendChild(bpEntry);

                            let hr = document.createElement("hr");
                            sectionContainer.appendChild(hr);
                        });
                        section.appendChild(sectionContainer);
                        sectionParent.appendChild(section);

                    }



                    resolve(el.outerHTML);
                })
            });
        });
    }


    static OLD_createOutputDocument(paths: string[], data: object): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fetch("outputDocumentTemplate.html").then(resp => {
                resp.text().then(content => {

                    var el = document.createElement("html");
                    el.innerHTML = content;

                    let body = el.querySelector(".nav-bar.nav-link");
                    let nav: HTMLElement = el.querySelector("#navbarSupportedContent");
                    let sectionParent: HTMLElement = el.querySelector("#docMainContent");
                    let sectionTemplate: string = el.querySelector("#nfr1").innerHTML;
                    let questionsSectionTemplate: string = el.querySelector(".nfr-section-questions").innerHTML;

                    let existingLinks = nav.getElementsByTagName("li");

                    let templateActive = existingLinks[0].innerHTML;
                    let templateInactive = existingLinks[1].innerHTML;
                    let ul = existingLinks[0].parentElement;
                    ul.innerHTML = "";
                    sectionParent.innerHTML = "";

                    let cnt = 1;

                    // For each best practice entry, create an entry in the section list and one section in the main content
                    paths.forEach(p => {
                        // Unique ID to link list to content
                        let sectionID = "nfr" + cnt++;

                        let bp: BestPracticeEntry = data[p];



                        // Copy content from template and replace inner HTML

                        // Add entry to section list
                        let entry = document.createElement("li");
                        entry.innerHTML = templateInactive;
                        let a = entry.querySelector("a");
                        a.innerHTML = bp.titleHTML;
                        a.href = "#" + sectionID;
                        ul.appendChild(entry)

                        // Add section to content
                        let section = document.createElement("div");
                        section.innerHTML = sectionTemplate;
                        section.classList.add("nfr-section");
                        section.id = sectionID;

                        let secTitle = section.querySelector("h2");
                        secTitle.innerHTML = bp.titleHTML;
                        let secCont = section.querySelector(".nfr-section-content");
                        secCont.innerHTML = bp.descriptionHTML;

                        let hr = document.createElement("hr");
                        sectionParent.appendChild(section);



                        let qSection = section.querySelector(".nfr-section-questions");
                        if (bp.surveyQuestions.length == 0) {
                            qSection.innerHTML = "~No questions~";
                        }
                        else {
                            let tableBody = qSection.querySelector("tbody");

                            bp.surveyQuestions.forEach(element => {
                                let row = document.createElement("tr");
                                row.innerHTML = `<td>${element.question} </td><td>${element.howToMeasure}</td><td>${element.target}</td>`;
                                tableBody.appendChild(row);
                            });
                        }
                        sectionParent.appendChild(hr);
                    });


                    resolve(el.outerHTML);
                })
            });
        });
    }


    static TEST_GetContents(): Promise<string> {

        return new Promise<string>((resolve, reject) => {
            fetch("cachedData.json").then(resp => {
                resp.text().then(str => {
                    resolve(str);
                })
            });
        });



    }
}
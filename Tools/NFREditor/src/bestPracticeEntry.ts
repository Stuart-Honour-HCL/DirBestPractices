import APIHelper from "./api";
import Debug from "./debug";
import SurveyQuestion from "./surveyQuestion";

export default class BestPracticeEntry {
    descriptionHTML: string;
    titleHTML: string;
    gitPath: string;
    tags: string[];
    surveyQuestions: SurveyQuestion[];


    /**
     * Initialise a best practice entry from the HTML content
     */
    constructor(content: string = undefined) {
        if (!content) {
            this.descriptionHTML = "New best practice entry";
            this.titleHTML = "Best practice entry";
            this.tags = ["new"];
            this.surveyQuestions = [];
        }
        else {
            var el = BestPracticeEntry.getElementFromText(content);

            let col = el.getElementsByClassName("description");
            this.descriptionHTML = col[0] ? col[0].innerHTML : " ";
            Debug.log("Description: " + this.descriptionHTML);

            col = el.getElementsByClassName("title");
            this.titleHTML = col[0] ? col[0].innerHTML : " ";
            Debug.log("Title: " + this.titleHTML);

            this.tags = new Array<string>();
            col = el.getElementsByClassName("tags");
            if (col[0]) {
                let tagElement = col[0].getElementsByClassName("tag");

                for (let i = 0; i < tagElement.length; ++i) {
                    this.tags.push(tagElement[i].innerHTML);
                }
            }
            Debug.log("Tags: " + this.tags);

            this.surveyQuestions = new Array<SurveyQuestion>();
            col = el.getElementsByClassName("survey");
            if (col[0]) {
                let questionElement = col[0].getElementsByClassName("surveyQuestion");

                for (let i = 0; i < questionElement.length; ++i) {
                    let q = new SurveyQuestion();
                    let text = questionElement[i].getElementsByClassName("text");
                    q.question = text[0] ? text[0].innerHTML : " ";
                    let measurement = questionElement[i].getElementsByClassName("measurement");
                    q.howToMeasure = measurement[0] ? measurement[0].innerHTML : " ";
                    let target = questionElement[i].getElementsByClassName("target");
                    q.target = target[0] ? target[0].innerHTML : " ";

                    this.surveyQuestions.push(q);
                }
            }
        }
    }

    /**
     * Returns an in-memory document element
     * Useful to parse HTML using DOM
     * @param content 
     */
    static getElementFromText(content: string): HTMLHtmlElement {
        var el = document.createElement("html");
        el.innerHTML =
            "<html><head><title></title></head><body>" +
            content +
            "</body></html>";
        return el;
    }

    /**
     * Converts best practice entry to HTML
     */
    generateHTML(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fetch("htmlTemplate.html")
                .then((response) => response.text())
                .then((text) => {
                    let el = BestPracticeEntry.getElementFromText(text);

                    el.getElementsByClassName("title")[0].innerHTML = this.titleHTML;
                    el.getElementsByClassName("description")[0].innerHTML = this.descriptionHTML

                    let tagHTML = "";
                    this.tags.forEach((val, idx) => {
                        tagHTML += `<div class='tag'>${val}</div>`;
                    });
                    el.getElementsByClassName("tags")[0].innerHTML = tagHTML;

                    let surveyQuestionsHTML = "";
                    this.surveyQuestions.forEach((val, idx) => {
                        surveyQuestionsHTML += val.generateHTML();
                    });
                    el.getElementsByClassName("survey")[0].innerHTML = surveyQuestionsHTML;

                    let res = el.getElementsByTagName("body")[0].innerHTML;

                    Debug.log("Saved HTML: " + res);
                    resolve(res);
                });
        });
    }
}
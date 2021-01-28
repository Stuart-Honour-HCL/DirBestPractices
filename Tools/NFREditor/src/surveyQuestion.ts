export default class SurveyQuestion {
    question: string;
    howToMeasure: string;
    target: string;
    tags: string[];

    constructor() {
        this.question = "New question";
        this.howToMeasure = "How to measure";
        this.target = "Target";
        this.tags = [];
    }

    generateHTML(): string {
        return `
    <div class="surveyQuestion">
        <div class="text">${this.question}</div>
        <div class="measurement">${this.howToMeasure}</div>
        <div class="target">${this.target}</div>
    </div>`;

    }
}
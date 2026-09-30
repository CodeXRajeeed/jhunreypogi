# StudyMate

StudyMate is a responsive, browser-only practice quiz prototype. It turns pasted notes or a small plain-text file into fill-in-the-blank multiple-choice questions, then checks answers and shows the source sentence for review.

## Run

Open `index.html` in a modern browser. No install or build step is required. The CSS and JavaScript files are in the same folder as the page.

## Current prototype behavior

- Quiz generation runs locally in the browser from the supplied text.
- The word-selection setting changes which terms are chosen for blanks.
- Questions, answers, and scores are temporary; they are not saved.
- Only `.txt` and `.md` files up to 1 MB can be selected. PDF and Word documents are not parsed.
- This prototype does not call an AI service, upload notes, provide accounts, or persist progress.

For best results, provide several complete sentences with specific terms and concepts. The quiz uses words from the notes as answer choices, so it is a recall exercise rather than an AI-generated assessment.

## Validate JavaScript syntax

With Node.js installed, run:

```sh
npm run check
```

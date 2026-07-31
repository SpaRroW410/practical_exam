# Exam Presentation System

A lightweight browser-based presentation system for community medicine exam setup and review.

## Structure

- index.html
- css/main.css, home.css, exam.css, timer.css
- js/app.js, config.js, data.js, render.js, navigation.js, timer.js, ui.js
- templates/home.js, clinical.js, epidemiology.js, biostatistics.js, ospe.js, spotter.js, summary.js
- data/questions.json

## Run locally

Open index.html in a browser, or serve the folder using a simple static server:

```bash
python -m http.server 8000
```

Then visit http://127.0.0.1:8000/.

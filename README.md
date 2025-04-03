# Katakana Practice! - Interactive Keyboard Game

## Description

A simple, kawaii-themed web-based game designed to help users learn and practice Japanese Katakana characters. It features a unique interactive keyboard inspired by smartphone flick input, making typing and learning Katakana more intuitive and engaging.

The game presents random basic Japanese vocabulary words (written in Romaji) and prompts the user to type the corresponding Katakana using the on-screen keyboard.

## Features

*   **Interactive Flick-Style Keyboard:** Press and hold keys like `ア`, `カ`, etc., then release over the desired vowel variant (`イ`, `ウ`, `エ`, `オ`) to type it. Release over the center key to type the base character.
*   **Special Characters Menu:** Press and hold the `-` key to access small kana (`ッ`, `ャ`, `ュ`, `ョ`).
*   **Dakuten/Handakuten Cycling:** Click the `゛゜` button to cycle the last typed character through its voiced (゛) and semi-voiced (゜) forms where applicable (e.g., ハ → バ → パ → ハ).
*   **Random Word Generation:** Presents common loanwords written in Katakana, displayed as Romaji prompts.
*   **Instant Feedback:** Visual feedback (green for correct, red for wrong) after checking an answer.
*   **Scoring:** Tracks the number of successful attempts and mistakes.
*   **Mistake History:** Allows viewing a list of incorrect attempts during the current session to focus learning.
*   **Minimalist & Kawaii Design:** Uses pastel colors, a rounded font, and a dark background for a pleasant user experience.

## Technologies Used

*   HTML5
*   CSS3
*   Vanilla JavaScript (ES6+)
*   Google Fonts (M PLUS Rounded 1c)

## How to Run

1.  Clone this repository or download the source code.
    ```bash
    git clone https://github.com/RodrigoBG13/katakana-practice.git
    cd katakana-practice
    ```
2.  Open the `index.html` file directly in your web browser.

No build steps or dependencies are required.

## Potential Future Improvements

*   Add more vocabulary, including words with more complex combinations.
*   Implement difficulty levels.
*   Add audio pronunciation for characters and words.
*   Save progress (score, history) using `localStorage`.
*   Refine UI/UX, possibly adding touch event support for mobile.

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const romajiWordDisplay = document.getElementById('romaji-word');
    const katakanaInput = document.getElementById('katakana-input');
    const keyboard = document.getElementById('keyboard');
    const variantMenuContainer = document.getElementById('variant-menu-container');
    const variantMenu = document.getElementById('variant-menu');
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const feedbackText = document.getElementById('feedback-text');
    const successCountDisplay = document.getElementById('success-count');
    const mistakeCountDisplay = document.getElementById('mistake-count');
    const historyList = document.getElementById('history-list');
    const historyArea = document.getElementById('history-area');
    const toggleHistoryButton = document.getElementById('toggle-history');
    const checkButton = document.getElementById('check-button');
    const backspaceButton = document.getElementById('backspace-button');
    const clearButton = document.getElementById('clear-button');
    const modifierToggleButton = document.getElementById('modifier-toggle-button');
    const gameContainer = document.getElementById('game-container'); // Get container for positioning

    // --- Game State ---
    let currentWord = null;
    let successCount = 0;
    let mistakeCount = 0;
    let historyLog = [];
    let activeVariantKey = null; // Track which key's variant menu is open
    let isMouseDownOnKey = false; // Track if mouse button is down on a key that opens a menu

    // --- Katakana Data ---
    // (Vocabulary remains the same)
    const vocabulary = [
        { romaji: "amerika", katakana: "アメリカ" }, { romaji: "kamera", katakana: "カメラ" },
        { romaji: "terebi", katakana: "テレビ" }, { romaji: "aisu", katakana: "アイス" },
        { romaji: "basu", katakana: "バス" }, { romaji: "hoteru", katakana: "ホテル" },
        { romaji: "naifu", katakana: "ナイフ" }, { romaji: "pan", katakana: "パン" },
        { romaji: "rajio", katakana: "ラジオ" }, { romaji: "tomato", katakana: "トマト" },
        { romaji: "nekutai", katakana: "ネクタイ" }, { romaji: "sofa-", katakana: "ソファー" },
        { romaji: "ko-hi-", katakana: "コーヒー" }, { romaji: "taoru", katakana: "タオル" },
        { romaji: "petto", katakana: "ペット" }, { romaji: "beddo", katakana: "ベッド" },
        { romaji: "gita-", katakana: "ギター" }, { romaji: "piano", katakana: "ピアノ" },
        { romaji: "miruku", katakana: "ミルク" }, { romaji: "banana", katakana: "バナナ" },
        { romaji: "piza", katakana: "ピザ" }, { romaji: "ju-su", katakana: "ジュース"},
        { romaji: "kyampu", katakana: "キャンプ"}, { romaji: "okane", katakana: "オカネ" },
        { romaji: "gasu", katakana: "ガス" },
    ];

    // Character Cycling Logic: plain -> dakuten -> handakuten -> plain
    const cycleMap = {
        // K行 G行
        'カ': 'ガ', 'ガ': 'カ', 'キ': 'ギ', 'ギ': 'キ', 'ク': 'グ', 'グ': 'ク', 'ケ': 'ゲ', 'ゲ': 'ケ', 'コ': 'ゴ', 'ゴ': 'コ',
        // S行 Z行
        'サ': 'ザ', 'ザ': 'サ', 'シ': 'ジ', 'ジ': 'シ', 'ス': 'ズ', 'ズ': 'ス', 'セ': 'ゼ', 'ゼ': 'セ', 'ソ': 'ゾ', 'ゾ': 'ソ',
        // T行 D行
        'タ': 'ダ', 'ダ': 'タ', 'チ': 'ヂ', 'ヂ': 'チ', 'ツ': 'ヅ', 'ヅ': 'ツ', 'テ': 'デ', 'デ': 'テ', 'ト': 'ド', 'ド': 'ト',
        // H行 B行 P行
        'ハ': 'バ', 'バ': 'パ', 'パ': 'ハ', 'ヒ': 'ビ', 'ビ': 'ピ', 'ピ': 'ヒ', 'フ': 'ブ', 'ブ': 'プ', 'プ': 'フ',
        'ヘ': 'ベ', 'ベ': 'ペ', 'ペ': 'ヘ', 'ホ': 'ボ', 'ボ': 'ポ', 'ポ': 'ホ',
        // Special Cases (like small tsu) - can add ウ -> ヴ if needed
        'ウ': 'ヴ', 'ヴ': 'ウ',
        // Add other specific cycles if necessary
    };


    // --- Functions ---

    function getRandomWord() { /* ... (same as before) ... */
        const randomIndex = Math.floor(Math.random() * vocabulary.length);
        return vocabulary[randomIndex];
    }
    function displayNewWord() { /* ... (same as before) ... */
        currentWord = getRandomWord();
        romajiWordDisplay.textContent = currentWord.romaji.replace(/-/g, 'ー'); // Show long vowel mark
        katakanaInput.textContent = '';
    }
    function updateCounters() { /* ... (same as before) ... */
        successCountDisplay.textContent = successCount;
        mistakeCountDisplay.textContent = mistakeCount;
    }
    function showFeedback(isCorrect) { /* ... (same as before) ... */
        feedbackOverlay.classList.remove('correct', 'wrong');
        if (isCorrect) {
            feedbackText.textContent = 'Correct! (正解!)';
            feedbackOverlay.classList.add('correct');
        } else {
            feedbackText.innerHTML = `Wrong (間違い)<br><span style="font-size: 0.6em;">Correct: ${currentWord.katakana}</span>`;
            feedbackOverlay.classList.add('wrong');
        }
        feedbackOverlay.classList.add('show');
        setTimeout(() => feedbackOverlay.classList.remove('show'), 1500);
    }
    function addMistakeToHistory(romaji, userInput, correctKatakana) { /* ... (same as before) ... */
        historyLog.push({ romaji, userInput, correctKatakana });
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="romaji-hist">Romaji: ${romaji.replace(/-/g, 'ー')}</span>
            <span class="user-input-hist">Your input: ${userInput || '(empty)'}</span>
            <span class="correct-kana-hist">Correct: ${correctKatakana}</span>
        `;
        historyList.insertBefore(li, historyList.firstChild);
    }
    function checkAnswer() { /* ... (same as before, but hide menu first) ... */
        hideVariantMenu(); // Ensure menu is hidden before checking
        const userInput = katakanaInput.textContent;
        const correctAnswer = currentWord.katakana;

        if (userInput === correctAnswer) {
            successCount++;
            showFeedback(true);
        } else {
            mistakeCount++;
            showFeedback(false);
            addMistakeToHistory(currentWord.romaji, userInput, correctAnswer);
        }

        updateCounters();
        setTimeout(displayNewWord, 500);
    }

    function typeCharacter(char) {
        // Handle special display cases if needed, though dataset.char should be correct
         let actualChar = char;
         if (char === '（ヤ）') actualChar = 'ャ';
         if (char === '（ユ）') actualChar = 'ュ';
         if (char === '（ヨ）') actualChar = 'ョ';
         if (char === '（ワ）') actualChar = 'ヮ'; // Or keep ワ based on preference
         // Add similar logic if using display variants for small tsu etc.

        katakanaInput.textContent += actualChar;
    }

    function cycleLastCharacterModifier() {
        let currentText = katakanaInput.textContent;
        if (currentText.length === 0) return; // Nothing to modify

        const lastChar = currentText.slice(-1);
        const cycledChar = cycleMap[lastChar]; // Look up the next char in the cycle

        if (cycledChar) {
            katakanaInput.textContent = currentText.slice(0, -1) + cycledChar;
        }
        // If the last char isn't in the cycleMap, do nothing
    }


    function handleBackspace() { /* ... (same as before) ... */
        katakanaInput.textContent = katakanaInput.textContent.slice(0, -1);
    }
    function handleClear() { /* ... (same as before) ... */
        katakanaInput.textContent = '';
    }

    // --- NEW Variant Menu Logic (mousedown/mouseup) ---

    function showVariantMenu(keyElement) {
        hideVariantMenu(); // Hide any previous menu

        const baseChar = keyElement.dataset.base;
        const variants = JSON.parse(keyElement.dataset.variants || '[]');
        if (variants.length === 0) return; // Should not happen for keys that trigger this

        activeVariantKey = keyElement;
        activeVariantKey.classList.add('active-menu-key'); // Style the key while menu is open
        variantMenu.innerHTML = ''; // Clear previous variants
        variantMenu.style.display = 'block';

        // --- Create Variant Buttons ---
        const allChars = variants; // Base char is handled by mouseup on original key
        const angleStep = 360 / allChars.length;
        // Adjust radius based on number of variants? Fewer variants might need smaller radius
        const radius = allChars.length > 4 ? 65 : 55; // Example adjustment

        allChars.forEach((char, index) => {
            let displayChar = char;
            let actualChar = char;
            // Handle display vs actual character (e.g., small kana)
            if (char.startsWith('（') && char.endsWith('）')) {
                 displayChar = char.substring(1, char.length - 1);
                 if (displayChar === 'ヤ') actualChar = 'ャ';
                 else if (displayChar === 'ユ') actualChar = 'ュ';
                 else if (displayChar === 'ヨ') actualChar = 'ョ';
                 else if (displayChar === 'ワ') actualChar = 'ヮ';
                 else actualChar = displayChar; // Fallback
            } else if (char === 'ッ') {
                displayChar = 'ｯ'; // Use small display if desired
                actualChar = 'ッ';
            }
             // Add more specific cases if needed for ャ, ュ, ョ if not using （） format

            const button = document.createElement('button');
            button.className = 'variant-key';
            button.textContent = displayChar;
            button.dataset.char = actualChar; // Store the actual character to type

            // Position buttons circularly around the center (0,0 relative to menu)
            const angle = (angleStep * index) - 90; // Start from top
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);

            // Center the button itself using translate
            button.style.left = `calc(50% + ${x}px)`;
            button.style.top = `calc(50% + ${y}px)`;
            button.style.transform = 'translate(-50%, -50%)'; // Center the button on its coordinates

            // Add hover listener for visual feedback (CSS :hover also works)
            // button.addEventListener('mouseenter', () => button.classList.add('hovered'));
            // button.addEventListener('mouseleave', () => button.classList.remove('hovered'));

            variantMenu.appendChild(button);
        });

        // --- Position the Menu ---
        // Position the menu container centered over the triggering key
        const keyRect = keyElement.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect(); // Position relative to game container

        // Calculate the center of the key relative to the game container
        const keyCenterX = keyRect.left - containerRect.left + keyRect.width / 2;
        const keyCenterY = keyRect.top - containerRect.top + keyRect.height / 2;

        // Set menu size (adjust based on radius and button size)
        const menuDiameter = radius * 2 + 50; // Diameter + button size
        variantMenu.style.width = `${menuDiameter}px`;
        variantMenu.style.height = `${menuDiameter}px`;

        // Position the menu so its center aligns with the key's center
        variantMenu.style.left = `${keyCenterX - menuDiameter / 2}px`;
        variantMenu.style.top = `${keyCenterY - menuDiameter / 2}px`;

        // Set flag indicating mouse is down and menu is active
        isMouseDownOnKey = true;
    }

    function hideVariantMenu() {
        if (activeVariantKey) {
             activeVariantKey.classList.remove('active-menu-key'); // Remove style from base key
        }
        variantMenu.style.display = 'none';
        variantMenu.innerHTML = ''; // Clear content
        activeVariantKey = null;
        isMouseDownOnKey = false; // Reset flag
    }

    // --- Event Listeners ---

    // Keyboard Interaction (mousedown to show menu)
    keyboard.addEventListener('mousedown', (e) => {
        const targetKey = e.target.closest('.key'); // Find the key element clicked
        if (!targetKey) return;

        // Check if it's a key that should open a variant menu
        if (targetKey.dataset.base && targetKey.dataset.variants) {
            e.preventDefault(); // Prevent text selection drag behavior
            showVariantMenu(targetKey);
        }
        // Click on other keys (modifier, backspace, clear) handled by separate 'click' listeners
    });

    // Global Mouseup Listener (Revised for better target detection)
    document.addEventListener('mouseup', (e) => {
        // Only proceed if the mouse interaction *started* on a key that opens a menu
        if (!isMouseDownOnKey || !activeVariantKey) {
            if (activeVariantKey) hideVariantMenu(); // Hide if somehow stuck open
            isMouseDownOnKey = false; // Reset flag just in case
            return;
        }

        // Store key details before resetting state, in case hideVariantMenu clears them early
        const currentlyActiveKey = activeVariantKey;
        const baseChar = currentlyActiveKey.dataset.base;

        // We definitely had a menu open from a mousedown, now the mouse is released
        isMouseDownOnKey = false; // Reset state flag

        // Find what element is directly under the cursor
        const targetElement = document.elementFromPoint(e.clientX, e.clientY);

        let characterTyped = false; // Flag to track if we successfully typed

        // --- Priority 1: Check if released over a VARIANT key ---
        if (targetElement && targetElement.classList.contains('variant-key') && variantMenu.contains(targetElement)) {
            // console.log("Released on Variant:", targetElement.dataset.char);
            typeCharacter(targetElement.dataset.char);
            characterTyped = true;
        }

        // --- Priority 2: If NOT on a variant, check if released within the ORIGINAL key's bounds ---
        if (!characterTyped) {
            const keyRect = currentlyActiveKey.getBoundingClientRect();
            // Check if the mouse coordinates (e.clientX, e.clientY) are within the key's rectangle
            if (
                e.clientX >= keyRect.left &&
                e.clientX <= keyRect.right &&
                e.clientY >= keyRect.top &&
                e.clientY <= keyRect.bottom
            ) {
                 // console.log("Released on Original Key Bounds:", baseChar);
                 typeCharacter(baseChar);
                 characterTyped = true;
            }
        }

        // --- If released elsewhere (neither variant nor original key bounds) ---
        if (!characterTyped) {
            // console.log("Released outside valid targets.");
            // Do nothing - selection cancelled
        }

        // Hide the menu now that the interaction is fully processed
        hideVariantMenu();
    });

     // Prevent context menu on long press/right-click on keys that open menus
     keyboard.addEventListener('contextmenu', (e) => {
         const targetKey = e.target.closest('.key');
         if (targetKey && targetKey.dataset.base && targetKey.dataset.variants) {
             e.preventDefault();
         }
     });


    // Listener for the modifier toggle button
    modifierToggleButton.addEventListener('click', () => {
        cycleLastCharacterModifier();
    });

    // Other standard click listeners
    checkButton.addEventListener('click', checkAnswer);
    backspaceButton.addEventListener('click', handleBackspace);
    clearButton.addEventListener('click', handleClear);

    toggleHistoryButton.addEventListener('click', () => {
        historyArea.classList.toggle('visible');
    });

    // Allow pressing Enter key to check answer
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !isMouseDownOnKey) { // Don't check if menu is potentially active
            checkAnswer();
        }
        // Optional: Add Escape key to close menu?
        if (e.key === 'Escape' && activeVariantKey) {
             hideVariantMenu();
        }
    });

    // --- Initialize Game ---
    updateCounters();
    displayNewWord();
    if (historyLog.length === 0) {
        historyArea.classList.remove('visible');
    } else {
         historyArea.classList.add('visible');
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const wallet = document.querySelector('.wallet');
    const mascotBox = document.querySelector('.mascot-container');
    const screen = document.querySelector('.screen');
    const uiScene = document.querySelector('.ui-scene');
    
    // Scene 1: Open Wallet (Energetic & Fast)
    setTimeout(() => {
        wallet.classList.add('open');
    }, 500);

    // Scene 2: Mascot leaps in
    setTimeout(() => {
        mascotBox.classList.add('show-mascot');
    }, 1200);

    // Mascot starts waving (cinematic welcoming)
    setTimeout(() => {
        mascotBox.classList.add('wave');
    }, 1600);

    // Transition out (Fast Background Collapse)
    setTimeout(() => {
        screen.classList.add('shrink-scene1');
    }, 2800);

    // Scene 3: UI Cards sliding in with vertical clip-path reveal
    setTimeout(() => {
        mascotBox.classList.remove('wave');
        uiScene.classList.add('show-ui');
    }, 3100);
});

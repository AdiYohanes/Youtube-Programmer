document.addEventListener('DOMContentLoaded', () => {
    // Add loaded class to body to trigger initial sidebar text animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    const names = document.querySelectorAll('.name');
    names.forEach(name => {
        name.setAttribute('data-text', name.textContent);
    });

    // Slider logic
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoPlayInterval;
    const slideDuration = 7000; // 7 seconds

    function init() {
        showSlide(currentSlide);
        startAutoPlay();
    }

    function showSlide(index) {
        // Handle bounds Wrap around
        if (index >= totalSlides) {
            index = 0;
        } else if (index < 0) {
            index = totalSlides - 1;
        }

        // Remove active class from CURRENT slide to trigger exit animations (if any)
        if (slides[currentSlide]) {
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');

            // Hack to restart the progress bar animation on dot
            void dots[currentSlide].offsetWidth;
        }

        currentSlide = index;

        // Force a reflow to ensure the CSS transition triggers properly when adding 'active'
        void slides[currentSlide].offsetWidth;

        // Add active class to new slide and dot
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
        resetAutoPlay();
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
        resetAutoPlay();
    }

    // Event Listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (currentSlide !== index) {
                showSlide(index);
                resetAutoPlay();
            }
        });
    });

    // Auto Play functionality
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, slideDuration);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    function resetAutoPlay() {
        stopAutoPlay();
        // Remove active from current dot to reset progress bar
        dots[currentSlide].classList.remove('active');
        void dots[currentSlide].offsetWidth; // reflow
        dots[currentSlide].classList.add('active');

        startAutoPlay();
    }

    // Pause on hover
    const sliderContainer = document.querySelector('.slider-container');
    sliderContainer.addEventListener('mouseenter', () => {
        stopAutoPlay();
        // optionally pause the dot animation duration
        dots[currentSlide].style.setProperty('--play-state', 'paused');
    });

    sliderContainer.addEventListener('mouseleave', () => {
        // restart interval - note this restarts the full 7s interval
        resetAutoPlay();
        dots[currentSlide].style.setProperty('--play-state', 'running');
    });


    // PARALLAX EFFECT ON MOUSE MOVE
    const hero = document.getElementById('hero');
    const sensitivity = 0.03;

    hero.addEventListener('mousemove', (e) => {
        // Calculate mouse position relative to center of the screen
        const x = (window.innerWidth / 2 - e.pageX) * sensitivity;
        const y = (window.innerHeight / 2 - e.pageY) * sensitivity;

        // Apply transform to the active character wrapper
        const activeCharacterWrapper = slides[currentSlide].querySelector('.character-wrapper');
        if (activeCharacterWrapper) {
            // we use transform translate but keep it slight
            activeCharacterWrapper.style.transform = `translate(${x}px, ${y}px)`;
        }

        // Apply inverse transform to background
        const activeBg = slides[currentSlide].querySelector('.slide-bg');
        if (activeBg) {
            activeBg.style.transform = `translate(calc(-50% + ${-x * 0.5}px), calc(-50% + ${-y * 0.5}px))`;
        }
    });

    hero.addEventListener('mouseleave', () => {
        // Reset transforms when mouse leaves
        const activeCharacterWrapper = slides[currentSlide].querySelector('.character-wrapper');
        const activeBg = slides[currentSlide].querySelector('.slide-bg');

        if (activeCharacterWrapper) {
            activeCharacterWrapper.style.transform = `translate(0px, 0px)`;
            activeCharacterWrapper.style.transition = `transform 0.5s ease-out`;
        }

        // Remove inline transform for bg to let css keyframes take over if any
        if (activeBg) {
            activeBg.style.transform = '';
        }

        // Remove the transition class after reset so mousemove is snappy again
        setTimeout(() => {
            if (activeCharacterWrapper) activeCharacterWrapper.style.transition = `transform 0.1s ease-out`;
        }, 500);
    });

    // Run initialization
    init();
});

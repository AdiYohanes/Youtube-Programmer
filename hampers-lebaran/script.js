document.addEventListener("DOMContentLoaded", () => {
    // 1. Trigger Entrance Animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Parallax Effect based on Mouse Movement
    const scene = document.getElementById('scene');
    const parallaxItems = document.querySelectorAll('.parallax');
    const imageContainer = document.querySelector('.tilt-container');

    if (window.innerWidth > 868) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX - window.innerWidth / 2);
            const y = (e.clientY - window.innerHeight / 2);

            // Background elements parallax
            parallaxItems.forEach(item => {
                const speed = item.getAttribute('data-speed');
                const xPos = (x * speed) / 100;
                const yPos = (y * speed) / 100;

                // Use transform, but keep existing animations by wrapping in another div if needed
                // For simplicity here, we apply subtle translation
                item.style.transform = `translate(${xPos}px, ${yPos}px)`;
            });

            // 3D Tilt for main image wrapper
            if (imageContainer) {
                const rotateX = (y / window.innerHeight) * -15;
                const rotateY = (x / window.innerWidth) * 15;
                imageContainer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            }
        });

        // Reset image tilt on mouse leave
        document.addEventListener('mouseleave', () => {
            if (imageContainer) {
                imageContainer.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
                imageContainer.style.transition = `transform 0.5s ease`;
                setTimeout(() => {
                    imageContainer.style.transition = ``;
                }, 500);
            }
        });
    }

    // 4. Number Counter Animation for Trust Signals
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the slower

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;

            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target;
            }
        };

        // Start counter when loaded
        setTimeout(updateCount, 1500); // delay after fade in
    });

    // 5. Mobile Menu Toggle Setup (Basic UI logic)
    const mobileToggle = document.getElementById('mobile-toggle');
    mobileToggle.addEventListener('click', () => {
        // Implement mobile menu class toggling here if adding fullscreen menu
        mobileToggle.classList.toggle('active');
        // Example: document.querySelector('.nav-links').classList.toggle('active');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle (basic implementation)
    const menuBtn = document.querySelector('.menu-btn');
    const navCenter = document.querySelector('.nav-center');
    const globalLinks = document.querySelector('.global-links');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            // For a simple single-page landing page, toggling a class
            // or just logging as a placeholder if fully responsive isn't strictly requested for mobile
            console.log('Mobile menu clicked');
            // Basic toggle logic if we were to show/hide nav elements
            if (window.innerWidth <= 1024) {
               if(navCenter.style.display === 'flex') {
                   navCenter.style.display = 'none';
                   globalLinks.style.display = 'none';
               } else {
                   navCenter.style.display = 'flex';
                   navCenter.style.flexDirection = 'column';
                   navCenter.style.position = 'absolute';
                   navCenter.style.top = '80px';
                   navCenter.style.left = '0';
                   navCenter.style.width = '100%';
                   navCenter.style.backgroundColor = '#fff';
                   navCenter.style.padding = '20px';
                   navCenter.style.zIndex = '100';
                   navCenter.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                   
                   globalLinks.style.display = 'block';
               }
            }
        });
    }

    // Button click handlers (prevent default for demo links)
    const links = document.querySelectorAll('a[href="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });

    // Simple interaction for the camera image
    const camera = document.querySelector('.main-camera');
    if (camera) {
        camera.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
            camera.style.transform = `scale(1.02) translateY(-10px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        });

        camera.addEventListener('mouseleave', () => {
            camera.style.transform = `scale(1) translateY(0) rotateY(0deg) rotateX(0deg)`;
        });
    }
});

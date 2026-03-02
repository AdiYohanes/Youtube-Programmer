// script.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Active State Toggling
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add to clicked
            item.classList.add('active');
        });
    });

    // 2. Favorite Button Toggling Animation
    const favButtons = document.querySelectorAll('.fav-btn');
    
    favButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // prevent card click
            btn.classList.toggle('active');
            
            // Swap icon outline vs solid
            const icon = btn.querySelector('i');
            if (btn.classList.contains('active')) {
                icon.classList.remove('bx-heart');
                icon.classList.add('bxs-heart');
            } else {
                icon.classList.remove('bxs-heart');
                icon.classList.add('bx-heart');
            }
        });
    });

    // 3. Simple Search Feedback Effect
    const searchInput = document.querySelector('.search-bar');
    const searchContainer = document.querySelector('.search-container');
    
    searchInput.addEventListener('focus', () => {
        searchContainer.style.transform = 'scale(1.02)';
    });
    
    searchInput.addEventListener('blur', () => {
        searchContainer.style.transform = 'scale(1)';
    });
});

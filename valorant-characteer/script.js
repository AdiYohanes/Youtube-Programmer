/* =====================================================================
    VALORANT AGENT SHOWCASE — script.js  (REDESIGNED)
    ===================================================================*/

// ─── State ──────────────────────────────────────────────────────────
let agents   = [];
let filtered = [];
let currentIdx = 0;
let autoTimer  = null;
let isTransitioning = false;
const AUTO_INTERVAL = 8000;

// ─── Elements ────────────────────────────────────────────────────────
const loader          = document.getElementById('loader');
const loaderBar       = document.getElementById('loaderBar');
const loaderStatus    = document.getElementById('loaderStatus');
const app             = document.getElementById('app');
const bgGradient      = document.getElementById('bgGradient');
const characterPortrait = document.getElementById('characterPortrait');
const characterBgImg  = document.getElementById('characterBgImg');
const characterGlow   = document.getElementById('characterGlow');
const contentPanel    = document.getElementById('contentPanel');
const roleIcon        = document.getElementById('roleIcon');
const roleName        = document.getElementById('roleName');
const agentName       = document.getElementById('agentName');
const agentDesc       = document.getElementById('agentDesc');
const abilitiesRow    = document.getElementById('abilitiesRow');
const discoverBtnText = document.getElementById('discoverBtnText');
const indicators      = document.getElementById('indicators');
const thumbStrip      = document.getElementById('thumbStrip');
const prevBtn         = document.getElementById('prevBtn');
const nextBtn         = document.getElementById('nextBtn');
const currentIndexEl  = document.getElementById('currentIndex');
const totalCountEl    = document.getElementById('totalCount');
const roleFilter      = document.getElementById('roleFilter');
const canvas          = document.getElementById('particlesCanvas');
const glitchOverlay   = document.getElementById('glitchOverlay');
const ctx             = canvas.getContext('2d');

// ─── Particles ───────────────────────────────────────────────────────
const particles = [];
const PARTICLE_COUNT = 65;
let agentColor = '255,70,85';

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}

function spawnParticle(forced = false) {
    return {
        x:       forced ? Math.random() * canvas.width : Math.random() * canvas.width,
        y:       forced ? canvas.height + 10 : Math.random() * canvas.height,
        vx:      (Math.random() - 0.5) * 0.5,
        vy:      -(Math.random() * 1.0 + 0.15),
        size:    Math.random() * 2.2 + 0.4,
        opacity: Math.random() * 0.45 + 0.05,
        life:    0,
        maxLife: Math.random() * 280 + 120,
        color:   Math.random() > 0.6 ? agentColor : '236,232,225',
        twinkle: Math.random() > 0.7,
    };
}

function initParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = spawnParticle();
        p.life = Math.random() * p.maxLife;
        particles.push(p);
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
        p.life++;
        if (p.life >= p.maxLife) {
            particles[i] = spawnParticle(true);
            return;
        }
        const t    = p.life / p.maxLife;
        const fade = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;
        const twinkleFactor = p.twinkle ? 0.6 + 0.4 * Math.sin(p.life * 0.08) : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.opacity * fade * twinkleFactor})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
    });
    requestAnimationFrame(animateParticles);
}

// Burst extra particles on agent change
function burstParticles(x, y, count = 15, color = '255,70,85') {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = Math.random() * 3 + 1;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            size:    Math.random() * 2.5 + 0.5,
            opacity: Math.random() * 0.6 + 0.3,
            life:    0,
            maxLife: Math.random() * 60 + 40,
            color:   color,
            twinkle: false,
        });
    }
}

// ─── Utility ─────────────────────────────────────────────────────────
function pad(n) { return String(n + 1).padStart(2, '0'); }

function hexToRgb(hex) {
    const h = hex.replace(/[^0-9a-f]/gi, '').slice(0, 6);
    if (h.length < 6) return '15,25,35';
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `${r},${g},${b}`;
}

// ─── Glitch Flash Transition ──────────────────────────────────────────
function triggerGlitch() {
    glitchOverlay.classList.remove('flash');
    void glitchOverlay.offsetWidth; // reflow
    glitchOverlay.classList.add('flash');
    setTimeout(() => glitchOverlay.classList.remove('flash'), 550);
}

// Animate the counter number with a quick scroll-up effect
function animateCounter(el, newVal) {
    el.style.transition = 'transform 0.35s cubic-bezier(0.77,0,0.175,1), opacity 0.25s ease';
    el.style.transform  = 'translateY(-12px)';
    el.style.opacity    = '0';
    setTimeout(() => {
        el.textContent = newVal;
        el.style.transition = 'none';
        el.style.transform  = 'translateY(12px)';
        el.style.opacity    = '0';
        void el.offsetWidth;
        el.style.transition = 'transform 0.35s cubic-bezier(0.19,1,0.22,1), opacity 0.3s ease';
        el.style.transform  = 'translateY(0)';
        el.style.opacity    = '1';
    }, 260);
}

// ─── Load Agents ─────────────────────────────────────────────────────
function loadAgents() {
    loaderBar.style.width = '60%';
    loaderStatus.textContent = 'PROCESSING DATA...';

    // The data is now available globally from data.js as `agentsData`
    try {
        const rawData = agentsData.data || agentsData;
        agents = rawData.sort((a, b) => a.displayName.localeCompare(b.displayName));
        
        loaderBar.style.width = '100%';
        loaderStatus.textContent = 'BUILDING ROSTER...';

        initApp();
    } catch (err) {
        loaderStatus.textContent = 'ERROR: DATA NOT FOUND.';
        console.error(err);
    }
}

// ─── Init ─────────────────────────────────────────────────────────────
function initApp() {
    filtered = [...agents];

    resizeCanvas();
    initParticles();
    animateParticles();

    buildThumbnails();
    buildIndicators();

    totalCountEl.textContent = pad(filtered.length - 1);

    loader.classList.add('hide');

    setTimeout(() => {
        app.classList.add('loaded');
        showAgent(0, true);
        startAuto();
    }, 100);

    window.addEventListener('resize', resizeCanvas);
}

// ─── Build Thumbnails ─────────────────────────────────────────────────
function buildThumbnails() {
    thumbStrip.innerHTML = '';
    filtered.forEach((agent, i) => {
        const el = document.createElement('div');
        el.className = 'thumb-item' + (i === currentIdx ? ' active' : '');
        el.dataset.index = i;
        el.innerHTML = `<img src="${agent.displayIcon}" alt="${agent.displayName}" loading="lazy">`;
        el.addEventListener('click', () => {
            if (i !== currentIdx && !isTransitioning) {
                showAgent(i);
                resetAuto();
            }
        });
        thumbStrip.appendChild(el);
    });
}

// ─── Build Indicators ────────────────────────────────────────────────
function buildIndicators() {
    indicators.innerHTML = '';
    const count = Math.min(filtered.length, 12);
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.dataset.index = i;
        dot.addEventListener('click', () => {
            if (!isTransitioning) { showAgent(i); resetAuto(); }
        });
        indicators.appendChild(dot);
    }
}

// ─── Show Agent (with cool transition) ───────────────────────────────
function showAgent(index, immediate = false) {
    if (index < 0) index = filtered.length - 1;
    if (index >= filtered.length) index = 0;

    currentIdx = index;
    const agent = filtered[currentIdx];

    if (!immediate) {
        isTransitioning = true;
        triggerGlitch();
    }

    // ── counters ──
    animateCounter(currentIndexEl, pad(currentIdx));
    totalCountEl.textContent = pad(filtered.length - 1);

    // ── background gradient ──
    const colors = agent.backgroundGradientColors || [];
    const c0 = hexToRgb(colors[0] || '25607aff');
    const c1 = hexToRgb(colors[2] || '0f1923ff');
    agentColor = c0; // update particle color

    bgGradient.style.background = `
        radial-gradient(ellipse 95% 95% at 75% 50%, rgba(${c0},.42) 0%, transparent 65%),
        radial-gradient(ellipse 55% 85% at 100% 80%, rgba(${c0},.18) 0%, transparent 55%),
        radial-gradient(ellipse 65% 65% at 0% 100%, rgba(${c1},.35) 0%, transparent 55%)
    `;

    characterGlow.style.background =
        `radial-gradient(ellipse, rgba(${c0},.38) 0%, transparent 70%)`;

    // ── character portrait transition ──
    const direction = !immediate ? 1 : 0;  // slide from right
    
    // First: Immediately hide text panel elements to prepare for new data
    gsap.killTweensOf(".stagger-item > *");
    gsap.set(".stagger-item > *", { opacity: 0, y: 50 });
    agentName.classList.remove('reveal');

    // Fade out out-going character and bg
    if (!immediate) {
        gsap.to([characterPortrait, characterBgImg], {
            opacity: 0,
            x: direction === 1 ? -80 : 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: loadNewAgentImage
        });
    } else {
        loadNewAgentImage();
    }

    function loadNewAgentImage() {
        const imgSrc = agent.fullPortrait || agent.bustPortrait || agent.displayIcon;
        const bgSrc = agent.background;

        const img = new Image();
        img.onload = () => {
            characterPortrait.src = img.src;
            characterPortrait.alt = agent.displayName;
            characterBgImg.style.backgroundImage = `url(${bgSrc})`;

            // GSAP Enter Animation for Character
            gsap.fromTo(characterPortrait, 
                { opacity: 0, x: direction === 1 ? 80 : 0, scale: 0.93 },
                { opacity: 1, x: 0, scale: 1, duration: 1.2, ease: "power3.out", delay: immediate ? 0 : 0.1 }
            );

            gsap.fromTo(characterBgImg,
                { opacity: 0, scale: 0.9, xPercent: -50, yPercent: -50 },
                { 
                    opacity: app.classList.contains('loaded') ? 0.15 : 0, 
                    scale: 1.05, 
                    xPercent: -50, yPercent: -50,
                    duration: 1.5, ease: "power2.out", delay: immediate ? 0 : 0.2 
                }
            );

            // Burst from character area center
            if (!immediate) {
                burstParticles(
                    canvas.width * 0.78,
                    canvas.height * 0.5,
                    12,
                    c0
                );
            }
        };
        // Set src after defining onload
        img.src = imgSrc;
    }

    // ── content panel text update ──
    roleName.textContent = (agent.role?.displayName || 'UNKNOWN').toUpperCase();
    if (agent.role?.displayIcon) {
        roleIcon.src = agent.role.displayIcon;
        roleIcon.style.display = 'inline';
    } else {
        roleIcon.style.display = 'none';
    }

    agentName.textContent    = agent.displayName.toUpperCase();
    agentName.dataset.text   = agent.displayName.toUpperCase();
    agentDesc.textContent    = agent.description;

    // Abilities Update
    abilitiesRow.innerHTML = '';
    (agent.abilities || []).slice(0, 4).forEach(ab => {
        if (!ab.displayIcon) return;
        const item = document.createElement('div');
        item.className = 'ability-item';
        item.title = ab.displayName + ': ' + ab.description;
        const slot = ab.slot === 'Ultimate' ? 'X' :
                     ab.slot === 'Grenade'  ? 'Q' :
                     ab.slot === 'Ability1' ? 'E' :
                     ab.slot === 'Ability2' ? 'C' :
                     ab.slot === 'Passive'  ? 'P' : ab.slot;
        item.innerHTML = `
            <div class="ability-icon-wrap">
                <img src="${ab.displayIcon}" alt="${ab.displayName}" loading="lazy">
            </div>
            <span class="ability-slot">${slot}</span>
        `;
        abilitiesRow.appendChild(item);
    });

    discoverBtnText.textContent = 'DISCOVER ' + agent.displayName.toUpperCase();

    // GSAP Stagger Entrance for Text Panel
    let staggerDelay = immediate ? 0 : 0.45;
    gsap.to(".stagger-item > *", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: staggerDelay,
        onStart: () => {
            // Reveal text wipe slightly after stagger starts
            setTimeout(() => agentName.classList.add('reveal'), 200);
        },
        onComplete: () => {
            isTransitioning = false;
        }
    });

    // ── dots ──
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.remove('active');
        void dot.offsetWidth;
        if (i === currentIdx % 12) dot.classList.add('active');
    });

    // ── thumbnails ──
    document.querySelectorAll('.thumb-item').forEach((t, i) => {
        t.classList.toggle('active', i === currentIdx);
    });

    // scroll thumb into view
    const activeThumb = thumbStrip.querySelector('.thumb-item.active');
    if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

// ─── Auto Play ────────────────────────────────────────────────────────
function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => showAgent(currentIdx + 1), AUTO_INTERVAL);
}

function resetAuto() {
    clearInterval(autoTimer);
    const activeDot = indicators.querySelector('.dot.active');
    if (activeDot) {
        activeDot.classList.remove('active');
        void activeDot.offsetWidth;
        activeDot.classList.add('active');
    }
    startAuto();
}

// ─── Navigation ───────────────────────────────────────────────────────
prevBtn.addEventListener('click', () => {
    if (!isTransitioning) { showAgent(currentIdx - 1); resetAuto(); }
});
nextBtn.addEventListener('click', () => {
    if (!isTransitioning) { showAgent(currentIdx + 1); resetAuto(); }
});

document.addEventListener('keydown', e => {
    if (isTransitioning) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { showAgent(currentIdx + 1); resetAuto(); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { showAgent(currentIdx - 1); resetAuto(); }
});

// ─── Role Filter ──────────────────────────────────────────────────────
roleFilter.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        roleFilter.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const role = btn.dataset.role;
        filtered = role === 'all' ? [...agents] : agents.filter(a => a.role?.displayName === role);
        currentIdx = 0;
        buildThumbnails();
        buildIndicators();
        totalCountEl.textContent = pad(filtered.length - 1);
        showAgent(0);
        resetAuto();
    });
});

// ─── Pause on hover ───────────────────────────────────────────────────
app.addEventListener('mouseenter', () => clearInterval(autoTimer));
app.addEventListener('mouseleave', startAuto);

// ─── Parallax on mouse move ────────────────────────────────────────────
const hero = document.getElementById('hero');
// Dramatically reduced sensitivity to prevent layout shifting/empty space
const sensitivity = 0.008; 

hero.addEventListener('mousemove', e => {
    // Calculate constraint to avoid massive shifts
    const maxShift = 15;
    let x = (window.innerWidth  / 2 - e.clientX) * sensitivity;
    let y = (window.innerHeight / 2 - e.clientY) * sensitivity;
    
    // Clamp values 
    x = Math.max(-maxShift, Math.min(maxShift, x));
    y = Math.max(-maxShift, Math.min(maxShift, y));

    const wrap = document.getElementById('characterImgWrap');
    if (wrap) {
        // Use will-change in CSS or requestAnimationFrame for performance, 
        // here we just use 3d transform for GPU acceleration
        wrap.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }

    // subtle bg gradient shift
    const bx = 70 + (e.clientX / window.innerWidth  - 0.5) * 5;
    const by = 50 + (e.clientY / window.innerHeight - 0.5) * 5;

    const colors = (filtered[currentIdx]?.backgroundGradientColors) || [];
    const c0 = hexToRgb(colors[0] || '25607aff');
    bgGradient.style.background = `
        radial-gradient(ellipse 95% 95% at ${bx}% ${by}%, rgba(${c0},.42) 0%, transparent 65%),
        radial-gradient(ellipse 55% 85% at 100% 80%, rgba(${c0},.18) 0%, transparent 55%)
    `;
});

hero.addEventListener('mouseleave', () => {
    const wrap = document.getElementById('characterImgWrap');
    if (wrap) {
        wrap.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        wrap.style.transform  = 'translate3d(0px, 0px, 0px)';
        setTimeout(() => { wrap.style.transition = ''; }, 600);
    }
});

// ─── Touch / Swipe ────────────────────────────────────────────────────
let touchStartX = 0;
app.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
app.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 60 && !isTransitioning) {
        dx < 0 ? showAgent(currentIdx + 1) : showAgent(currentIdx - 1);
        resetAuto();
    }
});

// ─── Boot ─────────────────────────────────────────────────────────────
loadAgents();

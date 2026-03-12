/* =====================================================================
   VALORANT AGENT SHOWCASE — script.js  (REDESIGNED)
   ===================================================================*/

const API_URL = 'https://valorant-api.com/v1/agents?isPlayableCharacter=true';

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
async function loadAgents() {
    loaderBar.style.width = '20%';
    loaderStatus.textContent = 'FETCHING AGENTS...';

    try {
        const res = await fetch(API_URL);
        loaderBar.style.width = '60%';
        loaderStatus.textContent = 'PROCESSING DATA...';
        const json = await res.json();

        agents = json.data.sort((a, b) => a.displayName.localeCompare(b.displayName));

        loaderBar.style.width = '90%';
        loaderStatus.textContent = 'BUILDING ROSTER...';

        await new Promise(r => setTimeout(r, 350));
        loaderBar.style.width = '100%';
        await new Promise(r => setTimeout(r, 280));

        initApp();

    } catch (err) {
        loaderStatus.textContent = 'ERROR: UNABLE TO LOAD. CHECK CONNECTION.';
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
    }, 500);

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
    characterPortrait.style.transition = 'none';
    characterPortrait.style.opacity   = '0';
    characterPortrait.style.transform = `translateX(${direction * 80}px) scale(0.93)`;
    // also slide out bg image
    characterBgImg.style.transition   = 'none';
    characterBgImg.style.opacity      = '0';

    const delay = immediate ? 0 : 120;
    setTimeout(() => {
        characterPortrait.src = agent.fullPortrait || agent.bustPortrait || agent.displayIcon;
        characterPortrait.alt = agent.displayName;
        characterBgImg.style.backgroundImage = `url(${agent.background})`;

        // trigger entrance
        characterPortrait.style.transition =
            'transform 1s cubic-bezier(0.19,1,0.22,1) 0.05s, opacity 0.75s ease 0.05s';
        characterBgImg.style.transition =
            'opacity 1.4s ease 0.1s, transform 1.4s ease 0.1s';

        requestAnimationFrame(() => {
            characterPortrait.style.opacity   = '1';
            characterPortrait.style.transform = 'translateX(0) scale(1)';
            characterBgImg.style.opacity      = app.classList.contains('loaded') ? '0.15' : '0';
            characterBgImg.style.transform    = 'translate(-50%,-50%) scale(1.05)';
        });

        // Burst from character area center
        if (!immediate) {
            const rect = canvas.getBoundingClientRect();
            burstParticles(
                canvas.width * 0.78,
                canvas.height * 0.5,
                12,
                c0
            );
        }
    }, delay);

    // ── content panel stagger ──
    contentPanel.classList.remove('animate-in');
    void contentPanel.offsetWidth;

    roleName.textContent = (agent.role?.displayName || 'UNKNOWN').toUpperCase();
    if (agent.role?.displayIcon) {
        roleIcon.src = agent.role.displayIcon;
        roleIcon.style.display = 'inline';
    } else {
        roleIcon.style.display = 'none';
    }

    agentName.textContent    = agent.displayName.toUpperCase();
    agentName.dataset.text   = agent.displayName.toUpperCase();
    agentName.classList.remove('reveal');
    agentDesc.textContent    = agent.description;

    // Abilities
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

    // Stagger in (slight delay to let glitch play first)
    setTimeout(() => {
        requestAnimationFrame(() => {
            contentPanel.classList.add('animate-in');
            setTimeout(() => agentName.classList.add('reveal'), 300);
        });
        isTransitioning = false;
    }, immediate ? 0 : 180);

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
const sensitivity = 0.022;

hero.addEventListener('mousemove', e => {
    const x = (window.innerWidth  / 2 - e.clientX) * sensitivity;
    const y = (window.innerHeight / 2 - e.clientY) * sensitivity;
    const wrap = document.getElementById('characterImgWrap');
    if (wrap) wrap.style.transform = `translate(${x}px, ${y}px)`;

    // subtle bg gradient shift
    const bx = 70 + (e.clientX / window.innerWidth  - 0.5) * 10;
    const by = 50 + (e.clientY / window.innerHeight - 0.5) * 10;

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
        wrap.style.transition = 'transform 0.7s ease-out';
        wrap.style.transform  = 'translate(0px, 0px)';
        setTimeout(() => { wrap.style.transition = ''; }, 700);
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

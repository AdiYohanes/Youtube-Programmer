document.addEventListener("DOMContentLoaded", () => {
    // ---- CONFIGURATION ----
    const maxSpeed = 340;
    const redlineSpeed = 280;
    const totalAngle = 270;

    const speedRadius = 170;
    const rpmRadius = 120;
    const maxRpm = 8000;
    const redlineRpm = 6500;

    // ---- DOM ELEMENTS ----
    const ticksGroup = document.querySelector('.ticks-group');
    const speedTrack = document.querySelector('.speed-track');
    const speedValueText = document.querySelector('.speed-value');
    const needle = document.querySelector('.needle');

    const rpmTrack = document.querySelector('.rpm-track');
    const rpmLabelsContainer = document.querySelector('.rpm-labels');

    const fuelFill = document.querySelector('.fuel-fill');
    const tempFill = document.querySelector('.temp-fill');

    const gearSpanManual = document.querySelector('.gear.manual');
    const leftSignal = document.querySelector('.left-signal');
    const rightSignal = document.querySelector('.right-signal');

    // ---- MATH CONSTANTS ----
    const speedCircumference = 2 * Math.PI * speedRadius;
    const speedActiveLength = speedCircumference * 0.75;

    const rpmCircumference = 2 * Math.PI * rpmRadius;
    const rpmActiveLength = rpmCircumference * 0.75;

    speedTrack.style.strokeDasharray = speedCircumference;
    speedTrack.style.strokeDashoffset = speedCircumference;

    rpmTrack.style.strokeDasharray = rpmCircumference;
    rpmTrack.style.strokeDashoffset = rpmCircumference;

    // ---- GENERATE SPEED TICKS ----
    const step = 20;
    for (let speed = 0; speed <= maxSpeed; speed += 10) {
        const fraction = speed / maxSpeed;
        const angleDeg = fraction * totalAngle;
        const rad = angleDeg * (Math.PI / 180);
        const isMajor = speed % step === 0;
        const isRedline = speed >= redlineSpeed;

        const tickLength = isMajor ? 12 : 6;
        const tickR1 = speedRadius - tickLength;
        const tickR2 = speedRadius;

        const cx = 200, cy = 200;

        const x1 = cx + tickR1 * Math.cos(rad);
        const y1 = cy + tickR1 * Math.sin(rad);
        const x2 = cx + tickR2 * Math.cos(rad);
        const y2 = cy + tickR2 * Math.sin(rad);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("class", `tick-line ${isMajor ? 'major' : ''} ${isRedline ? 'redline' : ''}`);
        ticksGroup.appendChild(line);

        if (isMajor) {
            const textR = speedRadius - 28;
            const tx = cx + textR * Math.cos(rad);
            const ty = cy + textR * Math.sin(rad);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", tx);
            text.setAttribute("y", ty);
            text.setAttribute("class", `tick-text ${isRedline ? 'redline' : ''}`);
            text.textContent = speed;

            text.setAttribute("transform", `rotate(-135 ${tx} ${ty})`);
            ticksGroup.appendChild(text);
        }
    }

    // ---- GENERATE RPM LABELS ----
    const rpmSpans = rpmLabelsContainer.querySelectorAll('span');
    rpmSpans.forEach((span, index) => {
        const fraction = index / 8;
        const angleDeg = fraction * totalAngle;

        const offsetAngle = -225 + angleDeg;
        const r = 95;

        const rad = (offsetAngle) * (Math.PI / 180);
        const x = r * Math.cos(rad);
        const y = r * Math.sin(rad);

        span.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });

    // ---- SETUP STATIC GAUGES (Hidden initially) ----
    fuelFill.style.height = '0%';
    tempFill.style.height = '0%';

    // ---- STATE ANIMATION ----
    let state = {
        speed: 0,
        rpm: 0, // start at 0 RPM
        gear: 1
    };

    function updateDashboard() {
        // Speed
        speedValueText.textContent = Math.round(state.speed);
        const speedFraction = state.speed / maxSpeed;
        const speedAngle = speedFraction * totalAngle;
        needle.style.transform = `translateY(-50%) rotate(${speedAngle}deg)`;

        const speedOffset = speedCircumference - (speedFraction * speedActiveLength);
        speedTrack.style.strokeDashoffset = speedOffset;

        // RPM
        const rpmFraction = Math.min(state.rpm / maxRpm, 1);
        const rpmOffset = rpmCircumference - (rpmFraction * rpmActiveLength);
        rpmTrack.style.strokeDashoffset = rpmOffset;

        if (state.rpm > redlineRpm) {
            rpmTrack.classList.add('redline');
        } else {
            rpmTrack.classList.remove('redline');
        }

        // Gear
        if (state.speed > 5) {
            document.querySelectorAll('.gear').forEach(el => el.classList.remove('active'));
            gearSpanManual.style.display = 'inline-block';
            gearSpanManual.textContent = 'M' + state.gear;
            gearSpanManual.classList.add('active');
        } else {
            gearSpanManual.style.display = 'none';
        }
    }

    updateDashboard();

    // ---- BLINKERS Logic ----
    let blinkInterval;
    function blinkSignal(signalEl, times, delayMs = 0) {
        setTimeout(() => {
            let count = 0;
            blinkInterval = setInterval(() => {
                signalEl.classList.toggle('blink');
                count++;
                if (count >= times * 2) {
                    clearInterval(blinkInterval);
                    signalEl.classList.remove('blink');
                }
            }, 350);
        }, delayMs);
    }

    // ---- AUDIO ELEMENTS ----
    const engineSound = document.getElementById('engineSound');
    const highSpeedSound = document.getElementById('highSpeedSound');
    const startupSound = document.getElementById('startupSound');

    if (engineSound) engineSound.volume = 0.4;
    if (highSpeedSound) highSpeedSound.volume = 0.6;
    if (startupSound) startupSound.volume = 0.8;

    // Optional: Only attempt to play sound if user has interacted with the document
    // Browsers often block autoplaying audio. 
    // We try to play it anyway, and catch any DOMExceptions quietly.
    function playAudioSafe(audioElement) {
        if (!audioElement) return;
        audioElement.currentTime = 0;
        let playPromise = audioElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Audio autoplay prevented. User interaction needed first.");
            });
        }
    }


    // ---- STARTUP ANIMATION SEQUENCE ----
    const startupTl = gsap.timeline({
        onStart: () => {
            playAudioSafe(startupSound);
            setTimeout(() => {
                if (engineSound) {
                    engineSound.loop = true;
                    playAudioSafe(engineSound);
                }
            }, 1000); // start engine idle roughly midway
        },
        onComplete: startDrivingAnimation // Start main animation after startup finishes
    });

    // 1. Reveal Center Display
    startupTl.to(".center-display", {
        opacity: 1,
        scale: 1,
        y: -10,
        duration: 0.5,
        ease: "power2.out"
    })
        // 2. Reveal Tracks
        .to([".track-bg", ".rpm-track-bg", ".speed-track", ".rpm-track"], {
            opacity: 1,
            duration: 0.6,
            ease: "power2.inOut"
        }, "+=0.1")
        // 3. Reveal Needle & Ticks
        .to([".needle-container", ".ticks-group", ".rpm-labels"], {
            opacity: 1,
            duration: 0.6,
            ease: "power2.inOut"
        }, "+=0.1")
        // 4. Reveal Side Panels
        .to(".side-panel", {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.2 // Left then right
        }, "+=0.1")
        // 5. Animate Fuel & Temp rising
        .to(".fuel-fill", {
            height: "85%",
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.3")
        .to(".temp-fill", {
            height: "45%",
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.5")
        // 6. Reveal Bottom Info
        .to(".bottom-info", {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out"
        }, "-=0.2")
        // 7. Engine Start (Idle RPM)
        .to(state, {
            rpm: 800,
            duration: 0.6,
            ease: "power2.out",
            onUpdate: updateDashboard
        }, "-=0.5");


    // ---- MAIN DRIVING ANIMATION ----
    function startDrivingAnimation() {
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, delay: 1 });

        tl.to(state, { rpm: 1500, duration: 0.8, ease: "power1.out", onUpdate: updateDashboard })
            .to(state, { rpm: 800, duration: 0.5, ease: "power1.in", onUpdate: updateDashboard })

            .to(state, {
                speed: 45,
                rpm: 6500,
                duration: 1.5,
                ease: "power2.in",
                onUpdate: updateDashboard
            })
            .to(state, { gear: 2, rpm: 4000, duration: 0.2, onUpdate: updateDashboard })
            .to(state, {
                speed: 95,
                rpm: 6800,
                duration: 1.8,
                ease: "power1.inOut",
                onUpdate: updateDashboard
            })
            .to(state, { gear: 3, rpm: 4500, duration: 0.2, onUpdate: updateDashboard })
            .to(state, {
                speed: 150,
                rpm: 6900,
                duration: 2.2,
                ease: "power1.inOut",
                onUpdate: updateDashboard
            })
            .to(state, { gear: 4, rpm: 4800, duration: 0.2, onUpdate: updateDashboard })
            // HIGH SPEED START
            .to(state, {
                speed: 198,
                rpm: 6600,
                duration: 2.5,
                ease: "power1.out",
                onUpdate: updateDashboard,
                onStart: () => playAudioSafe(highSpeedSound)
            })
            .to(state, {
                speed: 185,
                rpm: 4000,
                duration: 2.0,
                ease: "sine.inOut",
                onUpdate: updateDashboard,
                onStart: () => blinkSignal(leftSignal, 4, 0)
            })
            .to(state, {
                speed: 60,
                rpm: 2500,
                gear: 2,
                duration: 2.0,
                ease: "power3.inOut",
                onUpdate: updateDashboard
            })
            .to(state, {
                speed: 0,
                rpm: 800,
                gear: 1,
                duration: 2.0,
                ease: "power2.out",
                onUpdate: updateDashboard
            });

        tl.repeat(-1);
        tl.repeatDelay(2);
    }
});

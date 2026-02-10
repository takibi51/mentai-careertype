/**
 * Mentai LP v2 - Interactive JavaScript
 * Arc × Butter Style Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all interactions
    initCursorLight();
    initScrollAnimations();
    initFlowSteps();
    initMascotAnimation();
    initSmoothScroll();
    initMobileMenu();
});

/**
 * Cursor Light Effect
 * Creates a subtle light that follows the cursor
 */
function initCursorLight() {
    const cursorLight = document.getElementById('cursorLight');
    if (!cursorLight) return;

    let mouseX = 0;
    let mouseY = 0;
    let lightX = 0;
    let lightY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Smooth follow effect
        lightX += (mouseX - lightX) * 0.1;
        lightY += (mouseY - lightY) * 0.1;

        cursorLight.style.left = lightX + 'px';
        cursorLight.style.top = lightY + 'px';

        requestAnimationFrame(animateCursor);
    }

    animateCursor();
}

/**
 * Scroll Animations
 * Fade in elements as they enter the viewport
 */
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-up');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach((el) => {
        observer.observe(el);
    });
}

/**
 * Flow Steps Animation
 * Animate check marks as steps come into view
 */
function initFlowSteps() {
    const flowSteps = document.querySelectorAll('.flow-step');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    let delay = 0;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Add completed class with staggered delay
                setTimeout(() => {
                    entry.target.classList.add('completed');
                }, delay);
                delay += 300;
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    flowSteps.forEach((step) => {
        observer.observe(step);
    });
}

/**
 * Mascot Animation
 * Adds subtle blink and hover effects to the mascot
 */
function initMascotAnimation() {
    const mascot = document.getElementById('heroMascot');
    if (!mascot) return;

    // Blink animation
    setInterval(() => {
        mascot.style.transform = 'scaleY(0.9)';
        setTimeout(() => {
            mascot.style.transform = 'scaleY(1)';
        }, 100);
    }, 4000);

    // Hover wobble
    mascot.addEventListener('mouseenter', () => {
        mascot.style.animation = 'none';
        mascot.style.transform = 'rotate(-5deg) scale(1.05)';
    });

    mascot.addEventListener('mouseleave', () => {
        mascot.style.transform = 'rotate(0) scale(1)';
        mascot.style.animation = 'mascotFloat 4s ease-in-out infinite';
    });
}

/**
 * Smooth Scroll
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Mobile Menu Toggle
 * Hamburger menu functionality for mobile devices
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');

    if (!mobileMenuBtn || !mobileNav) return;

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });

    // Close menu when clicking a link
    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            mobileNav.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
            mobileMenuBtn.classList.remove('active');
            mobileNav.classList.remove('active');
        }
    });
}

/**
 * Button Animations
 * Squash & Stretch effect on button press
 */
document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousedown', () => {
        btn.style.transform = 'scale(0.96) translateY(2px)';
    });

    btn.addEventListener('mouseup', () => {
        btn.style.transform = '';
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
    });
});

/**
 * Glass Card Hover Effects
 * Enhanced hover interactions for glass cards
 */
document.querySelectorAll('.glass-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

/**
 * Particles Animation
 * Randomize particle positions and animations
 */
document.querySelectorAll('.particle').forEach((particle, index) => {
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.animationDuration = (8 + Math.random() * 8) + 's';
    particle.style.opacity = Math.random() * 0.5 + 0.2;
});

/**
 * Radar Chart Animation
 * Animate the radar chart data points on scroll
 */
const radarData = document.querySelector('.radar-data');
if (radarData) {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                radarData.style.transition = 'all 1s ease-out';
                radarData.style.opacity = '1';
                radarData.style.transform = 'scale(1)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial state
    radarData.style.opacity = '0';
    radarData.style.transform = 'scale(0.8)';
    observer.observe(radarData);
}

/**
 * Skill Cards Counter Animation
 * Animate skill numbers counting up
 */
document.querySelectorAll('.skill-value').forEach((skillValue) => {
    const targetValue = parseInt(skillValue.textContent);

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateCounter(skillValue, targetValue);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    observer.observe(skillValue);
});

function animateCounter(element, target) {
    let current = 0;
    const duration = 1500;
    const increment = target / (duration / 16);

    function update() {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    update();
}

/**
 * Scout Button Interactions
 */
document.querySelectorAll('.scout-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
        const originalText = this.textContent;
        this.textContent = '✓ 送信完了';
        this.style.background = 'linear-gradient(135deg, #34D399, #10B981)';
        this.style.pointerEvents = 'none';

        setTimeout(() => {
            this.textContent = originalText;
            this.style.background = '';
            this.style.pointerEvents = '';
        }, 2000);
    });
});

/**
 * Testimonial Cards - Auto scroll on mobile
 */
if (window.innerWidth < 768) {
    const testimonialGrid = document.querySelector('.testimonials-grid');
    if (testimonialGrid) {
        testimonialGrid.style.overflowX = 'auto';
        testimonialGrid.style.scrollSnapType = 'x mandatory';
        testimonialGrid.querySelectorAll('.testimonial-card').forEach((card) => {
            card.style.scrollSnapAlign = 'start';
            card.style.minWidth = '85vw';
        });
    }
}

console.log('🎯 Mentai LP v2 initialized successfully!');

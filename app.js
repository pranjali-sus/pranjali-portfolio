document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. PRELOADER --- */
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Fade out preloader when page finishes loading
        window.addEventListener('load', () => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.visibility = 'hidden';
            }, 500);
        });
        
        // Fallback safety timeout (2.5s) if load event doesn't fire
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.visibility = 'hidden';
            }, 500);
        }, 2500);
    }


    /* --- 3. STICKY HEADER & SCROLL SPY --- */
    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('nav-scrolled');
        } else {
            header.classList.remove('nav-scrolled');
        }
    });

    // Scroll Spy: Highlight active navigation link
    const scrollSpyOptions = {
        root: null,
        rootMargin: '-30% 0px -70% 0px', // Trigger when section occupies center of screen
        threshold: 0
    };

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    const href = link.getAttribute('href').substring(1);
                    if (href === id) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, scrollSpyOptions);

    sections.forEach(section => {
        scrollSpyObserver.observe(section);
    });

    /* --- 4. MOBILE MENU --- */
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            mobileMenuToggle.classList.toggle('open');
            mobileMenuToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                mobileMenuToggle.classList.remove('open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* --- 5. FADE-IN ON SCROLL --- */
    const fadeObserverOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Trigger once
            }
        });
    }, fadeObserverOptions);

    const fadeSections = document.querySelectorAll('.fade-in-section');
    fadeSections.forEach(section => {
        fadeObserver.observe(section);
    });

    /* --- 6. ACCORDION PANELS --- */
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            const isActive = item.classList.contains('active');

            // Close other accordions in the same project card
            const projectCard = item.closest('.project-details-side');
            if (projectCard) {
                projectCard.querySelectorAll('.accordion-item').forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherContent = otherItem.querySelector('.accordion-content');
                        if (otherContent) otherContent.style.maxHeight = null;
                    }
                });
            }

            // Toggle current accordion
            if (isActive) {
                item.classList.remove('active');
                content.style.maxHeight = null;
            } else {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    /* --- 7. PROJECT CARD IMAGE SWAPPER --- */
    const pageDots = document.querySelectorAll('.project-page-dot');

    pageDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const projectKey = dot.parentElement.getAttribute('data-project');
            const targetPageNum = dot.getAttribute('data-page');
            
            // Sync active dot in the card
            const dotsInCard = dot.parentElement.querySelectorAll('.project-page-dot');
            dotsInCard.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            
            // Swap image source
            const imgElement = document.getElementById(`${projectKey}_img`);
            if (imgElement) {
                imgElement.src = `assets/projects/${projectKey}_page${targetPageNum}.png`;
            }
        });
    });

    /* --- 8. GALLERY LIGHTBOX --- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCounter = document.getElementById('lightboxCounter');

    let currentGallery = {
        type: '',        // 'project' or 'doc'
        key: '',         // e.g. 'customer_retention' or 'assets/deloitte_cert.png'
        currentPage: 1,
        totalPages: 1
    };

    // Open lightbox for dashboard screenshots
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
    lightboxTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const projectKey = trigger.getAttribute('data-project');
            const pagesCount = parseInt(trigger.getAttribute('data-pages-count'), 10);
            
            // Get currently active page for this project in the card
            let activePageNum = 1;
            const projectCard = trigger.closest('.project-card');
            if (projectCard) {
                const activeDot = projectCard.querySelector('.project-page-dot.active');
                if (activeDot) {
                    activePageNum = parseInt(activeDot.getAttribute('data-page'), 10);
                }
            }

            currentGallery = {
                type: 'project',
                key: projectKey,
                currentPage: activePageNum,
                totalPages: pagesCount
            };

            openLightbox();
        });
    });

    // Open lightbox for certificates / images
    const docTriggers = document.querySelectorAll('.doc-trigger');
    docTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const src = trigger.getAttribute('data-src');
            
            currentGallery = {
                type: 'doc',
                key: src,
                currentPage: 1,
                totalPages: 1
            };

            openLightbox();
        });
    });

    function openLightbox() {
        if (!lightbox) return;
        updateLightboxContent();
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Stop background scrolling
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }

    function updateLightboxContent() {
        if (currentGallery.type === 'doc') {
            lightboxImg.src = currentGallery.key;
            lightboxPrev.style.display = 'none';
            lightboxNext.style.display = 'none';
            lightboxCounter.style.display = 'none';
        } else {
            // Dashboard screenshot
            // Single page project (like AdventureWorks)
            if (currentGallery.totalPages <= 1) {
                lightboxImg.src = `assets/projects/${currentGallery.key}_dashboard.png`;
                lightboxPrev.style.display = 'none';
                lightboxNext.style.display = 'none';
                lightboxCounter.style.display = 'none';
            } else {
                // Multi-page project
                lightboxImg.src = `assets/projects/${currentGallery.key}_page${currentGallery.currentPage}.png`;
                lightboxPrev.style.display = 'flex';
                lightboxNext.style.display = 'flex';
                lightboxCounter.style.display = 'block';
                lightboxCounter.textContent = `Page ${currentGallery.currentPage} of ${currentGallery.totalPages}`;
            }
        }
    }

    // Lightbox Controls
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        // Close when clicking background outside image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-wrapper')) {
                closeLightbox();
            }
        });
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            if (currentGallery.type === 'project' && currentGallery.totalPages > 1) {
                currentGallery.currentPage--;
                if (currentGallery.currentPage < 1) {
                    currentGallery.currentPage = currentGallery.totalPages;
                }
                updateLightboxContent();
            }
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            if (currentGallery.type === 'project' && currentGallery.totalPages > 1) {
                currentGallery.currentPage++;
                if (currentGallery.currentPage > currentGallery.totalPages) {
                    currentGallery.currentPage = 1;
                }
                updateLightboxContent();
            }
        });
    }

    // Keyboard support for Lightbox
    window.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.style.display === 'flex') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                if (lightboxPrev.style.display !== 'none') lightboxPrev.click();
            } else if (e.key === 'ArrowRight') {
                if (lightboxNext.style.display !== 'none') lightboxNext.click();
            }
        }
    });

    /* --- 9. BACK TO TOP --- */
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* --- 10. CONTACT FORM SUBMISSION --- */
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('contactFormFeedback');

    if (contactForm && formFeedback) {
        // Initialize EmailJS
        // ========================================================
        // STEP 1: INSERT YOUR EMAILJS PUBLIC KEY HERE
        // Retrieve this from your EmailJS Dashboard -> Account -> API Keys
        // ========================================================
        const EMAILJS_PUBLIC_KEY = 'AKm0y8zYxeZmUiNBE'; 
        
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_PUBLIC_KEY);
        } else {
            console.error('EmailJS SDK not loaded.');
        }

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            // Validation
            const nameInput = document.getElementById('formName');
            const emailInput = document.getElementById('formEmail');
            const subjectInput = document.getElementById('formSubject');
            const messageInput = document.getElementById('formMessage');

            if (!nameInput.value.trim() || !emailInput.value.trim() || !subjectInput.value.trim() || !messageInput.value.trim()) {
                formFeedback.className = 'form-feedback error';
                formFeedback.textContent = "Please fill in all fields.";
                formFeedback.style.display = 'block';
                return;
            }

            // Set Loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            formFeedback.className = 'form-feedback';
            formFeedback.style.display = 'none';

            // ========================================================
            // STEP 2: INSERT YOUR SERVICE ID & TEMPLATE ID HERE
            // Retrieve these from your EmailJS Dashboard -> Email Services / Templates
            // ========================================================
            const serviceID = 'service_r9taexn'; 
            const templateID = 'template_uhww0b9'; 

            if (typeof emailjs !== 'undefined') {
                emailjs.sendForm(serviceID, templateID, contactForm)
                    .then(() => {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                        
                        formFeedback.className = 'form-feedback success';
                        formFeedback.textContent = "Thank you! Your message has been sent successfully.";
                        formFeedback.style.display = 'block';
                        
                        contactForm.reset();
                    })
                    .catch((error) => {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                        
                        formFeedback.className = 'form-feedback error';
                        formFeedback.textContent = "Failed to send message. Please try again later.";
                        formFeedback.style.display = 'block';
                        
                        console.error('EmailJS Error:', error);
                    });
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                formFeedback.className = 'form-feedback error';
                formFeedback.textContent = "Email service is temporarily unavailable. Please try again later.";
                formFeedback.style.display = 'block';
            }
        });
    }
});

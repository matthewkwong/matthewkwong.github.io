// Sidebar Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.right > .section-content');
    const navLinks = document.querySelectorAll('.sidebar-menu a');
    const navbarHeight = 120; // Height of the navbar
    const scrollOffset = navbarHeight + 100; // Add 40px padding for better spacing

    // Set initial active state to Overview
    const overviewLink = document.querySelector('.sidebar-menu a[href="#overview"]');
    if (overviewLink) {
        navLinks.forEach(link => link.classList.remove('active'));
        overviewLink.classList.add('active');
    }

    // Smooth scroll for menu items
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.querySelector(`.${targetId}`);
            
            if (targetSection) {
                lenis.scrollTo(targetSection, {
                    offset: -scrollOffset, // Account for navbar height plus padding
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
                
                // Set active state on click
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Update active menu item on scroll
    function updateActiveSection() {
        const triggerOffset = scrollOffset; // Use the same offset for consistency
        let current = '';

        // Check if we're at the bottom of the page
        const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
        
        if (isAtBottom) {
            // Get the last section's class
            const lastSection = sections[sections.length - 1];
            const lastSectionClasses = Array.from(lastSection.classList);
            const lastMatchingClass = lastSectionClasses.find(cls => {
                return Array.from(navLinks).some(link => 
                    link.getAttribute('href') === `#${cls}`
                );
            });
            
            if (lastMatchingClass) {
                current = lastMatchingClass;
            }
        } else {
            sections.forEach(section => {
                // Get all classes of the section
                const sectionClasses = Array.from(section.classList);
                
                // Find the first class that matches a menu href
                const matchingClass = sectionClasses.find(cls => {
                    return Array.from(navLinks).some(link => 
                        link.getAttribute('href') === `#${cls}`
                    );
                });
                
                if (!matchingClass) return;

                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top;
                const sectionBottom = rect.bottom;
                
                // Check if section is in the trigger zone
                if (sectionTop <= triggerOffset && sectionBottom >= triggerOffset) {
                    current = matchingClass;
                }
            });
        }

        // Update active state if we found a current section
        if (current) {
            navLinks.forEach(link => {
                const isActive = link.getAttribute('href').substring(1) === current;
                link.classList.toggle('active', isActive);
            });
        }
    }

    // Throttle scroll events for better performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateActiveSection();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Update on load
    updateActiveSection();
});
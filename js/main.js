/*
* Template Name: BreezyCV - Refactored for Senior Data Scientist Profile
* Author: LMPixels (Modified by PF)
* Version: 3.0 (Pro Edition)
*/

(function($) {
"use strict";

    // Portfolio Filters (Compatible avec CSS Grid)
    function portfolio_init() {
        var $portfolio_grid   = $('.portfolio-grid');
        var $portfolio_filter = $('.portfolio-filters');

        if (!$portfolio_grid.length || !$portfolio_filter.length) {
            return;
        }

        $portfolio_filter.on("click", "button", function () {
            var $this  = $(this);
            var filter = $this.data('filter');
            var $items = $portfolio_grid.find('figure');

            // Gestion visuelle des boutons
            $this.parent().addClass('active').siblings().removeClass('active');

            // Mise à jour ARIA
            $portfolio_filter.find('button').attr('aria-pressed', 'false');
            $this.attr('aria-pressed', 'true');

            // Filtrage simple (Le CSS Grid s'adapte automatiquement quand on cache des éléments)
            var visibleCount;
            if (!filter || filter === '*') {
                $items.fadeIn(300);
                visibleCount = $items.length;
            } else {
                $items.hide();
                $items.filter(filter).fadeIn(300);
                visibleCount = $items.filter(filter).length;
            }

            // Annonce pour les lecteurs d'écran
            var $liveRegion = $('.portfolio-live-region');
            if ($liveRegion.length) {
                $liveRegion.text(visibleCount + ' item(s) displayed');
            }
        });
    }

    // Gestion du Menu Mobile
    function mobileMenuHide() {
        var windowWidth = $(window).width(),
            $siteHeader = $('#site_header'),
            $menuToggle = $('.menu-toggle');

        if (windowWidth < 1025) {
            $siteHeader.addClass('mobile-menu-hide');
            $menuToggle.removeClass('open').attr('aria-expanded', 'false');

            setTimeout(function(){
                $siteHeader.addClass('animate');
            }, 500);
        } else {
            $siteHeader.removeClass('animate mobile-menu-hide');
            $menuToggle.removeClass('open').attr('aria-expanded', 'false');
        }
    }

    // Custom Scrollbar (Conservation du style du template)
    function customScroll() {
        var windowWidth = $(window).width();
        if (windowWidth > 1024) {
            $('.animated-section, .single-page-content').each(function() {
                $(this).perfectScrollbar();
            });
        } else {
            $('.animated-section, .single-page-content').each(function() {
                $(this).perfectScrollbar('destroy');
            });
        }
    }

    // Animated Counters
    function animateCounters() {
        var $counters = $('[data-count]');
        $counters.each(function() {
            var $el = $(this);
            if ($el.data('counted')) return;
            $el.data('counted', true);

            var target = parseInt($el.data('count'), 10);
            var suffix = $el.data('suffix') || '';
            var duration = 1800;
            var startTime = null;

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                // Ease out cubic
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = Math.floor(eased * target);
                $el.text(current + suffix);
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    $el.text(target + suffix);
                }
            }

            requestAnimationFrame(step);
        });
    }

    // Entrance Animations (Intersection Observer)
    function initEntranceAnimations() {
        var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            // Show everything immediately
            $('.fade-in-up').addClass('visible');
            return;
        }

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

            document.querySelectorAll('.fade-in-up').forEach(function(el) {
                observer.observe(el);
            });
        } else {
            // Fallback: show everything
            $('.fade-in-up').addClass('visible');
        }
    }

    // Re-trigger entrance animations when a section becomes active
    function observeSectionChanges() {
        // MutationObserver to watch for section-active class changes
        var sections = document.querySelectorAll('.animated-section');
        sections.forEach(function(section) {
            var mo = new MutationObserver(function(mutations) {
                mutations.forEach(function(m) {
                    if (m.type === 'attributes' && m.attributeName === 'class') {
                        var el = m.target;
                        if (el.classList.contains('section-active')) {
                            // Trigger entrance animations for this section
                            var fadeEls = el.querySelectorAll('.fade-in-up');
                            fadeEls.forEach(function(fadeEl, idx) {
                                fadeEl.classList.remove('visible');
                                setTimeout(function() {
                                    fadeEl.classList.add('visible');
                                }, 80 + idx * 80);
                            });
                            // Trigger counters
                            setTimeout(animateCounters, 300);
                        }
                    }
                });
            });
            mo.observe(section, { attributes: true });
        });
    }

    // --- Events --- //

    // Window Load
    $(window).on('load', function() {
        // Disparition du loader
        $(".preloader").fadeOut(800, "linear");

        // Initialisation des transitions de page (via animating.js)
        var ptPage = $('.animated-sections');
        if (ptPage[0] && typeof PageTransitions !== 'undefined') {
            PageTransitions.init({
                menu: 'ul.main-menu'
            });
        }

        mobileMenuHide();
        customScroll();

        // Init entrance animations & counters
        initEntranceAnimations();
        observeSectionChanges();

        // Trigger counters for initial visible section
        setTimeout(animateCounters, 500);
    })
    .on('resize', function() {
        mobileMenuHide();
        $('.animated-section').each(function() {
            $(this).perfectScrollbar('update');
        });
        customScroll();
    });


    // Document Ready
    $(document).ready(function () {

        // Effet Parallaxe sur le fond (Désactivé si l'utilisateur demande "reduced motion")
        var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReducedMotion && $('.lm-animated-bg').length) {
            var movementStrength = 20;
            var height = movementStrength / $(document).height();
            var width  = movementStrength / $(document).width();

            $("body").on('mousemove', function(e){
                var pageX = e.pageX - ($(document).width() / 2),
                    pageY = e.pageY - ($(document).height() / 2),
                    newvalueX = width * pageX * -1,
                    newvalueY = height * pageY * -1;

                $('.lm-animated-bg').css({
                    "background-position": "calc( 50% + " + newvalueX + "px ) calc( 50% + " + newvalueY + "px )"
                });
            });
        }

        // Toggle du Menu Mobile
        $('.menu-toggle').on("click", function () {
            var $toggle     = $(this);
            var $siteHeader = $('#site_header');
            var isHidden    = $siteHeader.hasClass('mobile-menu-hide');

            $siteHeader.addClass('animate');
            $siteHeader.toggleClass('mobile-menu-hide');
            $toggle.toggleClass('open');
            $toggle.attr('aria-expanded', isHidden ? 'true' : 'false');
        });

        // Fermer le menu mobile au clic sur un lien
        $('.main-menu').on("click", "a", function () {
            mobileMenuHide();
        });

        // Initialisation du Portfolio
        var $portfolio_container = $(".portfolio-grid");
        $portfolio_container.imagesLoaded(function () {
            portfolio_init();
        });

        // Scrollbar
        customScroll();

        // Rotation du texte (Home page)
        $('.text-rotation').owlCarousel({
            loop: true,
            dots: false,
            nav: false,
            margin: 0,
            items: 1,
            autoplay: !prefersReducedMotion,
            autoplayHoverPause: false,
            autoplayTimeout: 3800,
            animateOut: 'animated-section-scaleDown',
            animateIn: 'animated-section-scaleUp'
        });

    });

})(jQuery);

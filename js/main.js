/*
* Template Name: BreezyCV - Resume / CV / vCard / Portfolio Template
* Author: LMPixels
* Author URL: http://themeforest.net/user/lmpixels
* Version: 1.6.0 (modifié PF 2025)
*/

(function($) {
"use strict";

    // Portfolio subpage filters (version sans shuffle.js, basée sur data-filter et classes)
    function portfolio_init() {
        var $portfolio_grid   = $('.portfolio-grid');
        var $portfolio_filter = $('.portfolio-filters');

        if (!$portfolio_grid.length || !$portfolio_filter.length) {
            return;
        }

        // Accessibilité : les filtres sont des boutons
        $portfolio_filter.find('a').attr('role', 'button').attr('aria-pressed', 'false');
        $portfolio_filter.find('li.active a').attr('aria-pressed', 'true');

        $portfolio_filter.on("click", "a", function (e) {
            e.preventDefault();

            var $this  = $(this);
            var filter = $this.data('filter');
            var $items = $portfolio_grid.find('figure');

            // Visuel : état actif
            $this.parent().addClass('active').siblings().removeClass('active');

            // Accessibilité ARIA
            $portfolio_filter.find('a').attr('aria-pressed', 'false');
            $this.attr('aria-pressed', 'true');

            // Filtrage par classe
            if (!filter || filter === '*') {
                $items.show();
            } else {
                $items.hide().filter(filter).show();
            }
        });
    }
    // /Portfolio subpage filters


    // Hide Mobile menu
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
            // Sur desktop, on s’assure que le header est visible
            $siteHeader.removeClass('animate mobile-menu-hide');
            $menuToggle.removeClass('open').attr('aria-expanded', 'false');
        }
    }
    // /Hide Mobile menu

    // Custom scroll
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
    // /Custom scroll

    // Contact form validator
    $(function () {

        $('#contact_form').validator();

        $('#contact_form').on('submit', function (e) {
            if (!e.isDefaultPrevented()) {
                var url = "contact_form/contact_form.php";

                $.ajax({
                    type: "POST",
                    url: url,
                    data: $(this).serialize(),
                    success: function (data)
                    {
                        var messageAlert = 'alert-' + data.type;
                        var messageText = data.message;

                        var alertBox = '<div class="alert ' + messageAlert + ' alert-dismissable">' +
                                       '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                                       messageText +
                                       '</div>';
                        if (messageAlert && messageText) {
                            $('#contact_form').find('.messages').html(alertBox);
                            $('#contact_form')[0].reset();
                        }
                    }
                });
                return false;
            }
        });
    });
    // /Contact form validator

    //On Window load & Resize
    $(window)
        .on('load', function() { //Load
            // Animation on Page Loading
            $(".preloader").fadeOut(800, "linear");

            // initializing page transition.
            var ptPage = $('.animated-sections');
            if (ptPage[0]) {
                PageTransitions.init({
                    menu: 'ul.main-menu'
                });
            }

            // S'assure que le header et les scrollbars sont cohérents avec la taille
            mobileMenuHide();
            customScroll();
        })
        .on('resize', function() { //Resize
            mobileMenuHide();
            $('.animated-section').each(function() {
                $(this).perfectScrollbar('update');
            });
            customScroll();
        });


    // On Document Load
    $(document).ready(function () {
        var prefersReducedMotion = window.matchMedia &&
                                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Background parallax (désactivé si prefers-reduced-motion)
        if (!prefersReducedMotion) {
            var movementStrength = 23;
            var height = movementStrength / $(document).height();
            var width  = movementStrength / $(document).width();

            $("body").on('mousemove', function(e){
                var pageX = e.pageX - ($(document).width() / 2),
                    pageY = e.pageY - ($(document).height() / 2),
                    newvalueX = width * pageX * -1,
                    newvalueY = height * pageY * -1,
                    $elements = $('.lm-animated-bg');

                $elements.addClass('transition');
                $elements.css({
                    "background-position": "calc( 50% + " + newvalueX + "px ) calc( 50% + " + newvalueY + "px )"
                });

                setTimeout(function() {
                    $elements.removeClass('transition');
                }, 300);
            });
        }

        // Mobile menu
        $('.menu-toggle').on("click", function () {
            var $toggle     = $(this);
            var $siteHeader = $('#site_header');

            var wasHidden   = $siteHeader.hasClass('mobile-menu-hide');
            var willBeShown = wasHidden; // on bascule

            $siteHeader.addClass('animate');
            $siteHeader.toggleClass('mobile-menu-hide');
            $toggle.toggleClass('open');

            $toggle.attr('aria-expanded', willBeShown ? 'true' : 'false');
        });

        // Mobile menu hide on main menu item click
        $('.main-menu').on("click", "a", function () {
            mobileMenuHide();
        });

        // Sidebar toggle
        $('.sidebar-toggle').on("click", function () {
            $('#blog-sidebar').toggleClass('open');
        });

        // Initialize Portfolio grid (plus de shuffle, simple filtrage)
        var $portfolio_container = $(".portfolio-grid");
        $portfolio_container.imagesLoaded(function () {
            portfolio_init();
        });

        // Blog grid init
        var $container = $(".blog-masonry");
        $container.imagesLoaded(function(){
            $container.masonry();
        });

        customScroll();

        // Text rotation (adapté à prefers-reduced-motion)
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

        // Testimonials Slider
        $(".testimonials.owl-carousel").owlCarousel({
            nav: true, // Show next/prev buttons.
            items: 3, // The number of items you want to see on the screen.
            loop: false, // Infinity loop. Duplicate last and first items to get loop illusion.
            navText: false,
            autoHeight: true,
            margin: 25,
            responsive : {
                // breakpoint from 0 up
                0 : {
                    items: 1
                },
                // breakpoint from 480 up
                480 : {
                    items: 1
                },
                // breakpoint from 768 up
                768 : {
                    items: 2
                },
                1200 : {
                    items: 2
                }
            }
        });

        // Clients Slider
        $(".clients.owl-carousel").imagesLoaded().owlCarousel({
            nav: true, // Show next/prev buttons.
            items: 2, // The number of items you want to see on the screen.
            loop: false, // Infinity loop. Duplicate last and first items to get loop illusion.
            navText: false,
            margin: 10,
            autoHeight: true,
            responsive : {
                // breakpoint from 0 up
                0 : {
                    items: 2
                },
                // breakpoint from 768 up
                768 : {
                    items: 4
                },
                1200 : {
                    items: 5
                }
            }
        });


        //Form Controls
        $('.form-control')
            .val('')
            .on("focusin", function(){
                $(this).parent('.form-group').addClass('form-group-focus');
            })
            .on("focusout", function(){
                if($(this).val().length === 0) {
                    $(this).parent('.form-group').removeClass('form-group-focus');
                }
            });

        // Lightbox init
        $('body').magnificPopup({
            delegate: 'a.lightbox',
            type: 'image',
            removalDelay: 300,

            mainClass: 'mfp-fade',
            image: {
                titleSrc: 'title',
                gallery: {
                    enabled: true
                }
            },

            iframe: {
                markup:
                    '<div class="mfp-iframe-scaler">' +
                        '<div class="mfp-close"></div>' +
                        '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
                        '<div class="mfp-title mfp-bottom-iframe-title"></div>' +
                    '</div>',

                patterns: {
                    youtube: {
                        index: 'youtube.com/',
                        id: null,
                        src: '%id%?autoplay=1'
                    },
                    vimeo: {
                        index: 'vimeo.com/',
                        id: '/',
                        src: '//player.vimeo.com/video/%id%?autoplay=1'
                    },
                    gmaps: {
                        index: '//maps.google.',
                        src: '%id%&output=embed'
                    }
                },

                srcAction: 'iframe_src'
            },

            callbacks: {
                markupParse: function(template, values, item) {
                    values.title = item.el.attr('title');
                }
            }
        });

        //Google Maps
        if ($(".lmpixels-map")[0]) {
            var address = "Sénat, Paris, France", // Adresse mise à jour
                encoded = encodeURIComponent(address),
                src = 'https://maps.google.com/maps?q=' + encoded +
                      '&amp;t=m&amp;z=16&amp;output=embed&amp;iwloc=near&output=embed';
            $(".lmpixels-map iframe").attr("src", src);
        }
    });

})(jQuery);

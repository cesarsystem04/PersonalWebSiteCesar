(function ($) {
  'use strict';

  // Preloader
  $(window).on('load', function () {
    $('#preloader')
      .delay(100)
      .fadeOut('slow', function () {
        $(this).remove();
      });
  });

  // AOS initialization
  AOS.init({
    duration: 1000,
    easing: 'ease-in-out',
    once: true,
    mirror: false,
  });

  // Toggle .header-scrolled class to #header when page is scrolled
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $('#header').addClass('header-scrolled');
    } else {
      $('#header').removeClass('header-scrolled');
    }
  });

  if ($(window).scrollTop() > 100) {
    $('#header').addClass('header-scrolled');
  }

  // Navigation active state on scroll
  $(window).on('scroll', function () {
    const scrollPosition = $(this).scrollTop() + 80;

    if (scrollPosition < 300) {
      $('.nav-menu, .mobile-nav').find('li').removeClass('active');
      $('.nav-menu, .mobile-nav').find('li:first').addClass('active');
    } else if (scrollPosition === $(document).height() - $(window).height() + 80) {
      $('.nav-menu, .mobile-nav').find('li').removeClass('active');
      $('.nav-menu, .mobile-nav').find('li:last').addClass('active');
    } else {
      $('section').each(function () {
        const topPosition = $(this).offset().top;
        const bottomPosition = topPosition + $(this).outerHeight();

        if (scrollPosition >= topPosition && scrollPosition <= bottomPosition) {
          if (scrollPosition <= bottomPosition) {
            $('.nav-menu, .mobile-nav').find('li').removeClass('active');
          }
          $('.nav-menu, .mobile-nav')
            .find(`a[href="#${$(this).attr('id')}"]`)
            .parent('li')
            .addClass('active');
        }
      });
    }
  });

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $('.back-to-top').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });

  $('.back-to-top').click(function () {
    $('html, body').animate(
      {
        scrollTop: 0,
      },
      1500,
      'easeInOutExpo'
    );
    return false;
  });

  // Go to contact button
  $('.go-to-contact').click(function () {
    $('html, body').animate(
      {
        scrollTop: $(this.hash).offset().top,
      },
      1500,
      'easeInOutExpo'
    );
    return false;
  });

  // Mobile Navigation
  $('.mobile-nav').html($('.nav-menu').html());

  function toggleMenu() {
    $('body').toggleClass('mobile-nav-active');
    $('.mobile-nav-toggle').toggleClass('open');
    $('#header').toggleClass('header-mobile-nav');
    $('#header .container').toggleClass('mobile');
  }

  $(document).on('click', '.mobile-nav-toggle', function () {
    toggleMenu();
  });

  $(document).click(function (e) {
    const $container = $('.mobile-nav, .mobile-nav-toggle');
    if (!$container.is(e.target) && $container.has(e.target).length === 0) {
      if ($('body').hasClass('mobile-nav-active')) {
        toggleMenu();
      }
    }
  });

  // Smooth scroll for the navigation menu
  $(document).on('click', '.nav-menu a, .mobile-nav a', function (e) {
    if (
      window.location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') &&
      window.location.hostname === this.hostname
    ) {
      e.preventDefault();

      let scrollTo = $(this.hash).offset().top;
      const scrolled = 20;

      scrollTo -= $('#header').outerHeight();

      if (!$('#header').hasClass('header-scrolled')) {
        scrollTo += scrolled;
      }

      if ($(this).attr('href') === '#header') {
        scrollTo = 0;
      }

      $('html, body').animate(
        {
          scrollTop: scrollTo,
        },
        1500,
        'easeInOutExpo'
      );

      $('.nav-menu .active, .mobile-nav .active').removeClass('active');
      $(this).closest('li').addClass('active');

      if ($('body').hasClass('mobile-nav-active')) {
        toggleMenu();
      }
    }
  });

  // Recommendations carousel
  $('.recommendations-carousel').owlCarousel({
    autoplay: true,
    dots: true,
    loop: true,
    items: 1,
  });

  // Contact form
  $('.contact-form').submit(function () {
    const $formGroup = $(this).find('.form-group');
    let errors = false;
    const emailExp = /^[^\s()<>@,;:/]+@\w[\w.-]+\.[a-z]{2,}$/i;

    $formGroup.children('input, textarea').each(function () {
      const $i = $(this);
      let rule = $i.attr('data-rule');

      if (rule !== undefined) {
        let ruleError = false;
        const rulePosition = rule.indexOf(':', 0);

        if (rulePosition >= 0) {
          rule = rule.substr(0, rulePosition);
        } else {
          rule = rule.substr(rulePosition + 1, rule.length);
        }

        if (
          (rule === 'required' && $i.val() === '') ||
          (rule === 'email' && !emailExp.test($i.val()))
        ) {
          ruleError = true;
          errors = true;
        }

        if (ruleError) {
          $i.addClass('error');
          $i.next('.validate').show('blind');
        } else {
          $i.removeClass('error');
          $i.next('.validate').hide('blind');
        }
      }
    });

    // Hide messages
    $(this).find('.sent-message').slideUp();
    $(this).find('.error-message').slideUp();
    $(this).find('.error-captcha').slideUp();

    // Check errors
    if (errors) {
      $(this)
        .find('.error-message')
        .slideDown()
        .html('Uno o más campos tienen un error. Por favor revisa e inténtalo de nuevo.');
      return false;
    }

    // Check Captcha
    if (grecaptcha.getResponse() === '') {
      $(this).find('.error-captcha').slideDown();
      return false;
    }

    // Show loading
    $(this).find('.loading').slideDown();

    const contactFields = {
      name: $(this).find('#name').val(),
      email: $(this).find('#email').val(),
      subject: $(this).find('#subject').val(),
      message: $(this).find('#message').val(),
    };

    const emailBody =
      `<p><strong>Nombre:</strong> ${contactFields.name}<br>` +
      `<strong>Email:</strong> ${contactFields.email}<br>` +
      `<strong>Asunto:</strong> ${contactFields.subject}<br>` +
      `<strong>Mensaje:</strong> ${contactFields.message}</p>`;

    Email.send({
      SecureToken: 'd77754ed-529f-4108-bac2-19ddd2a5765a',
      To: 'cesar.rrguez@gmail.com',
      From: contactFields.email,
      Subject: 'Nuevo contacto desde la página web',
      Body: emailBody,
    }).then((message) => {
      if (message === 'OK') {
        $(this).find('.loading').slideUp();
        $(this).find('.sent-message').slideDown();
        $(this).find('input:not(input[type=submit]), textarea').val('');
      } else {
        $(this).find('.loading').slideUp();
        $(this)
          .find('.error-message')
          .slideDown()
          .html(
            'Hubo un error intentando enviar tu mensaje. Por favor inténtalo de nuevo más tarde.'
          );
      }
    });

    return false;
  });
})(window.jQuery);

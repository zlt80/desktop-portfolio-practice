(function ($) {

    var $window = $(window), $body = $('body'), $wrapper = $('#wrapper'), $header = $('#header'),
        $footer = $('#footer'), $main = $('#main'), $main_articles = $main.children('article');

    breakpoints({
        xlarge: ['1281px', '1680px'],
        large: ['981px', '1280px'],
        medium: ['737px', '980px'],
        small: ['481px', '736px'],
        xsmall: ['361px', '480px'],
        xxsmall: [null, '360px']
    });

    if (browser.name == 'ie') {

        var flexboxFixTimeoutId;

        $window.on('resize.flexbox-fix', function () {

            clearTimeout(flexboxFixTimeoutId);

            flexboxFixTimeoutId = setTimeout(function () {

                if ($wrapper.prop('scrollHeight') > $window.height()) $wrapper.css('height', 'auto'); else $wrapper.css('height', '100vh');

            }, 250);

        }).triggerHandler('resize.flexbox-fix');

    }

    // Nav.
    var $nav = $header.children('nav'), $nav_li = $nav.find('li');

    // Add "middle" alignment classes if we're dealing with an even number of items.
    if ($nav_li.length % 2 == 0) {

        $nav.addClass('use-middle');
        $nav_li.eq(($nav_li.length / 2)).addClass('is-middle');

    }

    // Main.
    var delay = 325, locked = false;

    // Methods.
    $main._show = function (id, initial) {

        var $article = $main_articles.filter('#' + id);

        // No such article? Bail.
        if ($article.length == 0) return;

        // Handle lock.

        // Already locked? Speed through "show" steps w/o delays.
        if (locked || (typeof initial != 'undefined' && initial === true)) {

            // Mark as switching.
            $body.addClass('is-switching');

            // Mark as visible.
            $body.addClass('is-article-visible');

            // Deactivate all articles (just in case one's already active).
            $main_articles.removeClass('active');

            // Hide header, footer.
            $header.hide();
            $footer.hide();

            // Show main, article.
            $main.show();
            $article.show();

            // Activate article.
            $article.addClass('active');

            // Unlock.
            locked = false;

            // Unmark as switching.
            setTimeout(function () {
                $body.removeClass('is-switching');
            }, (initial ? 1000 : 0));

            return;

        }

        // Lock.
        locked = true;

        // Article already visible? Just swap articles.
        if ($body.hasClass('is-article-visible')) {

            // Deactivate current article.
            var $currentArticle = $main_articles.filter('.active');

            $currentArticle.removeClass('active');

            // Show article.
            setTimeout(function () {

                // Hide current article.
                $currentArticle.hide();

                // Show article.
                $article.show();

                // Activate article.
                setTimeout(function () {

                    $article.addClass('active');

                    // Window stuff.
                    $window
                        .scrollTop(0)
                        .triggerHandler('resize.flexbox-fix');

                    // Unlock.
                    setTimeout(function () {
                        locked = false;
                    }, delay);

                }, 25);

            }, delay);

        }

        // Otherwise, handle as normal.
        else {

            // Mark as visible.
            $body
                .addClass('is-article-visible');

            // Show article.
            setTimeout(function () {

                // Hide header, footer.
                $header.hide();
                $footer.hide();

                // Show main, article.
                $main.show();
                $article.show();

                // Activate article.
                setTimeout(function () {

                    $article.addClass('active');

                    // Window stuff.
                    $window
                        .scrollTop(0)
                        .triggerHandler('resize.flexbox-fix');

                    // Unlock.
                    setTimeout(function () {
                        locked = false;
                    }, delay);

                }, 25);

            }, delay);

        }

    };

    $main._hide = function (addState) {

        var $article = $main_articles.filter('.active');

        // Article not visible? Bail.
        if (!$body.hasClass('is-article-visible')) return;

        // Add state?
        if (typeof addState != 'undefined' && addState === true) history.pushState(null, null, '#');

        // Handle lock.

        // Already locked? Speed through "hide" steps w/o delays.
        if (locked) {

            // Mark as switching.
            $body.addClass('is-switching');

            // Deactivate article.
            $article.removeClass('active');

            // Hide article, main.
            $article.hide();
            $main.hide();

            // Show footer, header.
            $footer.show();
            $header.show();

            // Unmark as visible.
            $body.removeClass('is-article-visible');

            // Unlock.
            locked = false;

            // Unmark as switching.
            $body.removeClass('is-switching');

            // Window stuff.
            $window
                .scrollTop(0)
                .triggerHandler('resize.flexbox-fix');

            return;

        }

        // Lock.
        locked = true;

        // Deactivate article.
        $article.removeClass('active');

        // Hide article.
        setTimeout(function () {

            // Hide article, main.
            $article.hide();
            $main.hide();

            // Show footer, header.
            $footer.show();
            $header.show();

            // Unmark as visible.
            setTimeout(function () {

                $body.removeClass('is-article-visible');

                // Window stuff.
                $window
                    .scrollTop(0)
                    .triggerHandler('resize.flexbox-fix');

                // Unlock.
                setTimeout(function () {
                    locked = false;
                }, delay);

            }, 25);

        }, delay);


    };

    // Articles.
    $main_articles.each(function () {

        var $this = $(this);

        // Close.
        $('<div class="close">Close</div>')
            .appendTo($this)
            .on('click', function () {
                location.hash = '';
            });

        // Prevent clicks from inside article from bubbling.
        $this.on('click', function (event) {
            event.stopPropagation();
        });

    });

    // Events.
    $body.on('click', function (event) {

        // Article visible? Hide.
        if ($body.hasClass('is-article-visible')) $main._hide(true);

    });

    $window.on('keyup', function (event) {

        switch (event.keyCode) {

            case 27:

                // Article visible? Hide.
                if ($body.hasClass('is-article-visible')) $main._hide(true);

                break;

            default:
                break;

        }

    });

    $window.on('hashchange', function (event) {

        // Empty hash?
        if (location.hash == '' || location.hash == '#') {

            // Prevent default.
            event.preventDefault();
            event.stopPropagation();

            // Hide.
            $main._hide();

        }

        // Otherwise, check for a matching article.
        else if ($main_articles.filter(location.hash).length > 0) {

            // Prevent default.
            event.preventDefault();
            event.stopPropagation();

            // Show article.
            $main._show(location.hash.substr(1));

        }

    });

    // Scroll restoration.
    // This prevents the page from scrolling back to the top on a hashchange.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; else {

        var oldScrollPos = 0, scrollPos = 0, $htmlbody = $('html,body');

        $window
            .on('scroll', function () {

                oldScrollPos = scrollPos;
                scrollPos = $htmlbody.scrollTop();

            })
            .on('hashchange', function () {
                $window.scrollTop(oldScrollPos);
            });

    }

    $main.hide();
    $main_articles.hide();

    if (location.hash != '' && location.hash != '#') $window.on('load', function () {
        $main._show(location.hash.substr(1), true);
    });


    //요소 추가&삭제
    //header
    $("#header").prepend("<div class=\"logo\"></div>");
    $("#header .logo").append("<a class=\"home\" href=\"https://zlt80.github.io\"></a>");
    $("#header .logo .home").append("<img src=\"../../images/home.svg\">")

    //home
    $(".home #header .logo:first-child").remove();
    $(".home #header .logo .home").remove();

    //art
    $(".art #header .logo:first-child").remove();
    $(".art #header .logo .home").remove();

    //article
    $("#main article").append("<p id='the-end'>[ 끝🥰 ]</p>")
    $(".description").after("<p id='photos'>[ PHOTOS 📸 ]</p>")

    //image
    $(".image.main").prepend("<source media=\"(max-width: 780px)\">")
    $(".image.main").append(" <div class=svg-buttons><div class=buttons-1><svg class=like viewBox=\"0 -28 512.001 512\"><path d=\"m256 455.515625c-7.289062 0-14.316406-2.640625-19.792969-7.4375-20.683593-18.085937-40.625-35.082031-58.21875-50.074219l-.089843-.078125c-51.582032-43.957031-96.125-81.917969-127.117188-119.3125-34.644531-41.804687-50.78125-81.441406-50.78125-124.742187 0-42.070313 14.425781-80.882813 40.617188-109.292969 26.503906-28.746094 62.871093-44.578125 102.414062-44.578125 29.554688 0 56.621094 9.34375 80.445312 27.769531 12.023438 9.300781 22.921876 20.683594 32.523438 33.960938 9.605469-13.277344 20.5-24.660157 32.527344-33.960938 23.824218-18.425781 50.890625-27.769531 80.445312-27.769531 39.539063 0 75.910156 15.832031 102.414063 44.578125 26.191406 28.410156 40.613281 67.222656 40.613281 109.292969 0 43.300781-16.132812 82.9375-50.777344 124.738281-30.992187 37.398437-75.53125 75.355469-127.105468 119.308594-17.625 15.015625-37.597657 32.039062-58.328126 50.167969-5.472656 4.789062-12.503906 7.429687-19.789062 7.429687zm-112.96875-425.523437c-31.066406 0-59.605469 12.398437-80.367188 34.914062-21.070312 22.855469-32.675781 54.449219-32.675781 88.964844 0 36.417968 13.535157 68.988281 43.882813 105.605468 29.332031 35.394532 72.960937 72.574219 123.476562 115.625l.09375.078126c17.660156 15.050781 37.679688 32.113281 58.515625 50.332031 20.960938-18.253907 41.011719-35.34375 58.707031-50.417969 50.511719-43.050781 94.136719-80.222656 123.46875-115.617188 30.34375-36.617187 43.878907-69.1875 43.878907-105.605468 0-34.515625-11.605469-66.109375-32.675781-88.964844-20.757813-22.515625-49.300782-34.914062-80.363282-34.914062-22.757812 0-43.652344 7.234374-62.101562 21.5-16.441406 12.71875-27.894532 28.796874-34.609375 40.046874-3.453125 5.785157-9.53125 9.238282-16.261719 9.238282s-12.808594-3.453125-16.261719-9.238282c-6.710937-11.25-18.164062-27.328124-34.609375-40.046874-18.449218-14.265626-39.34375-21.5-62.097656-21.5zm0 0\"></path></svg> <svg class=comment viewBox=\"0 0 24 24\"fill=none stroke=currentColor stroke-linecap=round stroke-linejoin=round stroke-width=1.5><path d=\"M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z\"></path></svg> <svg class=share viewBox=\"0 0 469.038 469.038\"><path d=\"M465.023,4.079c-3.9-3.9-9.9-5-14.9-2.8l-442,193.7c-4.7,2.1-7.8,6.6-8.1,11.7s2.4,9.9,6.8,12.4l154.1,87.4l91.5,155.7c2.4,4.1,6.9,6.7,11.6,6.7c0.3,0,0.5,0,0.8,0c5.1-0.3,9.5-3.4,11.6-8.1l191.5-441.8C470.123,13.879,469.023,7.979,465.023,4.079zM394.723,54.979l-226.2,224.7l-124.9-70.8L394.723,54.979z M262.223,425.579l-74.5-126.9l227.5-226L262.223,425.579z\"></path></svg></div><div class=buttons-2><svg class=save viewBox=\"0 0 24 24\"fill=none stroke=currentColor stroke-linecap=round stroke-linejoin=round stroke-width=1.5><path d=\"M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z\"></path></svg></div></div>")

    //nav
    $("#nav-art").append("<li><a href=\"http://zlt80.github.io/pages/art/drawing\">drawing</a></li><li><a href=\"http://zlt80.github.io/pages/art/events\">events</a></li><li><a href=\"http://zlt80.github.io/pages/art/exhibition\">exhibition</a></li>");
    $("#nav-trip").append("<li><a href=\"https://zlt80.github.io/pages/trip/jeju\">Jeju</a></li><li><a href=\"https://zlt80.github.io/pages/trip/hongkong\">hongkong</a></li><li><a href=\"https://zlt80.github.io/pages/trip/japan\">japan</a></li><li><a href=\"https://zlt80.github.io/pages/trip/malaysia\">malaysia</a></li><li><a href=\"https://zlt80.github.io/pages/trip/vietnam\">vietnam</a></li>")
    $("#nav-daily").append("<li><a href=\"https://zlt80.github.io/pages/daily/holiday\">holiday</a></li><li><a href=\"https://zlt80.github.io/pages/daily/fun\">fun</a></li><li><a href=\"https://zlt80.github.io/pages/daily/food\">food</a></li><li><a href=\"https://zlt80.github.io/pages/daily/beauty-fashion\">beauty & fashion</a></li>")
    $("#nav-study").append("<li><a href=\"https://zlt80.github.io/pages/study/css\">css/scss</a></li><li><a href=\"https://zlt80.github.io/pages/study/html\">html</a></li><li><a href=\"https://zlt80.github.io/pages/study/ruby\">ruby</a></li><li><a href=\"https://zlt80.github.io/pages/study/script\">script</a></li><li><a href=\"https://zlt80.github.io/pages/study/vue\">vue</a></li>");

    //study
    $(".study #the-end").remove();
    $(".study #photos").remove();
    $(".image.main .svg-buttons").remove();

})(jQuery);
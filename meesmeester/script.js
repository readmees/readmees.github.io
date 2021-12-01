       // When the user scrolls down 20px from the top of the document, slide down the navbar
       window.onscroll = function() {scrollFunction(); scrollbar(); contact();};

       function scrollFunction() {
         if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
           document.getElementById("top_menu").style.top = "0";
           document.getElementById("social_media").style.bottom = "0";
           document.getElementById("myBar").style.top = "0";
         }
         else {
           document.getElementById("top_menu").style.top = "-50px";
           document.getElementById("social_media").style.bottom = "-100px";
           document.getElementById("myBar").style.top = "-100px";
         }
       }

       function scrollbar() {
         var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
         var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
         var scrolled = (winScroll / height) * 100;
         document.getElementById("myBar").style.width = scrolled + "%";
       }

       function isElementInViewport(elem) {
        var $elem = $(elem);
    
        // Get the scroll position of the page.
        var scrollElem = ((navigator.userAgent.toLowerCase().indexOf('webkit') != -1) ? 'body' : 'html');
        var viewportTop = $(scrollElem).scrollTop();
        var viewportBottom = viewportTop + $(window).height();
    
        // Get the position of the element on the page.
        var elemTop = Math.round( $elem.offset().top );
        var elemBottom = elemTop + $elem.height();
    
        return ((elemTop < viewportBottom) && (elemBottom > viewportTop));
    }
    
    // Check if it's time to start the animation.
    function checkAnimation() {
        var $elem = $('.bar .level');
    
        // If the animation has already been started
        if ($elem.hasClass('start')) return;
    
        if (isElementInViewport($elem)) {
            // Start the animation
            $elem.addClass('start');
        }
    }
    
    // Capture scroll events
    $(window).scroll(function(){
        checkAnimation();
    });
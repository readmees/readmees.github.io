       // When the user scrolls down 20px from the top of the document, slide down the navbar
       window.onscroll = function() {scrollFunction(); scrollbar();};

       function scrollFunction() {
         if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
           document.getElementById("top_menu").style.top = "0";
           document.getElementById("social_media").style.bottom = "0";
         } else {
           document.getElementById("top_menu").style.top = "-50px";
           document.getElementById("social_media").style.bottom = "-100px";
         }
       }
             // When the user scrolls the page, use scrollbar

       function scrollbar() {
         var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
         var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
         var scrolled = (winScroll / height) * 100;
         document.getElementById("myBar").style.width = scrolled + "%";
       }
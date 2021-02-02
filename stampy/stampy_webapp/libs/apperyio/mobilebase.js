(function (undefined) {
    "use strict";

    String.prototype.trim = String.prototype.trim || function () {
        if (!this) {
            return this;
        }
        return this.replace(/^\s+|\s+$/g, "");
    };

    _.deepClone = function deepClone(o) {
        if (!_.isObject(o)) return o;
        return JSON.parse(JSON.stringify(o));
    };

    _.isTrueObject = function(o) {
        return Object.prototype.toString.call(o) === '[object Object]';
    };

    window.showSpinner = function(directOptions) {
        var loaderOptions;
        if (directOptions !== undefined && $.type(directOptions) === "object") {
            loaderOptions = directOptions;
        } else {
            if (Apperyio.loaderOptions !== undefined && $.type(Apperyio.loaderOptions) === "object") {
                loaderOptions = Apperyio.loaderOptions;
            }
        }
        if (loaderOptions !== undefined) {
            $.mobile.loading('show', loaderOptions);
        } else {
            $.mobile.loading('show');
        }
    };

    window.hideSpinner = function () {
        $.mobile.loading('hide');
    };

    function getScreenHeight() {
        var msh = $.mobile.getScreenHeight();
        if (typeof cordova !== "undefined" && cordova.platformId === 'ios' && screen && screen.height && screen.width) { // screen.height gives more accurate value on ios device
            if ($.mobile.window.height() > $.mobile.window.width()) { // portrait
                return screen.height;
            } else {
                return screen.width;
            }
        }
        return msh;
    }

    window.resetActivePageContentHeight = function () {
        setTimeout(function() {
            var aPage, aPageContent, aPageHeader, aPageFooter, resultHeight;

            aPage = $("." + $.mobile.activePageClass);

            // It's OK with dialogue, we don't need extra sizing
            if (aPage.is("[data-dialog='true']")) {
                return;
            }

            aPageContent = aPage.find(".ui-content:eq(0)");
            if (aPage.hasClass("detail-content")) {
                // If it's a detail content page, we must consider height of master page header and footer
                aPageHeader = aPage.closest(".ui-page:not(.detail-content)").find(".ui-header:visible:eq(0)");
                aPageFooter = aPage.closest(".ui-page:not(.detail-content)").find(".ui-footer:visible:eq(0)");
            } else {
                aPageHeader = aPage.find(".ui-header:visible:eq(0)");
                aPageFooter = aPage.find(".ui-footer:visible:eq(0)");
            }
            resultHeight = getScreenHeight();

            // Considering page paddings and borders
            if (aPage && aPage[0]) {
                var aPageCSS = window.getComputedStyle(aPage[0]);
                resultHeight -= parseFloat(aPageCSS["padding-top"]);
                resultHeight -= parseFloat(aPageCSS["padding-bottom"]);
                resultHeight -= parseFloat(aPageCSS["border-top-width"]);
                resultHeight -= parseFloat(aPageCSS["border-bottom-width"]);
            }

            // Considering page content paddings and borders
            if (aPageContent && aPageContent[0]) {
                var aPageContentCSS = window.getComputedStyle(aPageContent[0]);
                resultHeight -= parseFloat(aPageContentCSS["padding-top"]);
                resultHeight -= parseFloat(aPageContentCSS["padding-bottom"]);
                resultHeight -= parseFloat(aPageContentCSS["border-top-width"]);
                resultHeight -= parseFloat(aPageContentCSS["border-bottom-width"]);
            }

            // Considering inline page header height, paddings and borders
            if (aPageHeader && aPageHeader[0] && !aPageHeader.is(".ui-header-fixed")) {
                var aPageHeaderCSS = window.getComputedStyle(aPageHeader[0]);
                resultHeight -= (parseFloat(aPageHeader.height()) || 0);
                resultHeight -= parseFloat(aPageHeaderCSS["padding-top"]);
                resultHeight -= parseFloat(aPageHeaderCSS["padding-bottom"]);
                resultHeight -= parseFloat(aPageHeaderCSS["border-top-width"]);
                resultHeight -= parseFloat(aPageHeaderCSS["border-bottom-width"]);
            }

            // Considering inline page footer height, paddings and borders
            if (aPageFooter && aPageFooter[0] && !aPageFooter.is(".ui-footer-fixed")) {
                var aPageFooterCSS = window.getComputedStyle(aPageFooter[0]);
                resultHeight -= (parseFloat(aPageFooter.height()) || 0);
                resultHeight -= parseFloat(aPageFooterCSS["padding-top"]);
                resultHeight -= parseFloat(aPageFooterCSS["padding-bottom"]);
                resultHeight -= parseFloat(aPageFooterCSS["border-top-width"]);
                resultHeight -= parseFloat(aPageFooterCSS["border-bottom-width"]);
            }

            aPageContent.css("min-height", resultHeight);
        }, 0)
    };

    $.mobile.document.bind("pagecontainershow", window.resetActivePageContentHeight);
    $.mobile.window.bind("throttledresize", window.resetActivePageContentHeight);

    /* Replacing native jQuery show/hide logic to handle mobileinput
     * and to trigger custom events:"beforehide", "afterhide", "beforeshow", "aftershow".
     */
    var nativeHide = jQuery.fn.hide;
    jQuery.fn.hide = function () {
        this.trigger("beforehide");
        try {
            if (this.prop('tagName') === 'INPUT' && this.parent(".ui-input-text").length > 0) {
                return nativeHide.apply(this.parent(".ui-input-text").parent(), arguments);
            } else if (this.prop('tagName') === 'A' && this.attr('data-role') === "button") {
                this.css("display", "none");
            } else if (this.prop('tagName') === 'TABLE' && this.parent('[data-wrapper-for]').length > 0) {
                return nativeHide.apply(this.parent("[data-wrapper-for]"), arguments);
            } else if (this.prop('tagName') === 'DIV' && this.attr('data-role') === "navbar") {
                if (this.css("display") === "none") {
                    return this;
                }
                var nbp = this.parent();
                if (nbp.prop('tagName') === 'DIV' && nbp.attr('data-role') === "header") {
                    nbp = nbp.parent();
                    var nbh = this.height();
                    if (nbp.attr('data-role') === "page") {
                        var nbpt = parseInt(nbp.css("padding-top")) - nbh;
                        nbp.css("padding-top", nbpt + "px");
                    }
                }
                return nativeHide.apply(this, arguments);
            } else {
                return nativeHide.apply(this, arguments);
            }
        }
        finally {
            this.trigger("afterhide");
        }
    };

    var nativeShow = jQuery.fn.show;
    jQuery.fn.show = function () {
        this.trigger("beforeshow");
        try {
            if (this.prop('tagName') === 'INPUT' && this.parent(".ui-input-text").length > 0) {
                return nativeShow.apply(this.parent(".ui-input-text").parent(), arguments);
            } else if (this.prop('tagName') === 'A' && this.attr('data-role') === "button") {
                if (this.hasClass("ui-btn-left") || this.hasClass("ui-btn-right") || this.hasClass("ui-btn-inline")) {
                    this.css("display", "inline-block");
                } else {
                    this.css("display", "block");
                }

            } else if (this.prop('tagName') === 'TABLE' && this.parent('[data-wrapper-for]').length > 0) {
                return nativeShow.apply(this.parent("[data-wrapper-for]"), arguments);
            } else if (this.prop('tagName') === 'DIV' && this.attr('data-role') === "navbar") {
                if (this.css("display") !== "none") {
                    return this;
                }
                var result = nativeShow.apply(this, arguments);
                var nbp = this.parent();
                if (nbp.prop('tagName') === 'DIV' && nbp.attr('data-role') === "header") {
                    nbp = nbp.parent();
                    var nbh = this.height();
                    if (nbp.attr('data-role') === "page") {
                        var nbpt = parseInt(nbp.css("padding-top")) + nbh;
                        nbp.css("padding-top", nbpt + "px");
                    }
                }
                return result;
            } else {
                return nativeShow.apply(this, arguments);
            }
        }
        finally {
            this.trigger("aftershow");
        }
    };

})();

//add extra space for Popup's vertical scrollbar if needed
$(document).on( "popupbeforeposition", "[data-role=popup]", function() {
    var $wrapper = $(this).find(".ui-popup-content-wrapper");
    if ($wrapper !== null && $wrapper.length > 0) {
        $wrapper.css("margin-right", ($wrapper[0].scrollHeight > $wrapper[0].clientHeight) ? "20px" : "0");
    }
}); 

/* ETST-20410 */
if (navigator.userAgent.indexOf("MSIE ") !== -1) {
    $(document).on("click", ".ui-li-static-container", function() {
        if (!$(arguments[0].target).is(":focus") || (arguments[0].target == this)){
            $(this).closest("li").focus(); 
        }
    })
}

/* ETST-24845 */
$(document).on('focusin focusout', '[data-role=header][data-position=fixed]:has(input, select, textarea), [data-role=footer][data-position=fixed]:has(input, select, textarea)', function (e) {
    if ( e.type === "focusin" ) {
        $('[data-role=header][data-position=fixed],[data-role=footer][data-position=fixed]').addClass("ui-fixed-hidden");
    } else if ( e.type === "focusout" ) {
        $('[data-role=header][data-position=fixed],[data-role=footer][data-position=fixed]').removeClass("ui-fixed-hidden");
    }
});

/* If Google Map is hidden and then becomes visible it needs to be refreshed to work normally (ETST-28089) */
$(document).on("collapsibleexpand aftershow", function(e){
    Apperyio.refreshGoogleMapComponents(e.target);
});

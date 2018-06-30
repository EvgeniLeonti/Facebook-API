const PAGES = [
    {
        facebook_page_id: undefined,
        facebook_page_name: "TechnionConfessions",
        custom_name: "Technion Confessions",
        active: true
    },
    {
        facebook_page_id: undefined,
        facebook_page_name: "BGUConfession",
        custom_name: "BGU Confessions",
        active: true
    },
    {
        facebook_page_id: "1087309268075081",
        facebook_page_name: undefined,
        custom_name: "Dating Confessions",
        active: true
    },
    {
        facebook_page_id: "200293387275040",
        facebook_page_name: undefined,
        custom_name: "Tel Aviv Confessions",
        active: true
    },
    {
        facebook_page_id: undefined,
        facebook_page_name: "tel.aviv.university.confessions",
        custom_name: "TAU Confessions",
        active: true
    },
    {
        facebook_page_id: undefined,
        facebook_page_name: "funjoyaconfessions",
        custom_name: "Funjoya Confessions",
        active: false
    },
    {
        facebook_page_id: undefined,
        facebook_page_name: "HUJI.Confessions",
        custom_name: "HUJI Confessions",
        active: true
    },
    {
        facebook_page_id: undefined,
        facebook_page_name: "IDFsConfessions",
        custom_name: "IDF Confessions",
        active: true
    },
    {
        facebook_page_id: undefined,
        facebook_page_name: "biuconfessions2018",
        custom_name: "BIU Confessions",
        active: true
    },
    {
        facebook_page_id: undefined,
        facebook_page_name: "IDCHerzliyaConfessions",
        custom_name: "IDC Confessions",
        active: true
    },
    {
        facebook_page_id: undefined,
        facebook_page_name: "TECHNION.Religious.confessions",
        custom_name: "Technion Religious Confessions",
        active: true
    },
];

var GLOBAL_DATA = {
    CURRENT_PAGE: undefined,
    CURRENT_CURSOR: undefined,
    MAX_PAGE_NUM: 0,
};

// Cookie managing

const DAYS_TO_STORE_COOKIES = 365;

function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}


// Utilities

function timeDifference(current, previous) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;
    var elapsed = current - previous;
    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' seconds ago';
    }
    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }
    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }
    else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    }
    else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    }
    else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}


// UI Related

function isMobile() {
    return window.innerWidth < 769 ? true : false;
}

function mobileDesktopSwitch() {
    var myNavbarBackup = $("#myNavbar").html();
    if (isMobile()) {
        $("#posts").css({
            "overflow": "visible",
            "padding-right": 0,
            "padding-top": 0,
            "padding-bottom": 50,
            "padding-left": 0
        });
        $("#active_pages").parent().parent().hide();
        $("#mobile_status").show();
        $("#status").hide();
        $("#myNavbar").html(myNavbarBackup);
    }
    else {
        var height = Math.max((window.innerHeight - 55), ($("#col1").height() + 20));
        $("#posts").css({
            "overflow": "auto",
            "height": height,
            "padding-right": 20,
            "padding-top": 20,
            "padding-bottom": 0,
            "padding-left": 0
        });
        $("#active_pages").parent().parent().show();
        $("#mobile_status").hide();
        $("#status").show();
        $("#myNavbar").html('');
    }
}

function goUp() {
    if (isMobile()) {
        $('html,body').animate({
            scrollTop: $("html").offset().top
        }, 2000);
    }
    else {
        $("#posts").animate({scrollTop: $("#col2_1").offset().top}, 2000);
        // $("#posts").scrollTop($("#col2_1").position().top);
    }
}

function toggle (facebook_post_id) {
    var cookie = readCookie(facebook_post_id);
    if (cookie == "true") {
        eraseCookie(facebook_post_id);
        $("#" + facebook_post_id).removeClass("panel-success");
        $("#" + facebook_post_id).addClass("panel-primary");
    }
    else {
        createCookie(facebook_post_id, true, DAYS_TO_STORE_COOKIES);
        $("#" + facebook_post_id).removeClass("panel-primary");
        $("#" + facebook_post_id).addClass("panel-success");
    }
    // });
    $("#" + facebook_post_id + "_body").toggle();
    $("#" + facebook_post_id + "_footer").toggle();
}


// Async call to server

function loadPosts(fbPageId, isNext, cursor) {
    $("#dialog-message-content").html(`<span class="glyphicon glyphicon-download-alt" style="float:left; margin:0 7px 0 0;"></span>
                            Fetching from Graph API...<br />
                            <div class="loader"></div>`);

    $("#dialog-message").dialog("open");


    if (isNext === undefined) { // First page
        var query = `/get/posts/${fbPageId}`;
        GLOBAL_DATA.MAX_PAGE_NUM = 1;
    }
    else if (isNext) {  // Next Page
        var query = `/get/posts/${fbPageId}/next/${cursor}`;
        GLOBAL_DATA.MAX_PAGE_NUM++;
    }
    else {  // Previous Page
        var query = `/get/posts/${fbPageId}/prev/${cursor}`;
        GLOBAL_DATA.MAX_PAGE_NUM--;
    }


    $.getJSON(query, function (result) {
        var data = result.data;
        GLOBAL_DATA.CURRENT_PAGE = undefined;
        for (let i = 0; i < PAGES.length; i++) {
            if (PAGES[i].facebook_page_id === fbPageId || PAGES[i].facebook_page_name === fbPageId) {
                GLOBAL_DATA.CURRENT_PAGE = PAGES[i];
                break;
            }
        }
        if (!GLOBAL_DATA.CURRENT_PAGE) {
            alert("Error: No CURRENT_PAGE found!")
        }

        GLOBAL_DATA.CURRENT_CURSOR = {next: result.next, prev: result.prev};

        if (isNext === undefined) { // Switching facebook pages
            $("#posts").html('');
            $('html,body').animate({
                scrollTop: $(".container").offset().top
            }, 0);
        }

        var identifier = fbPageId.split(".").join("_");
        $(".active").removeClass();
        $("#" + identifier).addClass("active");
        // var col1IdWithPageNum = `col1_${GLOBAL_DATA.MAX_PAGE_NUM}`;
        var col2IdWithPageNum = `col2_${GLOBAL_DATA.MAX_PAGE_NUM}`;
        // $("#col1").append(`<div id="${col1IdWithPageNum}"></div>`);
        $("#posts").append(`<div id="${col2IdWithPageNum}" ></div>`);


        if (isNext !== undefined) {
            $('html,body').animate({
                scrollTop: $("#" + col2IdWithPageNum).offset().top - 140
            }, 1000);
            $("#buttons").remove();
        }

        for (var i = 0; i < data.length; i++) {
            var currentTime = new Date();
            var timeAgo = timeDifference(currentTime, Date.parse(data[i].created_time));
            // var colByMod2 = i % 2 === 0 ? `#${col1IdWithPageNum}` : `#${col2IdWithPageNum}`;
            var colByMod2 = `#${col2IdWithPageNum}`;

            if (data[i].message === undefined) {
                // story instead of message
                // or end of messages
                continue;
            }

            var timeAgoSpan = `<span class="glyphicon glyphicon-time" style="float:left; margin:0 7px 0 0;"></span>`;
            var facebook_id_full = (data[i].id);
            var facebook_id = facebook_id_full.substring(facebook_id_full.indexOf("_") + 1, facebook_id_full.length);


            var cookie = readCookie(facebook_id);
            if (cookie !== null) {
                var color = "success"
            }
            else {
                var color = "primary"
            }

            var containerDiv = $(document.createElement('div'))
                .attr("id", facebook_id)
                .addClass(`post-container bg-white text-dark panel panel-${color} rounded`)
                .appendTo(colByMod2)
            // .hide()
            //.fadeIn('slow');

            var headingDiv = $(document.createElement('div'))
                .attr("id", `${facebook_id}_heading`)
                .attr("class", "post-heading panel-heading")
                .html(`${timeAgo} ${timeAgoSpan}`)
                .click(function () {
                    var idFromDiv = $(this).attr("id");
                    toggle(idFromDiv.substring(0, idFromDiv.indexOf("_")));
                })
                .css("cursor", "pointer");

            var message = data[i].message.replace(/\n/g, "<br />");
            var bodyDiv = $(document.createElement('div'))
                .attr("id", `${facebook_id}_body`)
                .attr("class", "post-body panel-body rtl")
                .html(message);

            if (GLOBAL_DATA.CURRENT_PAGE.facebook_page_name) {
                var currentPage = GLOBAL_DATA.CURRENT_PAGE.facebook_page_name;
            }
            else if (GLOBAL_DATA.CURRENT_PAGE.facebook_page_id) {
                var currentPage = GLOBAL_DATA.CURRENT_PAGE.facebook_page_id;
            }

            var footerDiv = $(document.createElement('div'))
                .attr("id", `${facebook_id}_footer`)
                .attr("class", "panel-footer")
                .html(`


                    <!--<a href="https://www.facebook.com/${currentPage}/posts/${facebook_id}" target="_blank">FB Link</a> -->
                    
                    <a href="https://www.facebook.com/${currentPage}/posts/${facebook_id}" class="btn btn-info btn-sm" target="_blank">
                      <span class="glyphicon glyphicon-link" style="float:left; margin:0 7px 0 0;"></span> FB Link
                    </a>
                    
                    <a onclick="toggle(${facebook_id})" style="float: right" class="btn btn-info btn-sm">
                      <span class="glyphicon glyphicon-check" style="float:left; margin:0 7px 0 0;"></span> Mark as read
                    </a>

                     <!--<a onclick="toggle(${facebook_id})" target="_blank">Close</a>-->
                `);

            containerDiv.append(headingDiv).append(bodyDiv).append(footerDiv);

            if (color == "success") {
                $("#" + facebook_id + "_body").toggle();
                $("#" + facebook_id + "_footer").toggle();
                // toggle(facebook_id);
            }


        }

        // Success
        var textToDisplay = `Showing posts from <strong>${GLOBAL_DATA.CURRENT_PAGE.custom_name}</strong>`;
        $("#status").html(textToDisplay);
        $("#mobile_status .container .navbar-header").html(GLOBAL_DATA.CURRENT_PAGE.custom_name);
        $("#dialog-message").dialog("close");

        if (isNext === undefined && isMobile && window.scrollY > 0) {
            goUp();
        }
        // $("#myNavbar").removeClass("navbar-toggle");


        // colByMod2 = GLOBAL_DATA.MAX_PAGE_NUM % 2 === 0 ? `#${col1IdWithPageNum}` : `#${col2IdWithPageNum}`;
        colByMod2 = `#${col2IdWithPageNum}`;
        if (GLOBAL_DATA.CURRENT_CURSOR.next !== undefined) {
            $(colByMod2).append(`<div id="buttons"></div>`);
            var loadMoreButton = `<a onclick="loadMore()" class="btn btn-info btn-lg"><span class="glyphicon glyphicon-chevron-down"></span> Load more</a>`;
            $("#buttons").append(`<div class="ltr" style="float: left">${loadMoreButton}</div>`);
            var goUpButton = `<a onclick="goUp()" class="btn btn-info btn-lg"><span class="glyphicon glyphicon-arrow-up"></span> Go up</a>`;
            $("#buttons").append(`<div class="rtl" style="float: right">${goUpButton}</div>`);
            $("#buttons").append(`<br /><br />`);
        }


    })
        .done(function () {

        })
        .fail(function (error) {

            $("#dialog-message").dialog({
                modal: true,
                buttons: {
                    Close: function () {
                        $(this).dialog("close");
                    }
                }
            });

            var responseJSON = error.responseJSON;

            var responseTEXT = responseJSON.message;
            $("#dialog-message-content").html(`<p class="text-danger">
                        <span class="glyphicon glyphicon-download-alt" style="float:left; margin:0 7px 0 0;"></span>
                            <strong>Graph API Error caused by </strong><i>${fbPageId}</i><br />
                            </p><p>${responseTEXT}</p>`).attr("title", "Error");


        })
        .always(function () {
            // $( "#dialog" ).dialog( "open" );
        });
}

function loadMore () {
    if (GLOBAL_DATA.CURRENT_PAGE.facebook_page_name) {
        var currentPage = GLOBAL_DATA.CURRENT_PAGE.facebook_page_name;
    }
    else if (GLOBAL_DATA.CURRENT_PAGE.facebook_page_id) {
        var currentPage = GLOBAL_DATA.CURRENT_PAGE.facebook_page_id;
    }
    if (!currentPage) {
        alert("Error: can't find currentPage!");
    }
    var cursor = GLOBAL_DATA.CURRENT_CURSOR;
    loadPosts(currentPage, true, cursor.next);
}


// Main UI code
$(document).ready(function () {
    $("body").append(`<div id="dialog-message" title="Message" style="display: none">
                        <p id="dialog-message-content">
                            
                        </p>
                    </div>`);
    // Loading dialog init
    $("#dialog-message").dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            Refresh: function () {
                location.reload();
            }
        }
    });

    // Init menu
    PAGES.forEach(function (page) {
        if (page.facebook_page_id !== undefined) {
            var identifier = page.facebook_page_id;
        }
        else if (page.facebook_page_name !== undefined) {
            var identifier = page.facebook_page_name;
        }
        var customName = page.custom_name;
        var divIdentifier = identifier.split(".").join("_");
        if (page.active) {
            $("#myNavbar .nav").append(`<li id="${divIdentifier}_mobile"><a class="visible-xs" data-toggle="collapse" data-target=".navbar-collapse" onclick="loadPosts('${identifier}')">${customName}</a></li>`);
            $("#active_pages").append(`<li role="presentation" id="${divIdentifier}"><a onclick="loadPosts('${identifier}')">${customName}</a></li>`);
        }
        // else {
        //
        //     $("#inactive_pages").append(`<li role="presentation" id="${divIdentifier}"><a onclick="loadPosts('${identifier}')">${customName}</a></li>`);
        // }
    });
    // Default page
    loadPosts('TechnionConfessions');
    // Change UI according to device
    mobileDesktopSwitch();
});

// Basiclly used on small windows on desktop (will act as mobile)
$(window).on('resize', function () {
    mobileDesktopSwitch();
});


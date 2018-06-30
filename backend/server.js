const express = require('express');
var request = require('request');
var rp = require('request-promise');

const app = express();
app.use("/", express.static('frontend'));
app.set('json spaces', 40); // beautify json

const PORT = 80;
const POSTS_PER_PAGE = 20;

var options = {
    // uri: '',
    qs: {
        access_token: process.env.FACEBOOK_API_TOKEN
    },
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true
};

function getRequest(req, res, action) {
    try {
        var fbPageId = req.params.facebook_page_id;
    }
    catch (error) {
        res.status(503);
        res.send("error: facebook_page_id undefined");
        return;
    }
    // action = "/feed"
    options.uri = 'https://graph.facebook.com/v3.0/' + fbPageId + action + "&limit=" + POSTS_PER_PAGE;
    rp(options)
        .then(function (result) {
            try {
                result.next = result.paging.cursors.after;
            }
            catch (e) {
                result.next = undefined;
            }

            var countHowManyPosts = 0;
            result.data.forEach(function(obj) {
                if (obj.message !== undefined) {
                    countHowManyPosts++;
                }
            });
            if (countHowManyPosts < POSTS_PER_PAGE) {
                result.next = undefined;
            }

            delete result.paging; // Contains access token, therefore we should remove it before sending back to client

            res.json(result);
        })
        .catch(function (err) {
            res.status(503);
            res.send(err);
        });
}

app.get('/get/posts/:facebook_page_id', function(req, res) {
    getRequest(req, res, "/feed?");
});

app.get('/get/posts/:facebook_page_id/:next_or_prev/:cursor', function(req, res) {
    try {
        var nextOrPrev = req.params.next_or_prev;
        if ((nextOrPrev !== "next" && nextOrPrev !== "prev")) {
            throw("error: invalid action");
        }
        var afterOrBefore = nextOrPrev === "next" ? "after" : "before";
        getRequest(req, res, `/feed?${afterOrBefore}=${req.params.cursor}`);
    }
    catch (e) {
        res.send("error: invalid request");
    }

});

app.listen(PORT, function() {
    console.log('FBScraper is ON! Listening on ' + PORT);
});
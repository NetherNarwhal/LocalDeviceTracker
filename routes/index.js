"use strict";
var express = require('express');
var router = express.Router();

/* GET host listing. */
router.get('/', function(req, res, next) {
    // Render the screen.
    res.render('index', { "hosts" : JSON.stringify(req.hosts.getHosts()) });
});

/* POST host listing. Also handles DELETE, via parameter, since that is not possible to send via a html form. */
router.post('/', function(req, res, next) {
    // req.query: for querystring args, req.body: for post body args, req.param: for path patterns called out in router entry.
    var mac = req.body.mac; // TODO: Should really clean this parameter.
    console.log("Call to POST : " + mac + ", isdelete " + req.body.isdelete);
    console.log(req.body);

    if (req.body.isdelete == '1') {
        console.log("Deleting based on : " + mac);
        req.hosts.removeHost(mac);
    } else {
        var name = cleanInput(req.body.name);
        var type = cleanInput(req.body.type);
//        console.log("Updating based on : " + mac + " for " + name + ", " + type);
        req.hosts.updateHost(mac, name, type);
    }

    // Redirect them back to the GET so refreshes don't repost.
    res.redirect("/");
});

/** Really primitive attempt to limit malicious characters or abuse via input by stripping non-alphanumeric as extra spaces. */
function cleanInput(input) {
    if (input === undefined) {
        return input;
    }
    input = input.replace(/[^A-Za-z0-9' ]/g, '').replace(/ +/g, " "); // Strip any non-alphanumeric and merge spaces.
    input = input.substring(0, 20); // Truncate to 20 characters.
    return input;
}

module.exports = router;
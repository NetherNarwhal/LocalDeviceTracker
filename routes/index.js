"use strict";
var express = require("express");
var router = express.Router();

/** Retrieve all hosts. */
router.get("/api/hosts", function(req, res, next) {
    var hostlist = req.hosts.getHosts();
    res.json(hostlist);
});

/** Create a new host. */
router.post('/api/host/:id', function(req, res, next) {
    var mac = cleanInput(req.params.id);
    var name = cleanInput(req.body.name);
    var owner = cleanInput(req.body.owner);
    var type = cleanInput(req.body.type);
    var host = req.hosts.addHost(mac, name, owner, type);
    res.json(host);
});

/** Retrieve an existing host. */
router.get("/api/host/:id", function(req, res, next) {
    var mac = cleanInput(req.params.id);
    var host = req.hosts.getHost(mac);
    res.json(host);
});

/** Update an existing host. */
router.put("/api/host/:id", function(req, res, next) {
    var mac = cleanInput(req.params.id);
    var name = cleanInput(req.body.name);
    var owner = cleanInput(req.body.owner);
    var type = cleanInput(req.body.type);
    var host = req.hosts.updateHost(mac, name, owner, type);
    res.json(host);
});

/** Remove an existing host. */
router.delete("/api/host/:id", function(req, res, next) {
    var mac = cleanInput(req.params.id);
    var rc = req.hosts.removeHost(mac);
    res.json({ "success": rc });
});

/** Limit malicious characters or abuse via input by stripping non-alphanumeric and extra spaces. */
function cleanInput(input) {
    if (input === undefined || input.length === 0) return input;
    input = input.replace(/[^A-Za-z0-9: ]/g, "").replace(/ +/g, " "); // Strip any non-alphanumeric and merge spaces.
    input = input.trim().substring(0, 20); // Truncate to 20 characters.
    return input;
}

module.exports = router;
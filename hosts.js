"use strict";
var spawn = require('child_process').spawn;
var jsonfile = require('jsonfile');
var os = require('os');
var request = require('request');
var hosts = [];
var curntMac;
var curntIP;
var timer;

function Hosts() {
}

Hosts.init = function() {
    // Do initial population of the list.
    jsonfile.readFile("hosts.json", function(err, obj) {
        if (err) {
            console.log("Wasn't able to load hosts from file. It may not have been created yet,"
                + " which is normal the first time. err: " + err);
        } else {
            console.log("Restored hosts from file.");
            hosts = obj;
            resetStatus(); // Will happen anyway during refresh, but don't want to mislead if they see this before that.
        }
        sortList();
        refresh();
    });
}

/** Returns a list of all current hosts. */
Hosts.getHosts = function() {
    return hosts;
}

/** Allows the caller to update the name and/or type of an existing host. */
Hosts.updateHost = function(mac, newName, newType) {
    for (var i = 0; i < hosts.length; i++) {
        var host = hosts[i];
        if (host.mac === mac) {
            if (newName != undefined && newName != null && newName != "") {
//                console.log("Updating name from " + host.name + " to " + newName);
                host.name = newName;
            }
            if (newType != undefined && newType != null && newType != "") {
//                console.log("Updating type from " + host.type + " to " + newType);
                host.type = newType;
            }
            sortList();
            // TODO: Should probably persistList() here, but need to watch unit tests.
            return true;
        }
    }
    console.error("Was not able to find the specified host to update. mac: " + mac);
    return false;
}

/** Removes the specified host from the list. The call is ignored if the host does not exist. */
Hosts.removeHost = function(mac) {
    for (var i = 0; i < hosts.length; i++) {
        if (hosts[i].mac === mac) {
            hosts.splice(i, 1);
            // TODO: Should probably persistList() here, but need to watch unit tests.
            return true;
        }
    }
    return true;
}

/** Refreshes the lists of hosts. This should automatically get updated every 5 minutes, so only call if it
    really needs to be updated now. */
function refresh() {
    // Do a nmap discovery scan to get IPs and MAC addresses.
    // !IMPORTANT! On Linux, you must run node as root/sudo or the nmap output won't include mac addresses.
    console.log("Running nmap...");
    var output = "";
    var nmap = spawn("nmap", ["-sn", "192.168.1.0/24"]);
    nmap.stdout.on('data', function(data) {
        output += data;
    });
    nmap.on('exit', function(code) {
        if (code != 0) {
            console.error("Nmap failed: " + code);
            return;
        }
        console.log(output);
        output = parseNMapOutput(output);

        // Update existing list with new info.
        synchList(output);

        // Persist the refreshed list to disk.
        persistList();

        // Schedule this refresh for every 5 minutes, if not already done.
        // TODO: Should externalize the refresh timer!
        if (timer === undefined) {
            console.log("Setting timer...");
            timer = setInterval(function() {
                refresh();
            }, 300000);
        }
    });
}

/** Alias of non-instance version. */
Hosts.refresh = refresh;

// TODO: Implement additional scanning for unknown hosts in order to figure out what they are later.
/*
function scanUnknownHosts(list) {
}

function scanHost(host) {
    // Do a nmap discovery scan to get IPs and MAC addresses.
    // !IMPORTANT! On Linux, you must run node as root/sudo or the nmap output won't include mac addresses.
    console.log("Running nmap...");
    var output = "";
    var nmap = spawn("nmap", ["-sN -O", host]);
    nmap.stdout.on('data', function(data) {
        output += data;
    });
    nmap.on('exit', function(code) {
        if (code != 0) {
            console.error("Nmap failed: " + code);
            return;
        }
        console.log(output);

        // TODO: Add to entry for host.
    });
}
*/

/** Extracts the IP (IPv4 only) and MAC addresses from the provided NMap console output. */
function parseNMapOutput(input) {
    if (input === undefined || input === null) {
        console.error("Provided input was undefined or null. Results may be invalid.");
        return [];
    }

    // Use regex to extract IPs and MACs (order is IP then MAC, with last IP being for current machine so no MAC).
    // Does NOT currently support IPv6.
    var list = input.match(/(([0-9]{1,3}(\.|\b)){4})|(([A-Z0-9]{2}(:|\b)){6})/g);
    if (list === null || list.length === 0) {
        console.error("Wasn't able to extract addresses from nmap output. Results may be invalid.");
        return [];
    }

    // Check for no mac addresses, which should indicate that we are not running as admin. If so,
    // clear the list so we don't corrupt the list of hosts.
    var macFormat = /^(([A-Z0-9]{2}(:|\b)){6})$/; // XX:XX:XX:XX:XX:XX
    var found = false;
    for (var i = 0; i < list.length; i++) {
        if (macFormat.test(list[i])) {
            found  = true;
            break;
        }
    }
    if (!found) {
        console.error("No mac addresses were found in nmap output. This likely means this app was started"
            + " without admin (sudo/root) access. Ignoring results since there is no way to match things up.");
        return [];
    }

    // The nmap output format is kind of weird. For v7, at least in Windows, the current machine's IP
    // is listed last. For v6, at least on Linux, the current machine maybe in the middle of the list.
    // In both cases the mac isn't included. So to parse the list consistently we need to insert the
    // current machine's mac in there where its IP is found.
    var ip = getIPAddress();
    var found = false;
    for (var i = 0; i < list.length; i++) {
        if (list[i] === ip) {
            if (i === list.length - 1) {
                list.push(getMACAddress()); // Found it at the end (nmap 7).
            } else {
                list.splice(i + 1, 0, getMACAddress()); // Found in middle (nmap 6?).
            }
            found = true;
            break;
        }
    }
    if (!found) {
        console.error("Wasn't able to determine where to insert current mac. Results may be invalid.");
    }
    return list;
}

/** Gets the active network interface for the current machine. Does NOT currently support IPv6. */
function getInterface() {
    // There are likely multiple interfaces, so loop through them looking for an external facing IPv4 address.
    var interfaces = os.networkInterfaces();
    for (var i in interfaces) {
        var iface = interfaces[i].filter(function(props) {
            return props.family === 'IPv4' && props.internal === false;
        });
        if(iface.length > 0) {
            return iface[0];
        }
    }
}

/** Gets the MAC address for the current machine. */
function getMACAddress() {
    if (curntMac === undefined || curntMac === null) {
        var iface = getInterface();
        if (iface === null || iface === undefined) {
            console.error("Unable to retrieve the local mac address.");
            return "??:??:??:??:??:??";
        }
        curntMac = iface.mac.toUpperCase();
        console.log("Retrieved local MAC: " + curntMac);
    }
    return curntMac
}

/** Gets the IP address for the current machine. Does NOT currently support IPv6. */
function getIPAddress() {
    if (curntIP === undefined || curntIP === null) {
        var iface = getInterface();
        if (iface === null || iface === undefined) {
            console.error("Unable to retrieve the local ip address.");
            return "?.?.?.?";
        }
        // Get the IPv4 address, not IPv6.
        curntIP = iface.address;
        console.log("Retrieved local IP: " + curntIP);
    }
    return curntIP
}

/* Leverages a web API to get the device manufacturer based on the mac address. */
function getDeviceManufacturer(host) {
    // Get vendor info for unknown mac addresses using http://api.macvendors.com/ as older versions of nmap are suspect.
    request("http://api.macvendors.com/" + host.mac, function(error, response, body) {
        // Handle error situations.
        if (error) {
            console.log("Error on execution of manufacturer lookup API for '" + mac + "': ");
            console.log(error);
            return;
        }
        if (response.statusCode == 404 || body === null || body == "") {
            host.manufacturer = "unknown";
//            console.log("Manufacturer for '" + mac + "'='" + body + "'");
        } else if (response.statusCode == 200) {
            host.manufacturer = body;
//            console.log("Manufacturer for '" + mac + "'='" + body + "'");
        } else {
            console.log("Bad return from manufacturer lookup API for '" + mac + "': " + response.statusCode);
            return;
        }
    });
}

/** Updates the existing host list based on the provided nmap results. */
function synchList(latest) {
    var currentTime = new Date();
    var found = false;
    var newAdded = false;

    resetStatus();

    if (latest === undefined || latest === null) {
        console.error("Provided latest list is invalid.");
        return;
    } else if (!Array.isArray(latest)) {
        console.error("Provided latest list is not an array. Is: " + (typeof latest));
        return;
    } else if (latest.length === 0) {
        console.error("Provided latest list is empty. Should always have at least the current machine.");
        return;
    }

    for (var i = 0; i < latest.length; i++) {
        var ip = latest[i];
        var mac = latest[++i];
        found = false;

        // Loop through the existing list for a match.
        for (var j = 0; j < hosts.length; j++) {
            var host = hosts[j];
            if (host.mac === mac) {
                // Match!
                found = true;
                host.online = true;
                host.ip = ip;
                host.last = currentTime;
                break;
            }
        }
        if (!found) {
            newAdded = true;
            hosts.push( {
                "name": "Unknown",
                "type": "unknown",
                "mac": mac,
                "ip": ip,
                "online": true,
                "last": currentTime
            });
        }
    }

    // Make sure all devices have a manufacturer listed.
    for (var k = 0; k < hosts.length; k++) {
        if (hosts[k].manufacturer === undefined) {
            getDeviceManufacturer(hosts[k]);
        }
    }

    // See some new entries may have been added, resort the list.
    if (newAdded) {
        sortList();
    }
}

/** Sorts the list of hosts by name. */
function sortList() {
    hosts.sort(function(a, b) {
        return (a.name.localeCompare(b.name));
    });
}

/** Reset online status for all existing hosts. */
function resetStatus() {
    for (var k = 0; k < hosts.length; k++) {
        hosts[k].online = false;
    }
}

/** Saves the current list of hosts to a file so it survives server recycles. */
function persistList() {
    jsonfile.writeFile("hosts.json", hosts, {spaces: 2}, function(err) {
        if (err) {
            console.error(err);
        } else {
            console.log("Hosts persisted to disk.");
        }
    });
}

/** Expose private methods for testing. */
Hosts.forTesting = {
    "setHosts": function(hostList) { hosts = hostList; },
    "parseNMapOutput": parseNMapOutput,
    "getMACAddress": getMACAddress,
    "getIPAddress": getIPAddress,
    "getDeviceManufacturer": getDeviceManufacturer,
    "synchList": synchList,
    "sortList": sortList
};

module.exports = Hosts;
"use strict";
var hostListFull = [];

function loadHosts(hosts) {
    // TODO: If preferences aren't loaded, check cookie?

    // Sort and then cache it for later.
    hosts.sort(function(a, b) {
        return (a.name.localeCompare(b.name));
    });
    hostListFull = hosts;

    // Show the hosts using the selected view.
    var viewOpt = document.getElementById("view");
    if (viewOpt === null || viewOpt.options.selectedIndex == 0) {
        refreshList("tiles");
    } else if (viewOpt.options.selectedIndex == 1) {
        refreshList("tiles-lg");
    } else {
        refreshList("list");
    }
}

function refreshList(style) {
    if (style == "list") {
        showList(hostListFull);
    } else if (style == "tiles-lg") {
        showTilesLg(hostListFull);
    } else {
        showTiles(hostListFull);
    }
}

function showTiles(hosts) {
    var container = document.getElementById("host-container");
    container.className = "tile-view";
    container.innerHTML = "";

    for (var i = 0; i < hosts.length; i++) {
        var host = hosts[i];
        var html = "<div class='host " + (host.online ? "online" : "offline") + "' onclick='showModal(\"" + host.mac + "\")'>";
        html += "<div class='type'><i class='fa " + getTypeIcon(host.type) + "'></i></div>"
        html += "<div class='title'>" + shortenHostName(host.name) + "</div>";
        html += "<div class='time'>" + getDateStringShort(host.last) + "</div>";
        html += "</div>";
        container.innerHTML += html;
    }
}

/** Just grab the first word in the name. */
function shortenHostName(name) {
    return name.split(" ", 1)[0];
}

function showTilesLg(hosts) {
    var container = document.getElementById("host-container");
    container.className = "tile-lg-view";
    container.innerHTML = "";

    for (var i = 0; i < hosts.length; i++) {
        var host = hosts[i];
        var html = "<div class='host " + (host.online ? "online" : "offline") + "' onclick='showModal(\"" + host.mac + "\")'>";
        html += "<div class='title'><i class='fa " + getTypeIcon(host.type) + "'></i>" + host.name + "</div>";
        html += "<div class='details'><span class='mac'><i class='fa fa-tag'></i> " + host.mac;
        html += "</span><span class='ip'><i class='fa fa-eye'></i> " + host.ip;
        html += "</span><span class='time'><i class='fa fa-clock-o'></i> " + getDateString(host.last) + "</span></div>";
        html += "</div>";
        container.innerHTML += html;
    }
}

function showList(hosts) {
    var container = document.getElementById("host-container");
    container.className = "list-view";
    container.innerHTML = "";

    for (var i = 0; i < hosts.length; i++) {
        var host = hosts[i];
        var html = "<div class='host " + (host.online ? "online" : "offline") + "' onclick='showModal(\"" + host.mac + "\")'>";
        html += "<div class='title'><i class='fa " + getTypeIcon(host.type) + "'></i>" + host.name + "</div>";
        html += "<div class='details'><span class='mac'><i class='fa fa-tag'></i> " + host.mac;
        html += "</span><span class='ip'><i class='fa fa-eye'></i> " + host.ip;
        html += "</span><span class='time'><i class='fa fa-clock-o'></i> " + getDateString(host.last) + "</span></div>";
        html += "</div>";
        container.innerHTML += html;
    }
}

/*
function escapeQuote(str) {
  return (str + '').replace(/[\']/g, '&apos;');
}
*/

function getTypeIcon(type) {
    switch (type.toLowerCase()) {
        case "desktop":
            return "fa-desktop";
        case "laptop":
            return "fa-laptop";
        case "tablet":
            return "fa-tablet";
        case "phone":
            return "fa-mobile";
        case "console":
            return "fa-gamepad";
        case "tv":
            return "fa-tv";
        case "router":
            return "fa-wifi";
        case "printer":
            return "fa-print";
        case "server":
            return "fa-server";
        default:
            return "fa-question-circle";
    }
}

function getDateStringShort(date) {
    if (date === undefined || date === null) {
        return "Never";
    }
    // Convert incoming string into a date object.
    date = new Date(date);

    var curntDate = new Date();
    if (date.toDateString() === curntDate.toDateString()) {
        // If today, then just show time
        // Note: Format doesn't quite work on Firefox for Android (as of v43).
        return "<i class='fa  fa-clock-o'></i> "
            + date.toLocaleTimeString('en-US', {hour12: true, hour: "numeric", minute: "numeric"});
    }
    // If not today, just show date in the format of (M/D/YYYY).
    return date.toLocaleDateString('en-US');
}

function getDateString(date) {
    if (date === undefined || date === null) {
        return "Never";
    }
    // Convert incoming string into a date object.
    date = new Date(date);

    var curntDate = new Date();
    var dayText;
    if (date.toDateString() === curntDate.toDateString()) {
        // If today, then show that instead of numeric date.
        dayText = "Today at ";
    } else {
        // If not today, we want to show date in the format of (M/D/YYYY).
        // Note: Format doesn't quite work on Firefox for Android (as of v43).
        dayText = date.toLocaleDateString('en-US') + " ";
    }
    return dayText + date.toLocaleTimeString('en-US', {hour12: true, hour: "numeric", minute: "numeric"});
}

function showModal(hostId) {
    // Look up the entry in the host file.
    var host = null;
    for (var i = 0; i < hostListFull.length; i++) {
        if (hostListFull[i].mac == hostId) {
            host = hostListFull[i];
            break;
        }
    }
    if (host === null) {
        console.log("Couldn't find host '" + hostId + "'");
        return;
    }

    // Set the html fields to the host values.
    document.getElementById("name").value = host.name;

    // Pick to correct type in the drop down.
    var selectType = document.getElementById("type");
    var found = false;
    for (var i = 0; i < selectType.length; i++) {
        if (selectType[i].value == host.type) {
            selectType.options.selectedIndex = i;
            found = true;
            break;
        }
    }
    // Default to unknown if no matches were found.
    if (!found) {
        selectType.options.selectedIndex = selectType.length - 1;
    }

    document.getElementById("mac").value = host.mac;
    document.getElementById("ip").value = host.ip;
    document.getElementById("manufacturer").value = host.manufacturer;
    document.getElementById("online").value = host.online;
    toggleModal();
}

function toggleModal() {
    var el = document.getElementById("modal");
    el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}
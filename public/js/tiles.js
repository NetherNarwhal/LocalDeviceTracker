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
    } else {
        refreshList("list");
    }
}

function refreshList(style) {
    if (style == "list") {
        showList(hostListFull);
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
        var html = "<div class='host " + (host.online ? "online" : "offline") + "' onclick='showModal(\""
            + escapeQuote(host.name) + "\",\""
            + host.type + "\",\""
            + host.mac + "\",\""
            + host.ip + "\","
            + host.online + ")'>";
        html += "<div class='title'><i class='fa " + getTypeIcon(host.type) + "'></i>" + host.name + "</div>";
//        html += "<div class='details'><span><b>Mac: </b>" + host.mac;
        html += "<div class='details'><span><i class='fa fa-tag'></i> " + host.mac;
//        html += "</span><span><b>IP: </b>" + host.ip;
        html += "</span><span><i class='fa fa-eye'></i> " + host.ip;
//        html += "</span><span><b>Last: </b>" + getDateString(host.last) + "</span></div>";
        html += "</span><span><i class='fa fa-clock-o'></i> " + getDateString(host.last) + "</span></div>";
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
        var html = "<div class='host " + (host.online ? "online" : "offline") + "' onclick='showModal(\""
            + escapeQuote(host.name) + "\",\""
            + host.type + "\",\""
            + host.mac + "\",\""
            + host.ip + "\","
            + host.online + ")'>";
        html += "<div class='title'><i class='fa " + getTypeIcon(host.type) + "'></i>" + host.name + "</div>";
//        html += "<div class='details'><span><b>Mac: </b>" + host.mac;
        html += "<div class='details'><span><i class='fa fa-tag'></i> " + host.mac;
//        html += "</span><span><b>IP: </b>" + host.ip;
        html += "</span><span><i class='fa fa-eye'></i> " + host.ip;
//        html += "</span><span><b>Last: </b>" + getDateString(host.last) + "</span></div>";
        html += "</span><span><i class='fa fa-clock-o'></i> " + getDateString(host.last) + "</span></div>";
        html += "</div>";
        container.innerHTML += html;
    }
}

function escapeQuote(str) {
  return (str + '').replace(/[\']/g, '&apos;');
}

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

function getDateString(date) {
    if (date === undefined || date === null) {
        return "Never";
    }
    // Convert incoming string into a date object.
    date = new Date(date);

    // If today, then show that instead of numeric date.
    var curntDate = new Date();
    if (date.toDateString() === curntDate.toDateString()) {
        return "Today at " + date.toLocaleTimeString('en-US', {hour12: true, hour: "numeric", minute: "numeric"});
    }

    // If not today, we want to show date in the format of (M/D/YYYY H:M).
    // Note: Format doesn't quite work on Firefox for Android (v43).
    return date.toLocaleDateString('en-US') + " "
        + date.toLocaleTimeString('en-US', {hour12: true, hour: "numeric", minute: "numeric"});
}

function showModal(name, type, mac, ip, online) {
    document.getElementById("name").value = name;

    // Pick to correct type in the drop down.
    var selectType = document.getElementById("type");
    var found = false;
    for (var i = 0; i < selectType.length; i++) {
        if (selectType[i].value == type) {
            selectType.options.selectedIndex = i;
            found = true;
            break;
        }
    }
    // Default to unknown if no matches were found.
    if (!found) {
        selectType.options.selectedIndex = selectType.length - 1;
    }

    document.getElementById("mac").value = mac;
    document.getElementById("ip").value = ip;
    document.getElementById("online").value = online;
    toggleModal();
}

function toggleModal() {
    var el = document.getElementById("modal");
    el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}
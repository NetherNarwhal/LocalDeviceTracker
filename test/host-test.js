var assert = require('assert');
var hosts = require('../hosts.js');

describe("Host", function() {
    // Runs before each test in this block
    beforeEach(function() {
        hosts.forTesting.setUnderTestFlag();
    });

    describe("getMACAddress()", function () {
        it("should return a MAC address for this machine", function () {
            var mac = hosts.forTesting.getMACAddress();
            assert(mac, "Mac is null");
        });
        it("should have the correct format", function () {
            var mac = hosts.forTesting.getMACAddress();
            var format = /^(([A-Z0-9]{2}(:|\b)){6})$/; // XX:XX:XX:XX:XX:XX
            assert(format.test(mac), "Mac is not the correct format: " + mac);
        });
    });

    describe("getIPAddress()", function () {
        it("should return an IP address for this machine", function () {
            var ip = hosts.forTesting.getIPAddress();
            assert(ip, "IP is null");
        });
        it("should have the correct format", function () {
            var ip = hosts.forTesting.getIPAddress();
            var format = /^(([0-9]{1,3}(\.|\b)){4})$/; // IPv4: ###.###.###.###
            assert(format.test(ip), "IP is not the correct format: " + ip);
        });
    });

    describe("parseNMapOutput()", function () {
        it("should parse valid nmap v6 output (current inline)", function () {
            var curntIP = hosts.forTesting.getIPAddress();
            var input = "Starting Nmap 6.00 ( http://nmap.org ) at 2016-01-01 1:00 EST\n" +
                        "Nmap scan report for 192.168.1.1\n" +
                        "Host is up (0.0030s latency).\n" +
                        "MAC Address: A1:B2:C3:00:00:0A (Cisco-Linksys)\n" +
                        "Nmap scan report for " + curntIP + "\n" +
                        "Host is up.\n" +
                        "Nmap scan report for 192.168.1.3\n" +
                        "Host is up (0.095s latency).\n" +
                        "MAC Address: A1:B2:C3:00:00:0C (Samsung Electronics)\n" +
                        "Nmap scan report for 192.168.1.4\n" +
                        "Host is up (0.060s latency).\n" +
                        "MAC Address: A1:B2:C3:00:00:0D (Unknown)\n" +
                        "Nmap done: 256 IP addresses (4 hosts up) scanned in 10.00 seconds";
            var list = hosts.forTesting.parseNMapOutput(input);
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 8, "List has the wrong number of results: " + list.length);
            assert.strictEqual(list[0], "192.168.1.1", "0 entry is incorrect: " + list[0]);
            assert.strictEqual(list[1], "A1:B2:C3:00:00:0A", "1 entry is incorrect: " + list[1]);
            assert.strictEqual(list[2], curntIP, "2 entry is incorrect: " + list[2]);
            assert.strictEqual(list[3], hosts.forTesting.getMACAddress(), "3 entry is incorrect: " + list[3]);
            assert.strictEqual(list[4], "192.168.1.3", "4 entry is incorrect: " + list[4]);
            assert.strictEqual(list[5], "A1:B2:C3:00:00:0C", "5 entry is incorrect: " + list[5]);
            assert.strictEqual(list[6], "192.168.1.4", "6 entry is incorrect: " + list[6]);
            assert.strictEqual(list[7], "A1:B2:C3:00:00:0D", "7 entry is incorrect: " + list[7]);
        });

        it("should parse valid nmap v7 output (current last)", function () {
            var curntIP = hosts.forTesting.getIPAddress();
            var input = "Starting Nmap 7.01 ( https://nmap.org ) at 2016-01-01 1:00 Eastern Standard Time\n" +
                        "Nmap scan report for 192.168.1.1\n" +
                        "Host is up (0.0030s latency).\n" +
                        "MAC Address: A1:B2:C3:00:00:0A (Cisco-Linksys)\n" +
                        "Nmap scan report for 192.168.1.3\n" +
                        "Host is up (0.095s latency).\n" +
                        "MAC Address: A1:B2:C3:00:00:0C (Samsung Electronics)\n" +
                        "Nmap scan report for 192.168.1.4\n" +
                        "Host is up (0.060s latency).\n" +
                        "MAC Address: A1:B2:C3:00:00:0D (Unknown)\n" +
                        "Nmap scan report for " + curntIP + "\n" +
                        "Host is up.\n" +
                        "Nmap done: 256 IP addresses (4 hosts up) scanned in 10.00 seconds";
            var list = hosts.forTesting.parseNMapOutput(input);
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 8, "List has the wrong number of results: " + list.length);
            assert.strictEqual(list[0], "192.168.1.1", "0 entry is incorrect: " + list[0]);
            assert.strictEqual(list[1], "A1:B2:C3:00:00:0A", "1 entry is incorrect: " + list[1]);
            assert.strictEqual(list[2], "192.168.1.3", "2 entry is incorrect: " + list[2]);
            assert.strictEqual(list[3], "A1:B2:C3:00:00:0C", "3 entry is incorrect: " + list[3]);
            assert.strictEqual(list[4], "192.168.1.4", "4 entry is incorrect: " + list[4]);
            assert.strictEqual(list[5], "A1:B2:C3:00:00:0D", "5 entry is incorrect: " + list[5]);
            assert.strictEqual(list[6], curntIP, "6 entry is incorrect: " + list[6]);
            assert.strictEqual(list[7], hosts.forTesting.getMACAddress(), "7 entry is incorrect: " + list[7]);
        });

        it("should ignore output when run without admin (no mac addresses)", function () {
            var curntIP = hosts.forTesting.getIPAddress();
            var input = "Starting Nmap 6.00 ( http://nmap.org ) at 2016-01-01 1:00 EST\n" +
                        "Nmap scan report for 192.168.1.1\n" +
                        "Host is up (0.0030s latency).\n" +
                        "Nmap scan report for " + curntIP + "\n" +
                        "Host is up (0.011s latency).\n" +
                        "Nmap scan report for 192.168.1.3\n" +
                        "Host is up (0.095s latency).\n" +
                        "Nmap scan report for 192.168.1.4\n" +
                        "Host is up (0.060s latency).\n" +
                        "Nmap done: 256 IP addresses (4 hosts up) scanned in 10.00 seconds";
            var list = hosts.forTesting.parseNMapOutput(input);
            // List should be valid, but empty.
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 0, "List has the wrong number of results: " + list.length);
        });

        it("should handle garbage input", function () {
            var list = hosts.forTesting.parseNMapOutput("Hello there");
            assert(list, "List is null. Should be valid, but empty.");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 0, "List has the wrong number of results: " + list.length);
        });

        it("should handle undefined input", function () {
            var list = hosts.forTesting.parseNMapOutput();
            assert(list, "List is null. Should be valid, but empty.");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 0, "List has the wrong number of results: " + list.length);
        });

        it("should handle null input", function () {
            var list = hosts.forTesting.parseNMapOutput(null);
            assert(list, "List is null. Should be valid, but empty.");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 0, "List has the wrong number of results: " + list.length);
        });
    });

    describe("synchList()", function () {
        // Runs before each test in this block
        beforeEach(function() {
            hosts.forTesting.setHosts([
                { "name": "A1", "type": "router", "mac": "A1:B2:C3:00:00:0A", "ip": "192.168.1.1", "manufacturer": "TestCo" },
                { "name": "A2", "type": "server", "mac": "A1:B2:C3:00:00:0B", "ip": "192.168.1.2", "manufacturer": "TestCo" },
                { "name": "A3", "type": "phone", "mac": "A1:B2:C3:00:00:0C", "ip": "192.168.1.3", "manufacturer": "TestCo" },
                { "name": "A4", "type": "laptop", "mac": "A1:B2:C3:00:00:0D", "ip": "192.168.1.4", "manufacturer": "TestCo" }
            ]);
        });

        it("should update all hosts if all online", function () {
            // List of "latest" results (ip, mac, ip, mac, ... format).
            var latest = [
                "192.168.1.1", "A1:B2:C3:00:00:0A",
                "192.168.1.2", "A1:B2:C3:00:00:0B",
                "192.168.1.3", "A1:B2:C3:00:00:0C",
                "192.168.1.4", "A1:B2:C3:00:00:0D"
            ];

            hosts.forTesting.synchList(latest);
            var list = hosts.getHosts();
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            for (var i = 0; i < list.length; i++) {
                assert(list[i].online, "Host is not marked as online, and it should be");
            }
        });

        it("should not mark hosts online that aren't", function () {
            // List of "latest" results (ip, mac, ip, mac, ... format).
            var latest = [
                "192.168.1.1", "A1:B2:C3:00:00:0A",
                "192.168.1.2", "A1:B2:C3:00:00:0B",
                "192.168.1.4", "A1:B2:C3:00:00:0D"
            ];

            hosts.forTesting.synchList(latest);
            var list = hosts.getHosts();
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            // Validate their online status. They are sorted by name, which should be the same as the initial list.
            assert.strictEqual(list[0].online, true, list[0].name + " (0) has a bad status");
            assert.strictEqual(list[1].online, true, list[1].name + " (1) has a bad status");
            assert.strictEqual(list[2].online, false, list[2].name + " (2) has a bad status");
            assert.strictEqual(list[3].online, true, list[3].name + " (3) has a bad status");
        });

        it("should add new unknown hosts", function () {
            // List of "latest" results (ip, mac, ip, mac, ... format).
            var latest = [
                "192.168.1.1", "A1:B2:C3:00:00:0A",
                "192.168.1.2", "A1:B2:C3:00:00:0B",
                "192.168.1.5", "A1:B2:C3:00:00:0E"
            ];

            hosts.forTesting.synchList(latest);
            var list = hosts.getHosts();
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 5, "List has the wrong number of results: " + list.length);
            // The unknown items are not necessarily last, but would be sorted that way based on names we are providing.
            var host = list[list.length - 1];
            assert.strictEqual(host.name, "Unknown", "Unknown host not added correctly (name)");
            assert.strictEqual(host.type, "unknown", "Unknown host not added correctly (type)");
            assert.strictEqual(host.mac, "A1:B2:C3:00:00:0E", "Unknown host not added correctly (mac)");
            assert.strictEqual(host.ip, "192.168.1.5", "Unknown host not added correctly (ip)");
            assert.strictEqual(host.online, true, "Unknown host not added correctly (online)");
        });

        it("should not sort the list of hosts if nothing new (are sorted in init)", function () {
            // Override our beforeEach method to make things unsorted.
            hosts.forTesting.setHosts([
                { "name": "A3", "type": "phone", "mac": "A1:B2:C3:00:00:0C", "ip": "192.168.1.3" },
                { "name": "A2", "type": "server", "mac": "A1:B2:C3:00:00:0B", "ip": "192.168.1.2"},
                { "name": "A1", "type": "router", "mac": "A1:B2:C3:00:00:0A", "ip": "192.168.1.1" },
                { "name": "A4", "type": "laptop", "mac": "A1:B2:C3:00:00:0D", "ip": "192.168.1.4" }
            ]);

            // List of "latest" results (ip, mac, ip, mac, ... format).
            var latest = [
                "192.168.1.1", "A1:B2:C3:00:00:0A"
            ];

            hosts.forTesting.synchList(latest);
            var list = hosts.getHosts();
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            // Validate the order. In this case, nothing should have changed from the original list.
            assert.strictEqual(list[0].name, "A3", list[0].name + " (0) is not in the expected place");
            assert.strictEqual(list[1].name, "A2", list[1].name + " (1) is not in the expected place");
            assert.strictEqual(list[2].name, "A1", list[2].name + " (2) is not in the expected place");
            assert.strictEqual(list[3].name, "A4", list[3].name + " (3) is not in the expected place");
        });

        it("should sort the list of hosts by name, if new entry is added", function () {
            // Override our beforeEach method to make things unsorted.
            hosts.forTesting.setHosts([
                { "name": "A3", "type": "phone", "mac": "A1:B2:C3:00:00:0C", "ip": "192.168.1.3" },
                { "name": "A2", "type": "server", "mac": "A1:B2:C3:00:00:0B", "ip": "192.168.1.2"},
                { "name": "A1", "type": "router", "mac": "A1:B2:C3:00:00:0A", "ip": "192.168.1.1" },
                { "name": "A4", "type": "laptop", "mac": "A1:B2:C3:00:00:0D", "ip": "192.168.1.4" }
            ]);

            // List of "latest" results (ip, mac, ip, mac, ... format).
            var latest = [
                "192.168.1.1", "A1:B2:C3:00:00:0A",
                "192.168.1.5", "A1:B2:C3:00:00:0E"
            ];

            hosts.forTesting.synchList(latest);
            var list = hosts.getHosts();
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 5, "List has the wrong number of results: " + list.length);
            // Validate the order. In this case, they should be sorted by name with the new "Unknown" being last.
            assert.strictEqual(list[0].name, "A1", list[0].name + " (0) is not in the expected place");
            assert.strictEqual(list[1].name, "A2", list[1].name + " (1) is not in the expected place");
            assert.strictEqual(list[2].name, "A3", list[2].name + " (2) is not in the expected place");
            assert.strictEqual(list[3].name, "A4", list[3].name + " (3) is not in the expected place");
            assert.strictEqual(list[4].name, "Unknown", list[4].name + " (4) is not in the expected place");
        });

        it("should mark everything offline if latest is invalid (undefined)", function () {
            hosts.forTesting.synchList();
            var list = hosts.getHosts();
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            for (var i = 0; i < list.length; i++) {
                assert(list[i].online === false, "Host is not marked as offline, and it should be");
            }
        });

        it("should mark everything offline if latest is invalid (null)", function () {
            hosts.forTesting.synchList(null);
            var list = hosts.getHosts();
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            for (var i = 0; i < list.length; i++) {
                assert(list[i].online === false, "Host is not marked as offline, and it should be");
            }
        });

        it("should mark everything offline if latest is invalid (not array)", function () {
            hosts.forTesting.synchList(42);
            var list = hosts.getHosts();
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            for (var i = 0; i < list.length; i++) {
                assert(list[i].online === false, "Host is not marked as offline, and it should be");
            }
        });

        it("should mark everything offline if latest is empty", function () {
            hosts.forTesting.synchList([]);
            var list = hosts.getHosts();
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            for (var i = 0; i < list.length; i++) {
                assert(list[i].online === false, "Host is not marked as offline, and it should be");
            }
        });
    });

    describe("getHost()", function () {
        // Runs before each test in this block
        beforeEach(function() {
            hosts.forTesting.setHosts([
                { "name": "A1", "type": "router", "mac": "A1:B2:C3:00:00:0A", "ip": "192.168.1.1" },
                { "name": "A2", "type": "server", "mac": "A1:B2:C3:00:00:0B", "ip": "192.168.1.2"},
                { "name": "A3", "type": "phone", "mac": "A1:B2:C3:00:00:0C", "ip": "192.168.1.3" },
                { "name": "A4", "type": "laptop", "mac": "A1:B2:C3:00:00:0D", "ip": "192.168.1.4" }
            ]);
        });

        it("should return the host that exists", function () {
            var mac = "A1:B2:C3:00:00:0A";
            var ret = hosts.getHost(mac);

            assert(ret, "Returned something other than true");
            // Validate returned host was what we wanted.
            assert.strictEqual(ret.name, "A1", "Host should not have changed. Name: " + ret.name);
            assert.strictEqual(ret.owner, undefined, "Owner should not have changed. Owner: " + ret.owner);
            assert.strictEqual(ret.type, "router", "Type should not have changed. Type: " + ret.type);
        });

        it("should return nothing (undefined) if the host doesn't exist", function () {
            var mac = "A1:B2:C3:00:00:EE";
            var ret = hosts.getHost(mac);

            assert.strictEqual(ret, undefined, "Nothing should have been returned. " + ret);
        });
    });

    describe("addHost()", function () {
        // Runs before each test in this block
        beforeEach(function() {
            hosts.forTesting.setHosts([
                { "name": "A1", "type": "router", "mac": "A1:B2:C3:00:00:0A", "ip": "192.168.1.1" },
                { "name": "A2", "type": "server", "mac": "A1:B2:C3:00:00:0B", "ip": "192.168.1.2"},
                { "name": "A3", "type": "phone", "mac": "A1:B2:C3:00:00:0C", "ip": "192.168.1.3" },
                { "name": "A4", "type": "laptop", "mac": "A1:B2:C3:00:00:0D", "ip": "192.168.1.4" }
            ]);
        });

        it("should add a new host if not already created", function () {
            var mac = "A1:B2:C3:00:00:0E";
            var name = "A5";
            var owner = "Bob";
            var type = "server";
            var ret = hosts.addHost(mac, name, owner, type);
            var list = hosts.getHosts();

            assert(ret, "Returned something other than true");
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 5, "List has the wrong number of results: " + list.length);
            // Should have sorted out to be last host entry.
            assert.strictEqual(list[4].name, name, "Host was not updated properly. Name: " + list[4].name);
            assert.strictEqual(list[4].type, type, "Type should not have changed. Type: " + list[4].type);
        });

        it("should ignore requests to add a host that already exists", function () {
            var mac = "A1:B2:C3:00:00:0A";
            var name = "A5";
            var owner = "Bob";
            var type = "server";
            var ret = hosts.addHost(mac, name, owner, type);
            var list = hosts.getHosts();

            assert(ret, "Returned something other than true");
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            // Validate returned host was the original, not the new values we passed in.
            assert.strictEqual(ret.name, "A1", "Host should not have changed. Name: " + ret.name);
            assert.strictEqual(ret.owner, undefined, "Owner should not have changed. Owner: " + ret.owner);
            assert.strictEqual(ret.type, "router", "Type should not have changed. Type: " + ret.type);
        });

        it("should create a new host with default values if none are provided", function () {
            var mac = "A1:B2:C3:00:00:0E";
            var ret = hosts.addHost(mac);

            assert(ret, "Returned something other than true");
            // Validate returned host was the original, not the new values we passed in.
            assert.strictEqual(ret.mac, mac, "Mac was an unexpected value. Mac: " + ret.mac);
            assert.strictEqual(ret.name, "Unknown", "Name is not the default (Unknown). Name: " + ret.name);
            assert.strictEqual(ret.owner, undefined, "Owner is not undefined (default). Owner: " + ret.owner);
            assert.strictEqual(ret.type, "unknown", "Type is not the default (unknown). Type: " + ret.type);
            assert.strictEqual(ret.ip, undefined, "IP is not undefined (default). IP: " + ret.ip);
            assert.strictEqual(ret.online, undefined, "Online is not undefined (default). Online: " + ret.online);
            assert.strictEqual(ret.last, undefined, "Last is not undefined (default). Last: " + ret.last);
        });

        it("should create a new host with a provided name", function () {
            var mac = "A1:B2:C3:00:00:0E";
            var name = "A5";
            var ret = hosts.addHost(mac, name);

            assert(ret, "Returned something other than true");
            // Validate returned host was the original, not the new values we passed in.
            assert.strictEqual(ret.mac, mac, "Mac was an unexpected value. Mac: " + ret.mac);
            assert.strictEqual(ret.name, name, "Name was an unexpected value. Name: " + ret.name);
            assert.strictEqual(ret.owner, undefined, "Owner is not undefined (default). Owner: " + ret.owner);
            assert.strictEqual(ret.type, "unknown", "Type is not the default (unknown). Type: " + ret.type);
            assert.strictEqual(ret.ip, undefined, "IP is not undefined (default). IP: " + ret.ip);
            assert.strictEqual(ret.online, undefined, "Online is not undefined (default). Online: " + ret.online);
            assert.strictEqual(ret.last, undefined, "Last is not undefined (default). Last: " + ret.last);
        });

        it("should create a new host with a provided owner", function () {
            var mac = "A1:B2:C3:00:00:0E";
            var owner = "Bob";
            var ret = hosts.addHost(mac, undefined, owner);

            assert(ret, "Returned something other than true");
            // Validate returned host was the original, not the new values we passed in.
            assert.strictEqual(ret.mac, mac, "Mac was an unexpected value. Mac: " + ret.mac);
            assert.strictEqual(ret.name, "Unknown", "Name is not the default (Unknown). Name: " + ret.name);
            assert.strictEqual(ret.owner, owner, "Owner was an unexpected value. Owner: " + ret.owner);
            assert.strictEqual(ret.type, "unknown", "Type is not the default (unknown). Type: " + ret.type);
            assert.strictEqual(ret.ip, undefined, "IP is not undefined (default). IP: " + ret.ip);
            assert.strictEqual(ret.online, undefined, "Online is not undefined (default). Online: " + ret.online);
            assert.strictEqual(ret.last, undefined, "Last is not undefined (default). Last: " + ret.last);
        });

        it("should create a new host with a provided type", function () {
            var mac = "A1:B2:C3:00:00:0E";
            var type = "phone";
            var ret = hosts.addHost(mac, undefined, undefined, type);

            assert(ret, "Returned something other than true");
            // Validate returned host was the original, not the new values we passed in.
            assert.strictEqual(ret.mac, mac, "Mac was an unexpected value. Mac: " + ret.mac);
            assert.strictEqual(ret.name, "Unknown", "Name is not the default (Unknown). Name: " + ret.name);
            assert.strictEqual(ret.owner, undefined, "Owner is not undefined (default). Owner: " + ret.owner);
            assert.strictEqual(ret.type, type, "Type was an unexpected value. Type: " + ret.type);
            assert.strictEqual(ret.ip, undefined, "IP is not undefined (default). IP: " + ret.ip);
            assert.strictEqual(ret.online, undefined, "Online is not undefined (default). Online: " + ret.online);
            assert.strictEqual(ret.last, undefined, "Last is not undefined (default). Last: " + ret.last);
        });

        it("should create a new host with a provided IP", function () {
            var mac = "A1:B2:C3:00:00:0E";
            var ip = "1.1.1.10";
            var ret = hosts.addHost(mac, undefined, undefined, undefined, ip);

            assert(ret, "Returned something other than true");
            // Validate returned host was the original, not the new values we passed in.
            assert.strictEqual(ret.mac, mac, "Mac was an unexpected value. Mac: " + ret.mac);
            assert.strictEqual(ret.name, "Unknown", "Name is not the default (Unknown). Name: " + ret.name);
            assert.strictEqual(ret.owner, undefined, "Owner is not undefined (default). Owner: " + ret.owner);
            assert.strictEqual(ret.type, "unknown", "Type is not the default (unknown). Type: " + ret.type);
            assert.strictEqual(ret.ip, ip, "IP was an unexpected value. IP: " + ret.ip);
            assert.strictEqual(ret.online, undefined, "Online is not undefined (default). Online: " + ret.online);
            assert.strictEqual(ret.last, undefined, "Last is not undefined (default). Last: " + ret.last);
        });

        it("should create a new host with a provided online status", function () {
            var mac = "A1:B2:C3:00:00:0E";
            var online = true;
            var ret = hosts.addHost(mac, undefined, undefined, undefined, undefined, online);

            assert(ret, "Returned something other than true");
            // Validate returned host was the original, not the new values we passed in.
            assert.strictEqual(ret.mac, mac, "Mac was an unexpected value. Mac: " + ret.mac);
            assert.strictEqual(ret.name, "Unknown", "Name is not the default (Unknown). Name: " + ret.name);
            assert.strictEqual(ret.owner, undefined, "Owner is not undefined (default). Owner: " + ret.owner);
            assert.strictEqual(ret.type, "unknown", "Type is not the default (unknown). Type: " + ret.type);
            assert.strictEqual(ret.ip, undefined, "IP is not undefined (default). IP: " + ret.ip);
            assert.strictEqual(ret.online, online, "Online was an unexpected value. Online: " + ret.online);
            assert.strictEqual(ret.last, undefined, "Last is not undefined (default). Last: " + ret.last);
        });

        it("should create a new host with a provided last time", function () {
            var mac = "A1:B2:C3:00:00:0E";
            var last = "2018-01-18T03:43:24.217Z";
            var ret = hosts.addHost(mac, undefined, undefined, undefined, undefined, undefined, last);

            assert(ret, "Returned something other than true");
            // Validate returned host was the original, not the new values we passed in.
            assert.strictEqual(ret.mac, mac, "Mac was an unexpected value. Mac: " + ret.mac);
            assert.strictEqual(ret.name, "Unknown", "Name is not the default (Unknown). Name: " + ret.name);
            assert.strictEqual(ret.owner, undefined, "Owner is not undefined (default). Owner: " + ret.owner);
            assert.strictEqual(ret.type, "unknown", "Type is not the default (unknown). Type: " + ret.type);
            assert.strictEqual(ret.ip, undefined, "IP is not undefined (default). IP: " + ret.ip);
            assert.strictEqual(ret.online, undefined, "Online is not undefined (default). Online: " + ret.online);
            assert.strictEqual(ret.last, last, "Last was an unexpected value. Last: " + ret.last);
        });
    });

    describe("updateHost()", function () {
        const hostMAC = "A1:B2:C3:00:00:0B";

        // Runs before each test in this block
        beforeEach(function() {
            hosts.forTesting.setHosts([
                { "name": "A1", "type": "router", "mac": "A1:B2:C3:00:00:0A", "ip": "192.168.1.1" },
                { "name": "A2", "type": "server", "mac": "A1:B2:C3:00:00:0B", "ip": "192.168.1.2"},
                { "name": "A3", "type": "phone", "mac": "A1:B2:C3:00:00:0C", "ip": "192.168.1.3" },
                { "name": "A4", "type": "laptop", "mac": "A1:B2:C3:00:00:0D", "ip": "192.168.1.4" }
            ]);
        });

        it("should set a new name, without changing type or owner (undefined)", function () {
            var name = "Testing";
            var ret = hosts.updateHost(hostMAC, name);
            var list = hosts.getHosts();

            assert(ret, "Returned something other than true");
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            // Should have sorted out to be last host entry.
            assert.strictEqual(list[3].name, name, "Host was not updated properly. Name: " + list[3].name);
            assert.strictEqual(list[3].type, "server", "Type should not have changed. Type: " + list[3].type);
        });

        it("should set a new name, without changing type or owner (null)", function () {
            var name = "Testing";
            var ret = hosts.updateHost(hostMAC, name, null, null);
            var list = hosts.getHosts();

            assert(ret, "Returned something other than true");
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            // Should have sorted out to be last host entry.
            assert.strictEqual(list[3].name, name, "Host was not updated properly. Name: " + list[3].name);
            assert.strictEqual(list[3].type, "server", "Type should not have changed. Type: " + list[3].type);
        });

        it("should set a new name, without changing type or owner (empty)", function () {
            var name = "Testing";
            var ret = hosts.updateHost(hostMAC, name, "", "");
            var list = hosts.getHosts();

            assert(ret, "Returned something other than true");
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            // Should have sorted out to be last host entry.
            assert.strictEqual(list[3].name, name, "Host was not updated properly. Name: " + list[3].name);
            assert.strictEqual(list[3].type, "server", "Type should not have changed. Type: " + list[3].type);
        });

        it("should set a new type, without changing name or owner (undefined)", function () {
            var type = "gearbox";
            var ret = hosts.updateHost(hostMAC, undefined, undefined, type);
            var list = hosts.getHosts();

            assert(ret, "Returned something other than true");
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            // Should have sorted out to be the same place.
            assert.strictEqual(list[1].name, "A2", "Name should not have changed. Name: " + list[1].name);
            assert.strictEqual(list[1].type, type, "Host was not updated properly. Type: " + list[1].type);
        });

        it("should set a new type, without changing name or owner (null)", function () {
            var type = "gearbox";
            var ret = hosts.updateHost(hostMAC, null, null, type);
            var list = hosts.getHosts();

            assert(ret, "Returned something other than true");
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            // Should have sorted out to be the same place.
            assert.strictEqual(list[1].name, "A2", "Name should not have changed. Name: " + list[1].name);
            assert.strictEqual(list[1].type, type, "Host was not updated properly. Type: " + list[1].type);
        });

        it("should set a new type, without changing name or owner (empty)", function () {
            var type = "gearbox";
            var ret = hosts.updateHost(hostMAC, "", "", type);
            var list = hosts.getHosts();

            assert(ret, "Returned something other than true");
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            // Should have sorted out to be the same place.
            assert.strictEqual(list[1].name, "A2", "Name should not have changed. Name: " + list[1].name);
            assert.strictEqual(list[1].type, type, "Host was not updated properly. Type: " + list[1].type);
        });

        it("should set a new name and type", function () {
            var name = "Testing";
            var type = "gearbox";
            var ret = hosts.updateHost(hostMAC, name, undefined, type);
            var list = hosts.getHosts();

            assert(ret, "Returned something other than true");
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            // Should have sorted out to be last host entry.
            assert.strictEqual(list[3].name, name, "Host was not updated properly. Name: " + list[3].name);
            assert.strictEqual(list[3].type, type, "Host was not updated properly. Type: " + list[3].type);
        });

        it("should change nothing if entry was not found", function () {
            var ret = hosts.updateHost("11:22:33:44:55:66", "Test");
            var list = hosts.getHosts();

            assert.strictEqual(ret, false, "Did not return false");
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
        });
    });

    describe("removeHost()", function () {
        const hostMAC = "A1:B2:C3:00:00:0B";

        // Runs before each test in this block
        beforeEach(function() {
            hosts.forTesting.setHosts([
                { "name": "A1", "type": "router", "mac": "A1:B2:C3:00:00:0A", "ip": "192.168.1.1" },
                { "name": "A2", "type": "server", "mac": "A1:B2:C3:00:00:0B", "ip": "192.168.1.2"},
                { "name": "A3", "type": "phone", "mac": "A1:B2:C3:00:00:0C", "ip": "192.168.1.3" },
                { "name": "A4", "type": "laptop", "mac": "A1:B2:C3:00:00:0D", "ip": "192.168.1.4" }
            ]);
        });

        it("should remove an existing host and return true", function () {
            var ret = hosts.removeHost(hostMAC);
            var list = hosts.getHosts();

            assert(ret, "Returned something other than true");
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 3, "List has the wrong number of results: " + list.length);
            assert.strictEqual(list[0].mac, "A1:B2:C3:00:00:0A", "Wrong host was removed or hosts are out of order?");
            assert.strictEqual(list[1].mac, "A1:B2:C3:00:00:0C", "Wrong host was removed or hosts are out of order?");
            assert.strictEqual(list[2].mac, "A1:B2:C3:00:00:0D", "Wrong host was removed or hosts are out of order?");
        });

        it("should change nothing if entry was not found and return false", function () {
            var ret = hosts.removeHost("Doesn't Exist");
            var list = hosts.getHosts();

            assert(!ret, "Returned something other than false");
            assert(list, "List is null");
            assert(Array.isArray(list), "List is not an array");
            assert.strictEqual(list.length, 4, "List has the wrong number of results: " + list.length);
            assert.strictEqual(list[0].mac, "A1:B2:C3:00:00:0A", "Wrong host was removed or hosts are out of order?");
            assert.strictEqual(list[1].mac, "A1:B2:C3:00:00:0B", "Wrong host was removed or hosts are out of order?");
            assert.strictEqual(list[2].mac, "A1:B2:C3:00:00:0C", "Wrong host was removed or hosts are out of order?");
            assert.strictEqual(list[3].mac, "A1:B2:C3:00:00:0D", "Wrong host was removed or hosts are out of order?");
        });
    });
});
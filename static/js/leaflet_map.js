!(function () {
    "use strict";

    //Create Map
    var map;
    var host = "http://192.168.1.22:5000";
    var longitude, latitude;

    //Add Openstreet Maps
    addLmaps();

    function addLmaps() {
        map = L.map("map").setView([37.8, -96.9], 5);
        var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "Map data &copy; " + mapLink,
            maxZoom: 18
        }).addTo(map);
        L.svg().addTo(map);
    }

    //Check if UrlExists or Not
    function UrlExists(url) {
        var http = new XMLHttpRequest();
        try {
            http.open("HEAD", url, false);
            http.send();
            return http.status != 404;
        } catch (error) {
            return false;
        }
    }

    var popup = L.popup();

    //Integrate svg with Map
    var svg = d3.select("#map").select("svg");

    var projection = d3.geoMercator();

    //Transform the points
    var transform = d3.geoTransform({
        point: projectPoint
    });
    var path = d3.geoPath().projection(transform);

    //Map attach to zoom functionality
    map.on("zoomend", function (e) {
        console.log("Into target function", e);
        zoomed();
    });

    //Project Point
    function projectPoint(x, y) {
        // console.log("Points are :", x, y);
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        longitude = x;
        latitude = y;
        this.stream.point(point.x, point.y);
    }

    var g = svg.select("g");

    //Load external geojson data
    var upper_sld,
        lower_sld,
        school_d,
        state_name,
        state_fp,
        sub_counties,
        places,
        congress_d;

    //Create Popup div and append respective areas data
    var popup_div = d3.select("#details");
    popup_div.append("div").attr("class", "state-tip");
    popup_div.append("div").attr("class", "congress-d-tip");
    popup_div.append("div").attr("class", "upper-sld-tip");
    popup_div.append("div").attr("class", "lower-sld-tip");
    popup_div.append("div").attr("class", "school-d-tip");
    popup_div.append("div").attr("class", "elsd-tip");
    popup_div.append("div").attr("class", "scsd-tip");
    popup_div.append("div").attr("class", "sub-county-tip");
    popup_div.append("div").attr("class", "place-tip");
    popup_div.append("div").attr("class", "concity-tip");
    popup_div.append("div").attr("class", "zipcode-tip");
    popup_div.append("div").attr("class", "loader");

    //Create tooltip
    var tooltip = d3
        .select("#chart")
        .append("div")
        .attr("class", "tooltip");

    //First Load States data
    load_states();

    //Click on map displaying details
    map.on("click", function (e) {
        popup_div.select(".congress-d-tip").html("");
        popup_div.select(".upper-sld-tip").html("");
        popup_div.select(".lower-sld-tip").html("");
        popup_div.select(".school-d-tip").html("");
        popup_div.select(".sub-county-tip").html("");
        popup_div.select(".place-tip").html("");
        popup_div.select(".elsd-tip").html("");
        popup_div.select(".scsd-tip").html("");
        popup_div.select(".concity-tip").html("");
        popup_div.select(".zipcode-tip").html("");
        popup_div.select(".loader").attr("style", "display:block;");
        popup
            .setLatLng(e.latlng)
            .setContent(popup_div.node())
            .openOn(map);
        console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
        longitude = e.latlng.lng;
        latitude = e.latlng.lat;
        console.log("longitude and latitudes are :", longitude, latitude);
        var postData = JSON.stringify({
            state_name: state_name,
            longitude: longitude,
            latitude: latitude
        });
        d3.request(host + "/get_details")
            .header("Content-Type", "application/json")
            .post(postData, function (error, data) {
                // var data1 = JSON.parse(data)
                if (data) {
                    popup_div.select(".loader").attr("style", "display:none;");
                    console.log("Data is :", JSON.parse(data.response));
                    var details = JSON.parse(data.response);
                    if (details.congress_d != undefined) {
                        popup_div
                            .select(".congress-d-tip")
                            .html("Congressional District : " + details.congress_d);
                    }
                    if (details.upper_sld != undefined) {
                        popup_div
                            .select(".upper-sld-tip")
                            .html("Upper Legislative       : " + details.upper_sld);
                    }
                    if (details.lower_sld != undefined) {
                        popup_div
                            .select(".lower-sld-tip")
                            .html("Lower Legislative       : " + details.lower_sld);
                    }
                    if (details.school_d != undefined) {
                        popup_div
                            .select(".school-d-tip")
                            .html("School District          : " + details.school_d);
                    }
                    if (details.sub_counties != undefined) {
                        popup_div
                            .select(".sub-county-tip")
                            .html("Sub County               : " + details.sub_counties);
                    }
                    if (details.places != undefined) {
                        popup_div
                            .select(".place-tip")
                            .html("Place                      : " + details.places);
                    }

                    if (details.elementary_school_d != undefined) {
                        popup_div
                            .select(".elsd-tip")
                            .html(
                                "Elementory School District: " + details.elementary_school_d
                            );
                    }
                    if (details.secondary_school_d != undefined) {
                        popup_div
                            .select(".scsd-tip")
                            .html("Secondary School District: " + details.secondary_school_d);
                    }
                    if (details.concity != undefined) {
                        popup_div
                            .select(".concity-tip")
                            .html("Concity                   :  " + details.concity);
                    }
                    if (details.zip_code != undefined) {
                        popup_div
                            .select(".zipcode-tip")
                            .html("Zip Code                   : " + details.zip_code);
                    }
                    // tooltip
                    //     .attr("style", 'display:block;');
                    popup
                        .setLatLng(e.latlng)
                        .setContent(popup_div.node())
                        .openOn(map);
                }
            });
    });

    //Clean the map
    function clean_map() {
        map.eachLayer(function (layer) {
            if (layer instanceof L.GeoJSON) {
                map.removeLayer(layer);
            }
            //console.log(layer);
        });
    }

    //Zoom functionality
    function zoomed() {
        var zoom_level = map.getZoom();
        // var scale = d3.event.scale;
        console.log("Zoom level is :", zoom_level);
        switch (true) {
            case zoom_level <= 2:
                // clean_map();
                state_name = "";
                state_fp = "";
                svg.selectAll("path").remove();
                load_states();
                break;
            case zoom_level > 2 && zoom_level <= 3:
                svg.selectAll("path").remove();
                load_congress_d(state_fp);
                break;
            case zoom_level > 3 && zoom_level <= 4:
                svg.selectAll("path").remove();
                load_upper_sld(state_name);
                break;
            case zoom_level > 4 && zoom_level <= 5:
                svg.selectAll("path").remove();
                clean_map();
                load_lower_sld(state_name);
                break;
            case zoom_level > 5 && zoom_level <= 6:
                svg.selectAll("path").remove();
                clean_map();
                load_school_d(state_name);
                break;
            case zoom_level > 6 && zoom_level <= 7:
                svg.selectAll("path").remove();
                clean_map();
                load_school_d(state_name);
                load_elsd(state_name);
                load_scsd(state_name);

                break;
            case zoom_level > 7 && zoom_level <= 9:
                svg.selectAll("path").remove();
                clean_map();
                load_sub_county(state_name);
                // load_places(state_name);
                load_concity(state_name);
                break;
            case zoom_level == 10:
                load_zipcodes(state_fp);
                break;
        }
    }

    //load congress district
    function load_congress_d(state_fp) {
        if (state_fp != "") {
            var postData1 = JSON.stringify({
                state_fp: state_fp
            });
            d3.request(host + "/get_cd_data")
                .header("Content-Type", "application/json")
                .post(postData1, function (error, data) {
                    var cd_data = JSON.parse(data.response);
                    var featureElement = svg
                        .selectAll("path")
                        .data(cd_data)
                        .enter()
                        .append("path")
                        .attr("class", "congress-d")
                        .attr("style", "pointer-events:auto;");

                    map.on("moveend", update);

                    update();

                    function update() {
                        featureElement
                            .attr("d", path)
                            // .attr('style', 'pointer-events:visiblePainted;')
                            .on("mousemove", function (d) {
                                console.log("d :", d.properties.NAMELSAD);
                                tooltip.html("Congress Distict : " + d.properties.NAMELSAD);
                                tooltip
                                    .attr("style", "display:block;")
                                    .attr(
                                        "style",
                                        "left:" +
                                        (d3.event.clientX + 30) +
                                        "px; top:" +
                                        (d3.event.clientY - 30) +
                                        "px"
                                    );
                            })
                            .on("mouseout", function () {
                                tooltip.attr("style", "display:none;");
                            });
                    }
                    congress_d = d3.selectAll(".congress-d");
                    // console.log("congress_d is :", congress_d);
                    return upper_sld;
                });
        }
    }

    //load upper sld geojson
    function load_states() {
        d3.json("/static/geojson/tl_2017_us_state1.json", function (error, data) {
            var featureElement = svg
                .selectAll("path")
                .data(topojson.feature(data, data.objects.out).features)
                .enter()
                .append("path")
                .attr("class", "state-boundary")
                .attr("style", "pointer-events:auto;");

            map.on("moveend", update);

            update();

            function update() {
                featureElement
                    .attr("d", path)
                    .on("mousemove", function (d) {
                        tooltip.html("State : " + d.properties.NAME);
                        tooltip
                            .attr("style", "display:block;")
                            .attr(
                                "style",
                                "left:" +
                                (d3.event.clientX + 30) +
                                "px; top:" +
                                (d3.event.clientY - 30) +
                                "px"
                            );
                    })
                    .on("mouseout", function () {
                        tooltip.attr("style", "display:none;");
                    })
                    .on("click", function (d) {
                        state_name = d.properties.NAME.toLowerCase();
                        state_name = state_name.replace(" ", "_");
                        state_fp = d.properties.STATEFP;
                    });
            }
        });
    }

    //load upper sld geojson
    function load_upper_sld(state_name) {
        if (state_name != "") {
            var upper_sld_url = "/static/geojson/" + state_name + "/upper_sld.json";
            if (UrlExists(upper_sld_url)) {
                // console.log("state_name is :", state_name, upper_sld_url);
                d3.json(upper_sld_url, function (error, data) {
                    var featureElement = svg
                        .selectAll("path")
                        .data(data.features)
                        .enter()
                        .append("path")
                        .attr("class", "upper-sld")
                        .attr("style", "pointer-events:auto;");

                    map.on("moveend", update);

                    update();

                    function update() {
                        featureElement
                            .attr("d", path)
                            // .attr('style', 'pointer-events:visiblePainted;')
                            .on("mousemove", function (d) {
                                tooltip.html(
                                    "Upper Legislative District : " + d.properties.NAMELSAD
                                );
                                tooltip
                                    .attr("style", "display:block;")
                                    .attr(
                                        "style",
                                        "left:" +
                                        (d3.event.clientX + 30) +
                                        "px; top:" +
                                        (d3.event.clientY - 30) +
                                        "px"
                                    );
                            })
                            .on("mouseout", function () {
                                tooltip.attr("style", "display:none;");
                            });
                    }
                    upper_sld = d3.selectAll(".upper-sld");
                    return upper_sld;
                });
            }
        }
    }

    //load lower sld geojson
    function load_lower_sld(state_name) {
        if (state_name != "") {
            var lower_sld_url = "/static/geojson/" + state_name + "/lower_sld.json";
            if (UrlExists(lower_sld_url)) {
                d3.json(lower_sld_url, function (error, data) {
                    var featureElement = svg
                        .selectAll("path")
                        .data(data.features)
                        .enter()
                        .append("path")
                        .attr("class", "lower-sld")
                        .attr("style", "pointer-events:auto;");

                    map.on("moveend", update);

                    update();

                    function update() {
                        featureElement
                            .attr("d", path)
                            .on("mousemove", function (d) {
                                // console.log("d :", d.properties.NAMELSAD);
                                tooltip.html(
                                    "Lower Legislative Districts : " + d.properties.NAMELSAD
                                );
                                tooltip
                                    .attr("style", "display:block;")
                                    .attr(
                                        "style",
                                        "left:" +
                                        (d3.event.clientX + 30) +
                                        "px; top:" +
                                        (d3.event.clientY - 30) +
                                        "px"
                                    );
                            })
                            .on("mouseout", function () {
                                tooltip.attr("style", "display:none;");
                            });
                    }
                    lower_sld = d3.selectAll(".lower-sld");
                });
            }
        }
    }

    //load school district geojson
    function load_school_d(state_name) {
        if (state_name != "") {
            var school_d_url = "/static/geojson/" + state_name + "/school_d.json";
            if (UrlExists(school_d_url)) {
                d3.json(school_d_url, function (error, data) {
                    var featureElement = svg
                        .selectAll("path")
                        .data(data.features)
                        .enter()
                        .append("path")
                        .attr("class", "school-d")
                        .attr("style", "pointer-events:auto;");

                    map.on("moveend", update);

                    update();

                    function update() {
                        featureElement
                            .attr("d", path)
                            .on("mousemove", function (d) {
                                tooltip.html("School Districts : " + d.properties.NAME);
                                tooltip
                                    .attr("style", "display:block;")
                                    .attr(
                                        "style",
                                        "left:" +
                                        (d3.event.clientX + 30) +
                                        "px; top:" +
                                        (d3.event.clientY - 30) +
                                        "px"
                                    );
                            })
                            .on("mouseout", function () {
                                tooltip.attr("style", "display:none;");
                            });
                    }
                    school_d = d3.selectAll(".school-d");
                    return school_d;
                });
            }
        }
    }

    //Load Sub Counties data
    function load_sub_county(state_name) {
        if (state_name != "") {
            var sub_county_url = "/static/geojson/" + state_name + "/sub_counties.json";
            if (UrlExists(sub_county_url)) {
                d3.json(sub_county_url, function (error, data) {
                    var featureElement = svg
                        .selectAll("path")
                        .data(data.features)
                        .enter()
                        .append("path")
                        .attr("class", "sub-counties")
                        .attr("style", "pointer-events:auto;");

                    map.on("moveend", update);

                    update();

                    function update() {
                        featureElement
                            .attr("d", path)
                            .text(function (d) {
                                return d.properties.NAME;
                            })
                            .on("mousemove", function (d) {
                                console.log("d :", d.properties.NAME);
                                tooltip.html("Sub County : " + d.properties.NAME);
                                tooltip
                                    .attr("style", "display:block;")
                                    .attr(
                                        "style",
                                        "left:" +
                                        (d3.event.clientX + 30) +
                                        "px; top:" +
                                        (d3.event.clientY - 30) +
                                        "px"
                                    );
                            })
                            .on("mouseout", function () {
                                tooltip.attr("style", "display:none;");
                            });
                    }
                    sub_counties = d3.selectAll(".sub-counties");
                    return sub_counties;
                });
            }
        }
    }

    //Load elementary school district
    function load_elsd(state_name) {
        if (state_name != "") {
            var elsd_url =
                "/static/geojson/" + state_name + "/elementary_school_d.json";
            if (UrlExists(elsd_url)) {
                d3.json(elsd_url, function (error, data) {
                    var elsd_layer = L.geoJson(data, {
                        onEachFeature: function (data, featureLayer) {
                            featureLayer.setStyle({
                                fillColor: "blue",
                                fillOpacity: 0.3,
                                weight: 0.3
                            });
                            featureLayer.bindTooltip(
                                "Elementory School District : " + data.properties.NAME
                            );
                        }
                    }).addTo(map);
                });
            }
        }
    }

    //Load Concity cities
    function load_concity(state_name) {
        if (state_name != "") {
            var concity_url = "/static/geojson/" + state_name + "/concity.json";
            if (UrlExists(concity_url)) {
                d3.json(concity_url, function (error, data) {
                    var concity_url = L.geoJson(data, {
                        onEachFeature: function (data, featureLayer) {
                            featureLayer.setStyle({
                                fillColor: "yellow",
                                fillOpacity: 0.3,
                                weight: 0.3
                            });
                            featureLayer.bindTooltip("Concity : " + data.properties.NAME);
                        }
                    }).addTo(map);
                });
            }
        }
    }

    //Load Secondary school district
    function load_scsd(state_name) {
        if (state_name != "") {
            var scsd_url = "/static/geojson/" + state_name + "/secondary_school_d.json";
            if (UrlExists(scsd_url)) {
                d3.json(scsd_url, function (error, data) {
                    var elsd_layer = L.geoJson(data, {
                        onEachFeature: function (data, featureLayer) {
                            featureLayer.setStyle({
                                fillColor: "green",
                                fillOpacity: 0.3,
                                weight: 0.3
                            });
                            featureLayer.bindTooltip(data.properties.NAME);
                        }
                    }).addTo(map);
                });
            }
        }
    }

    //Load Places
    function load_places(state_name) {
        if (state_name != "") {
            var place_url = "/static/geojson/" + state_name + "/places.json";
            if (UrlExists(place_url)) {
                d3.json(place_url, function (error, data) {
                    var featureElement = svg
                        .selectAll("path")
                        .data(data.features)
                        .enter()
                        .append("path")
                        .attr("class", "places")
                        .attr("style", "pointer-events:auto;");

                    map.on("moveend", update);

                    update();

                    function update() {
                        featureElement
                            .attr("d", path)
                            .on("mousemove", function (d) {
                                tooltip.html("Place : " + d.properties.NAME);
                                tooltip
                                    .attr("style", "display:block;")
                                    .attr(
                                        "style",
                                        "left:" +
                                        (d3.event.clientX + 30) +
                                        "px; top:" +
                                        (d3.event.clientY - 30) +
                                        "px"
                                    );
                            })
                            .on("mouseout", function () {
                                tooltip.attr("style", "display:none;");
                            });
                    }
                    places = d3.selectAll(".places");
                    // lower_sld.attr("visibility", "hidden");
                    return places;
                });
            }
        }
    }

    //Load Zip Codes
    var zip_codes;

    function load_zipcodes(state_fp) {
        if (state_fp != "") {
            var postData1 = JSON.stringify({
                state_fp: state_fp
            });
            d3.request(host + "/get_zipcode_data")
                .header("Content-Type", "application/json")
                .post(postData1, function (error, data) {
                    var cd_data = JSON.parse(data.response);
                    var zipcode_layer = L.geoJson(cd_data, {
                        onEachFeature: function (cd_data, featureLayer) {
                            // featureLayer.bindPopup(cd_data.properties.ZCTA5CE10);
                            featureLayer.setStyle({
                                fillColor: "violet",
                                fillOpacity: 0.6,
                                weight: 0.5
                            });
                            featureLayer.bindTooltip(cd_data.properties.ZCTA5CE10);
                        }
                    }).addTo(map);
                });
        }
    }
})();
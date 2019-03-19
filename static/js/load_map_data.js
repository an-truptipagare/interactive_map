var tooltip = d3
    .select("#chart")
    .append("div")
    .attr("class", "tooltip");


function clean_map() {
    map.eachLayer(function (layer) {
        if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
        }
        //console.log(layer);
    });
}

function load_upper_sld() {
    d3.json("/static/geojson/nevada/upper_sld.json", function (error, data) {

        var featureElement = svg.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("class", "upper-sld")
            .attr('style', 'pointer-events:auto;');

        map.on("moveend", update);

        update();

        function update() {
            featureElement.attr("d", path)
                // .attr('style', 'pointer-events:visiblePainted;')
                .on("mousemove", function (d) {
                    console.log("d :", d.properties.NAMELSAD);
                    tooltip
                        .html("Congress Distict : " + d.properties.NAMELSAD);
                    tooltip
                        .attr("style", 'display:block;')
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
                    tooltip
                        .attr("style", 'display:none;');
                });
        }
        upper_sld = d3.selectAll(".upper-sld");
        console.log("upeer sld is :", upper_sld);
        return upper_sld;
    });
}

function load_lower_sld() {
    d3.json("/static/geojson/nevada/lower_sld.json", function (error, data) {
        var featureElement = svg.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("class", "lower-sld");

        map.on("moveend", update);

        update();

        function update() {
            featureElement.attr("d", path);
        }
        lower_sld = d3.selectAll(".lower-sld");
        // lower_sld.attr("visibility", "hidden");

    });
}


function load_school_d() {
    d3.json("/static/geojson/nevada/school_d.json", function (error, data) {
        console.log("We are into school d data..");
        var featureElement = svg.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("class", "school-d");

        map.on("moveend", update);

        update();

        function update() {
            featureElement.attr("d", path);
        }
        school_d = d3.selectAll(".school-d");
        // lower_sld.attr("visibility", "hidden");
        return school_d;
    });
}
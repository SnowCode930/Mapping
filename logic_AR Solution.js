
// Create the Earthquake Visualization
// Get the dataset from USGS GeoJSON Feed page
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

// Create the base layers.
const streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}",
{   accessToken: API_KEY,
    maxZoom: 20
});
const topo = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token={accessToken}",
{   accessToken: API_KEY,
    maxZoom: 20
});
 // Create a baseMaps object.
const baseMaps = {
    "Street Map": streetmap,
    "Topographic Map": topo
  };
// Create an overlay object to hold our overlay.
const overlayMaps = {
    Earthquakes: earthquakes
  };
// Create the map object with options.
const map = L.map("mapid", {
    center: [39.5, -98.5],
    zoom: 3,
    layers: [streetmap, earthquakes]
  });
// Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps).addTo(map);

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function(data) {
    // console.log(data);
    // Using the features array sent back in the API data, create a GeoJSON layer and add it to the map.
    L.geoJson(data, {
        // We turn each feature into a circleMarker on the map.
        pointToLayer: function(feature, latlng) {
          console.log(data);
          return L.circleMarker(latlng);
        },
        // We set the style for each circleMarker using our styleInfo function.
        style: styleInfo,
        // Identify each earthquake with a popup marker.
        onEachFeature: function(feature, layer) {
          layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
      }).addTo(map);
    });
    // Create a legend control object.
    const legend = L.control({
        position: "bottomright"
      });
      function createFeatures(earthquakeData) {
        // Define the function and name the place and time of the earthquake.
        function onEachFeature(feature, layer) {
          layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
        }
      
        // Loop through the array and create one marker for each earthquake.
        for (let i = 0; i < earthquakeData.length; i++) {
          // Conditionals for depth (third coordinate) -->https://www.w3schools.com/cssref/css_colors.php
          let color = "";
          if (earthquakeData[i].geometry.coordinates[2] > 90) {
            color = "red";
          } else if (earthquakeData[i].geometry.coordinates[2] > 70) {
            color = "darkorange";
          } else if (earthquakeData[i].geometry.coordinates[2] > 50) {
            color = "orange";
          } else if (earthquakeData[i].geometry.coordinates[2] > 30) {
            color = "yellow";
          } else if (earthquakeData[i].geometry.coordinates[2] > 10) {
            color = "greenyellow";
          } else {
            color = "palegreen";
          }
          // Add circles to the map.
          L.circle([earthquakeData[i].geometry.coordinates[1], earthquakeData[i].geometry.coordinates[0]], {
            fillOpacity: 0.75,
            color: "",
            fillColor: color,
            // Adjust the radius.
            radius: Math.sqrt(earthquakeData[i].properties.mag) * 100000
          }).bindPopup(`<h1>${earthquakeData[i].properties.place}</h1> <hr> <h3>Magnitude: ${earthquakeData[i].properties.mag} ML <br> Depth: ${earthquakeData[i].geometry.coordinates[2]} km </h3>`).addTo(myMap);
        }
      
        // Create a GeoJSON layer that contains the features array on the earthquakeData object.
        const earthquakes = L.geoJSON(earthquakeData, {
          onEachFeature: onEachFeature
        });
      
        // Add the earthquakes layer to the overlay object.
        overlayMaps["Earthquakes"] = earthquakes;
      }
      
      // Function to add legend to the map
      function addLegend() {
          const legend = L.control({ position: 'bottomright' });
        
          legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'info legend');
            const grades = [0, 10, 30, 50, 70, 90];
            const colors = ["palegreen", "greenyellow", "yellow", "orange", "darkorange", "red"];
        
            // Loop through the density intervals and create a label with a colored square for each interval
            for (let i = 0; i < grades.length; i++) {
              div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }
        
            return div;
          };
        
          legend.addTo(myMap);
      }

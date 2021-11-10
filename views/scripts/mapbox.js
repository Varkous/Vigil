
map.on('load', function () {

  // Add a new source from our GeoJSON data and
  // set the 'cluster' option to true. GL-JS will
  // add the point_count property to your source data.
  // inspect a cluster on click
  map.addSource('stations', {
  type: 'geojson',
  // Point to GeoJSON data.
  data: stationsForMap,
  cluster: true,
  clusterMaxZoom: 14, // Max zoom to cluster points on
  clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
  });
// ---------------------------
  map.addLayer({
  id: 'clusters',
  type: 'circle',
  source: 'stations',
  // "source": data,
  filter: ['has', 'point_count'],
  paint: {
    // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
    // with three steps to implement three types of circles:
    //   * Blue, 20px circles when point count is less than 100
    //   * Yellow, 30px circles when point count is between 100 and 750
    //   * Pink, 40px circles when point count is greater than or equal to 750
    'circle-color': [
    'step',
    ['get', 'point_count'],
    '#51bbd6',
    100,
    '#f1f075',
    750,
    '#f28cb1'
    ],
    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
  }
  });
  // ---------------------------
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'stations',
    // "source": data,
    filter: ['has', 'point_count'],
    layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12
    }
  });
  // ---------------------------
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'stations',
    // "source": data,
    filter: ['!', ['has', 'point_count']],
    paint: {
    'circle-color': 'teal',
    'circle-radius': 6,
    'circle-stroke-width': 8,
    'circle-stroke-color': 'lightblue'
    }
  });

  map.on('click', 'clusters', function (e) {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['clusters']
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('stations').getClusterExpansionZoom(
      clusterId,
      function (err, zoom) {
        if (err) return;

        map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom
        });
      }
    );
  });
// ---------------------------
  // When a click event occurs on a feature in
  // the unclustered-point layer, open a popup at
  // the location of the feature, with
  // description HTML from its properties.
  map.on('click', 'unclustered-point', function (e) {
    console.log (e.features[0])
  const markerText = e.features[0].properties.markerText;
  const coordinates = e.features[0].geometry.coordinates.slice();
  // ---------------------------
    console.log (markerText)
  // Ensure that if the map is zoomed out such that
  // multiple copies of the feature are visible, the
  // popup appears over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
  coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }
  // ---------------------------
  new mapboxgl.Popup()
  .setLngLat(coordinates)
  .setHTML(markerText)
  .addTo(map);
  });
// ---------------------------
  map.on('mouseenter', 'clusters', function () {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'clusters', function () {
    map.getCanvas().style.cursor = '';
  });
});

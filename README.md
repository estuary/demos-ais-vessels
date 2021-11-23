# Example: AIS vessel data analysis/visualizations with H3 framework

BOEM and NOAA published important AIS [vessel data online](https://marinecadastre.gov/ais/).

Uber's [H3 spatial index](https://eng.uber.com/h3/), with [js support](https://github.com/uber/h3-js), provides a spatial framework to process these data in real-time.

This examples builds Flow collections and derivations on top of H3 to analyze/visualize the AIS vessel data.
- the `visualizations` folder contains examples of building and materializing the spatial data into ElasticSearch anc visualize the results using Kibana Map.
- the `analysis` folder contains a prototype of realtime detection of vessel pairs that are too close.
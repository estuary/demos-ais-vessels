# Example: AIS vessel data visualizations with H3 framework

This example builds Flow collections and derivations on top of H3 to analyze the AIS vessel data, and both the data and the analysis results are visualized via [Kibana Maps](https://www.elastic.co/guide/en/kibana/current/maps.html) on top of Elastic Search.


## Flow components
The Example build involves the following components:
- The capture `ais-data-capture` reads AIS data into the Flow system.
- The collection `vessels` hosts raw AIS data from the capture.

Three collections are derived from the collection `vessels`, including `vessel-location-links`, `vessels-last-seen`, and `vessel-movements`:
- The collection `vessels-last-seen` records the most recent locations reported by each vessel.
- The collection `vessel-location-links` connects each reported location of a vessel to its previously reported location and form a link(line segment) for visualizations. By connecting the all links of a vessel, it is possible to visualize the trajectory of a vessel.
- The collection `vessel_movements` records the interactions between the vessels and the hexagon regions defined by H3 framework. E.g. `vessel A enter(or leaves) hexagon region B`, etc.

The `vessel_movements` allows us to perform all kinds of analysis and visualization,including the following.
- The collection `vessel_activities_in_region` is derived from `vessel_movements`.
It counts the total number of vessels entering a specific H3 region for the given period of time.

Finally,
- The materializations `vessels-elastic` saves the needed collections into Elastic Search as different indices, and visualization results could be derived with Kibana utils.

Here are some results.
- `vessels-last-seen` provides an overview of the distribution of the vessels on the oceans / rivers. Examples as follows.
![all vessels](screenshots/a_1.png?raw=true "Clustered view of all vessels")
![some vessels](screenshots/a_2.png?raw=true "Local view of some vessels")

- `vessel-location-links` allows the exploration of trajectories of particular vessels in the past. Examples as follows. (One example showing a vessel circling in a single location, and the other showing a vessel travelling between to destinations.)
![vessel a](screenshots/b_1.png?raw=true "a vessel circling in a single location")
![vessel b](screenshots/b_2.png?raw=true "a vessel traveling between two destinations")

- `vessel_activities_in_region` allows the visualization of popular routes/regions (represented by H3 hexagons) that vessel frequently travels.
![with legend](screenshots/c_1.png?raw=true "popular vessel regions (Hexagons with more than 6 vessel enters in 2 days.)")
![without legend](screenshots/c_2.png?raw=true "popular vessel regions")


# How to run the demo

- Download some sample dataset from https://marinecadastre.gov/ais/
- Upload the downloaded dataset to AWS S3, under certain `bucket` and `path-prefix`.
- Modify the `airbyteSource/config` and `resource/stream` for the capture in `vessel.flow.yaml`, and provide all the AWS credentials and S3 config as needed.
- Follow [this guide](https://www.elastic.co/guide/en/kibana/current/docker.html) to start a local ElasticSearch and Kibana.
- run the flowing command to start the Flow process, wait until it is completed.
```
    flowctl api build --build-id=<build-id> --source=vessels.flow.yaml --ts-generate
    flowctl temp-data-plane --builds-root=<builds-root>
    flowctl api activate --all --build-id=<build-id> --builds-root=<builds-root> 
```
- check the results in the sqlite db with table name `close_vessel_pairs`.
- Follow [this guide](https://www.elastic.co/guide/en/kibana/current/maps-getting-started.html#_add_a_layer_for_individual_documents) for visualize the materialized data on a map.

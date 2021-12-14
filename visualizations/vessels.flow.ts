import { collections, interfaces, registers } from 'flow/modules';
import { geoToH3, /*kRing,*/ h3ToGeoBoundary } from 'h3-js';
//import { getDistance } from 'geolib';
//import * as moment from 'moment';

// Implementation for derivation vessels.flow.yaml#/collections/examples~1ais~1vessel-location-links/derivation.
export class ExamplesAisVesselLocationLinks implements interfaces.ExamplesAisVesselLocationLinks {
    locationLinkUpdate(source: collections.ExamplesAisVessels): registers.ExamplesAisVesselLocationLinks[] {
        return [source.location];
    }

    locationLinkPublish(
        source: collections.ExamplesAisVessels,
        _register: registers.ExamplesAisVesselLocationLinks,
        previous: registers.ExamplesAisVesselLocationLinks,
    ): collections.ExamplesAisVesselLocationLinks[] {
        type LineString = 'linestring';
        const visual_link =
            previous.lat > -90 && previous.lon > -180
                ? {
                      type: 'linestring' as LineString,
                      coordinates: [
                          [previous.lon, previous.lat],
                          [source.location.lon, source.location.lat],
                      ],
                  }
                : undefined;

        return [
            {
                visual_link: visual_link,
                vessel: source,
            },
        ];
    }
}

// Implementation for derivation vessels.flow.yaml#/collections/examples~1ais~1vessel_activities_in_region/derivation.
export class ExamplesAisVesselActivitiesInRegion implements interfaces.ExamplesAisVesselActivitiesInRegion {
    vesselActivitiesInRegionPublish(
        source: collections.ExamplesAisVesselMovements,
        _register: registers.ExamplesAisVesselActivitiesInRegion,
        _previous: registers.ExamplesAisVesselActivitiesInRegion,
    ): collections.ExamplesAisVesselActivitiesInRegion[] {
        let num_enters = 0;
        let num_leaves = 0;
        if (source.action == 'enter') {
            num_enters = 1;
        } else if (source.action == 'leave') {
            num_leaves = 1;
        } else {
            return [];
        }

        if (source.h3_index) {
            const hexBoundary = h3ToGeoBoundary(source.h3_index);

            type Polygon = 'polygon';
            return [
                {
                    h3_index: source.h3_index,
                    num_enters: num_enters,
                    num_leaves: num_leaves,
                    visualized_region: {
                        type: 'polygon' as Polygon,
                        coordinates: [
                            hexBoundary
                                .map((p) => {
                                    return [p[1], p[0]];
                                })
                                .concat([[hexBoundary[0][1], hexBoundary[0][0]]]),
                        ],
                    },
                },
            ];
        }
        return [];
    }
}

// Implementation for derivation vessels.flow.yaml#/collections/examples~1ais~1vessel_movements/derivation.
export class ExamplesAisVesselMovements implements interfaces.ExamplesAisVesselMovements {
    vesselMovementUpdate(source: collections.ExamplesAisVessels): registers.ExamplesAisVesselMovements[] {
        // H3 resolution table https://h3geo.org/docs/core-library/restable/
        return [
            {
                h3_index: geoToH3(source.location.lat, source.location.lon, 8),
            },
        ];
    }
    vesselMovementPublish(
        source: collections.ExamplesAisVessels,
        register: registers.ExamplesAisVesselMovements,
        previous: registers.ExamplesAisVesselMovements,
    ): collections.ExamplesAisVesselMovements[] {
        const outputs: collections.ExamplesAisVesselMovements[] = [];
        const cur_h3_index = register.h3_index;
        const prev_h3_index = previous.h3_index;

        if (cur_h3_index != prev_h3_index) {
            outputs.push({
                h3_index: cur_h3_index,
                vessel: source,
                action: 'enter',
            });

            if (prev_h3_index != '') {
                outputs.push({
                    h3_index: prev_h3_index,
                    vessel: source,
                    action: 'leave',
                });
            }
        }

        return outputs;
    }
}

// Implementation for derivation vessels.flow.yaml#/collections/examples~1ais~1vessels-last-seen/derivation.
export class ExamplesAisVesselsLastSeen implements interfaces.ExamplesAisVesselsLastSeen {
    lastSeenPublish(
        source: collections.ExamplesAisVessels,
        _register: registers.ExamplesAisVesselsLastSeen,
        _previous: registers.ExamplesAisVesselsLastSeen,
    ): collections.ExamplesAisVesselsLastSeen[] {
        return [source];
    }
}

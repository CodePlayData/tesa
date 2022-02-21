// @filename: points.ts

import { parseCsv } from "../deps.ts";
import type {
  Config,
  GeoJsonPoint,
  Layout,
  ListItems,
  LocationAddress,
  LocationPosition,
} from "../types.d.ts";

/**
 * The geocoding process is highly dependent to the Map Tiles server. We can use the World Map in Nominatim/OpenStreetMap, setup a private
 * server for a whole country or a server for each geographic region; we could also request the location based in the raw string or in a structured objet.
 * The params of this function deal with all these options.
 *
 * @param layout defines if the request will be raw string (unstructured) or an object that will store address information, labels and urls of the private servers.
 * @param location A structured object with housenumber, street, state and city, or a raw string with the address.
 * @param config Is a module piece that, besides a bunch of information, defines were
 * to find a CSV list that will store the states of which the requests belongs and directs to the proper private server identified by labels.
 * @returns A GeoJson object of Point type or a empty array(_not located_).
 */
async function forwardGeocoding(
  layout: Layout,
  location: LocationAddress | string,
  config?: Config,
): Promise<GeoJsonPoint | undefined> {
  var mapTiles: Layout["mapTiles"];
  let request: Layout["request"];

  mapTiles = layout.mapTiles;

  if (Array.isArray(mapTiles)) {
    const listURL = config?.lists?.main?.states ??
        "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/states_list.csv",
      { housenumber, street, city, state } = location as LocationAddress;

    try {
      const list = await parseCsv(
        await (
          await fetch(listURL)
        )
          .text(),
        { skipFirstRow: true, separator: ";" },
      ) as ListItems[];

      const result = mapTiles.filter((server) =>
        server.name ===
          list.filter((place) =>
            place.Alias === state
              .toUpperCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
          )[0].Subset
      )[0] as { name: string; url: string };

      console.log(`Requesting to ${result.name} a structured query...`);
      return (await JSON.parse(
        await (await fetch(
          `${result.url}/search?street=${housenumber} ${street}&city=${city}&state=${state}&country=Brazil&format=geojson`,
        )).text(),
      )) as GeoJsonPoint;
    } catch (error) {
      console.log(error.message);
    }
  } else {
    request = layout.request;

    const name = mapTiles?.name ?? "nominatim";
    const url = mapTiles?.url ?? "https://nominatim.openstreetmap.org";

    try {
      if (request === "unstructured") {
        console.log(`Requesting to ${name} a unstructured query...`);
        return (await JSON.parse(
          await (await fetch(`${url}/search?q=${location}&format=geojson`))
            .text(),
        ));
      } else {
        const { housenumber, street, city, state } =
          location as LocationAddress;

        console.log(`Requesting to ${name} a structured query...`);
        return (await JSON.parse(
          await (await fetch(
            `${url}/search?street=${housenumber} ${street}&city=${city}&state=${state}&country=Brazil&format=geojson`,
          )).text(),
        )) as GeoJsonPoint;
      }
    } catch (error) {
      console.log(error.message);
    }
  }
}

/**
 * The reverse geocoding map only works for the whole country since beforehand you don't know witch states belongs the lat and lon code.
 * However, you can select the private server or lets the nominatim.
 * @param layout contain only information with will be requested to a private server or nominatim server.
 * @param location is the latitude and longitude of the location.
 * @returns A Geojson object of Point type or a empty array(_not located_).
 */
async function reverseGeocoding(
  layout: Layout,
  location: LocationPosition,
): Promise<GeoJsonPoint | undefined> {
  var lat: LocationPosition["lat"],
    lon: LocationPosition["lon"],
    mapTiles: Layout["mapTiles"];

  mapTiles = layout.mapTiles as { name?: string; url?: string };
  lat = location.lat;
  lon = location.lon;

  const url = mapTiles?.url ?? "https://nominatim.openstreetmap.org";

  try {
    return (await JSON.parse(
      await (await fetch(`${url}/reverse?format=geojson&lat=${lat}&lon=${lon}`))
        .text(),
    ));
  } catch (error) {
    console.log(error.message);
  }
}

export { forwardGeocoding, reverseGeocoding };

// @filename: types.d.ts

export interface Config {
  lists?: {
    doubles?: {
      microregions?: string;
      immediate?: string;
      cities?: string;
    };
    main?: {
      country?: string;
      macroregion?: string;
      states?: string;
      middleregions?: string;
      immediate?: string;
      microregions?: string;
      intermediary?: string;
      cities?: string;
    };
  };
  api?: {
    localidades?: {
      cities?: string;
      microregions?: string;
      intermediary?: string;
      middleregions?: string;
      states?: string;
      immediate?: string;
      macroregion?: string;
    };
    malhas?: {
      country?: string;
      states?: string;
    };
  };
}

export interface Layout {
  request?: string;
  mapTiles?: { name?: string; url?: string } | {
    name?: string;
    url?: string;
  }[];
}

export interface LocationPosition {
  lat?: number;
  lon?: number;
}

export interface LocationAddress extends LocationPosition {
  housenumber: number;
  street: string;
  city: string;
  state: string;
}

export interface ListItems {
  Alias: string;
  Place: string;
  Link: string;
  Code?: string;
  Subset?: string;
}

export interface GeoJsonPoint {
  type: string;
  license?: string;
  features: [
    {
      type: string;
      properties?: {
        place_id?: number;
        osm_type?: string;
        osm_id?: number;
        display_name?: string;
        place_rank?: number;
        category?: string;
        type?: string;
        importance?: number;
        addresstype?: string;
        name?: string;
        address?: {
          amenity?: string;
          road?: string;
          suburb?: string;
          city_district?: string;
          city?: string;
          municipality?: string;
          county?: string;
          state_district?: string;
          state?: string;
          region?: string;
          postcode?: string;
          country?: string;
          country_code?: string;
        };
      };
      bbox?: number[];
      geometry: {
        type: string;
        coordinates: number[];
      };
    },
  ];
}

export interface DoubledItem {
  Alias: string;
  Opt1: string;
  Opt2: string;
  Opt3: string;
  Opt4: string;
  Opt5: string;
}

export interface LocationInfo {
  [key: string]: string | number | Record<string, number>;
}

export interface GeoJsonObject {
  type: string;
  license?: string;
  features: LocationInfo[] | any[];
}

export interface MetaInfoRequest {
  type: string;
  aliases: string[];
}

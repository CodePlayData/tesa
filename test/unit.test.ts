import {
    assertEquals,
    assertObjectMatch,
  } from "https://deno.land/std@0.90.0/testing/asserts.ts";
  import {
    belongsTo,
    belongsToMany,
    forwardGeocoding,
    getManyPolygons,
    getOnePolygon,
    reverseGeocoding,
    hierarchicalOrdering
  } from "../mod.ts";
  import type { LocationInfo,GeoJsonObject, Layout } from "../types.d.ts";
  
  Deno.test({
    name: "hierarchicalOrdering - Object",
    fn: async () => {
      let request =     
        {
            street: "Praça Roberto Gomes Pedrosa",
            number: "1",
            city: "São Paulo",
            geometry: [
                -23.6000888,
                -46.7222789
            ]
        }
  
    let result = await hierarchicalOrdering(request)
  
    assertObjectMatch(
      result.features[0].properties.point[0] as Record<PropertyKey, unknown>,
      { street: "Praça Roberto Gomes Pedrosa", number: "1" },
      )
    }
  })
  
  Deno.test({
    name: "hierarchicalOrdering - Array",
    fn: async () => {
      let request = [
        {
            street: "Rua Professor Plínio Bastos",
            number: "640",
            city: "Rio de Janeiro",
            geometry: [
                -22.8402601,
                -43.2668694
            ]
        },
        {
            street: "Capela de Nossa Senhora Aparecida",
            number: "10",
            city: "Rio de Janeiro",
            geometry: [
                -22.9519,
                -43.2105
            ]
        },
        {
            street: "Praça Roberto Gomes Pedrosa",
            number: "1",
            city: "São Paulo",
            geometry: [
                -23.6000888,
                -46.7222789
            ]
        }
    ]
  
    let result = await hierarchicalOrdering(request)
  
    assertObjectMatch(
      result.features[0].properties.point[2] as Record<PropertyKey, unknown>,
      { street: "Praça Roberto Gomes Pedrosa", number: "1" },
      )
    }
  })
  
  Deno.test({
    name: "reverseGeocoding - Private Server",
    fn: async () => {
      let layout: Layout = {
        mapTiles: {
          name: "Nominatim/OpenStreetMap"
        },
      };
  
      let location = {
        lon: -43.2105,
        lat: -22.9519,
      };
  
      let point = await reverseGeocoding(layout, location) as GeoJsonObject;
  
      assertObjectMatch(
        point.features[0].properties as Record<PropertyKey, unknown>,
        { name: "Capela de Nossa Senhora Aparecida" },
      );
    },
  });
  
  Deno.test({
    name: "forwardGeocoding - Many Servers - Structured",
    fn: async () => {
      let layout: Layout = {
        mapTiles: [
          {
            name: "Sudeste",
            url: "https://nominatim.openstreetmap.org",
          },
          {
            name: "Nordeste",
            url: "https://nominatim.openstreetmap.org",
          },
        ],
      };
  
      let location = {
        housenumber: 640,
        street: "Avenida Professor Plínio Bastos",
        city: "Rio de Janeiro",
        state: "Rio de Janeiro",
      };
  
      let config = {
        lists: {
          main: {
            states: "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/states_list.csv"
          }
        }
      }
      
      let point = await forwardGeocoding(layout, location, config) as GeoJsonObject;
  
      assertObjectMatch(
        point.features[0].geometry.coordinates as Record<PropertyKey, unknown>,
        {
          "0": -43.2668694,
          "1": -22.8402601,
          length: 2,
        },
      );
    },
  });
  
  Deno.test({
    name: "forwardGeocoding - One Server - Structured",
    fn: async () => {
      let layout: Layout = {
        request: "structured",
        mapTiles: {
          name: "Nominatim/OpenStreetMap"
        },
      };
      let location = {
        housenumber: 640,
        street: "Avenida Professor Plínio Bastos",
        city: "Rio de Janeiro",
        state: "Rio de Janeiro",
      };
  
      let point = await forwardGeocoding(layout, location) as GeoJsonObject;
  
      assertObjectMatch(
        point.features[0].geometry.coordinates as Record<PropertyKey, unknown>,
        {
          "0": -43.2668694,
          "1": -22.8402601,
          length: 2,
        },
      );
    },
  });
  
  Deno.test({
    name: "forwardGeocoding - One Server - Unstructured",
    fn: async () => {
      let layout = {
        request: "unstructured",
        map_tiles: {
          name: "Nominatim/OpenStreetMap",
        },
      };
  
      let point = await forwardGeocoding(
        layout,
        "Avenida Professor Plínio Bastos, 640, Olaria, Rio de Janeiro",
      ) as GeoJsonObject;
      assertObjectMatch(
        point?.features[0].geometry.coordinates as Record<PropertyKey, unknown>,
        {
          "0": -43.2668694,
          "1": -22.8402601,
          length: 2,
        },
      );
    },
  });
  
  Deno.test({
    name: "belongsCityTest",
    fn: async () => {
      let metaData = await belongsTo("amparo(pb)", "cities") as LocationInfo;
  
      assertObjectMatch(
        metaData as Record<PropertyKey, unknown>,
        { id: "2500734" },
      );
    },
  });
  
  Deno.test({
    name: "belongsMicroTest",
    fn: async () => {
      let metaData = await belongsTo("afonso claudio", "microregions") as LocationInfo;
  
      assertObjectMatch(
        metaData as Record<PropertyKey, unknown>,
        { id: 32007 },
      );
    },
  });
  
  Deno.test({
    name: "belongsMiddleTest",
    fn: async () => {
      let metaData = await belongsTo("norte fluminense", "middleregions") as LocationInfo;
  
      assertObjectMatch(
        metaData as Record<PropertyKey, unknown>,
        { id: 3302 },
      );
    },
  });
  
  Deno.test({
    name: "belongsStatesTest",
    fn: async () => {
      let metaData = await belongsTo("mato grosso", "states") as LocationInfo;
  
      assertObjectMatch(
        metaData as Record<PropertyKey, unknown>,
        { id: 51 },
      );
    },
  });
  
  Deno.test({
    name: "belongsIntermediaryTest",
    fn: async () => {
      let metaData = await belongsTo("belem", "intermediary") as LocationInfo;
  
      assertObjectMatch(
        metaData as Record<PropertyKey, unknown>,
        { id: 1501 },
      );
    },
  });
  
  Deno.test({
    name: "belongsManyMacroTest",
    fn: async () => {
      let metaData = await belongsToMany({
        type: "macroregion",
        aliases: ["NORTE", "SUL"],
      }) as LocationInfo[];
  
      assertObjectMatch(
        metaData[0] as Record<PropertyKey, unknown>,
        { id: 1 },
      );
  
      assertObjectMatch(
        metaData[1] as Record<PropertyKey, unknown>,
        { id: 4 },
      );
    },
  });
  
  Deno.test({
    name: "belongsManyStateTest",
    fn: async () => {
      let metaData = await belongsToMany({
        type: "states",
        aliases: ["RIO DE JANEIRO", "SAO PAULO"],
      }) as LocationInfo[];
  
      assertObjectMatch(
        metaData[0] as Record<PropertyKey, unknown>,
        { id: 33 },
      );
  
      assertObjectMatch(
        metaData[1] as Record<PropertyKey, unknown>,
        { id: 35 },
      );
    },
  });
  
  Deno.test({
    name: "belongsManyMiddleTest",
    fn: async () => {
      let metaData = await belongsToMany({
        type: "middleregions",
        aliases: ["BAURU", "BORBOREMA", "ITAPETININGA"],
      }) as LocationInfo[];
  
      assertObjectMatch(
        metaData[0] as Record<PropertyKey, unknown>,
        { id: 3504 },
      );
  
      assertObjectMatch(
        metaData[1] as Record<PropertyKey, unknown>,
        { id: 2502 },
      );
      assertObjectMatch(
        metaData[2] as Record<PropertyKey, unknown>,
        { id: 3511 },
      );
    },
  });
  
  Deno.test({
    name: "belongsManyMicroTest",
    fn: async () => {
      let metaData = await belongsToMany({
        type: "microregions",
        aliases: ["ALFENAS", "BANANAL", "CATU", "COLATINA", "CUIABA"],
      }) as LocationInfo[];
  
      assertObjectMatch(
        metaData[0] as Record<PropertyKey, unknown>,
        { id: 31049 },
      );
      assertObjectMatch(
        metaData[1] as Record<PropertyKey, unknown>,
        { id: 35052 },
      );
      assertObjectMatch(
        metaData[2] as Record<PropertyKey, unknown>,
        { id: 29019 },
      );
      assertObjectMatch(
        metaData[3] as Record<PropertyKey, unknown>,
        { id: 32003 },
      );
      assertObjectMatch(
        metaData[4] as Record<PropertyKey, unknown>,
        { id: 51017 },
      );
    },
  });
  
  Deno.test({
    name: "belongsManyInterTest",
    fn: async () => {
      let metaData = await belongsToMany({
        type: "intermediary",
        aliases: ["CASTANHAL", "PARINTINS"],
      }) as LocationInfo[];
  
      assertObjectMatch(
        metaData[0] as Record<PropertyKey, unknown>,
        { id: 1502 },
      );
      assertObjectMatch(
        metaData[1] as Record<PropertyKey, unknown>,
        { id: 1304 },
      );
    },
  });
  
  Deno.test({
    name: "belongsManyImmediateTest",
    fn: async () => {
      let metaData = await belongsToMany({ 
        type: "immediate", 
        aliases: ["ARIQUEMES", "CACOAL"] 
      }) as LocationInfo[];
  
      assertObjectMatch(
        metaData[0] as Record<PropertyKey, unknown>,
        { id: 110002 },
      );
      assertObjectMatch(
        metaData[1] as Record<PropertyKey, unknown>,
        { id: 110005 },
      );
    },
  });
  
  Deno.test({
    name: "belongsManyCitiesTest",
    fn: async () => {
      let metaData = await belongsToMany({
        type: "cities",
        aliases: ["ESTEIO", "ESTIVA", "ESTANCIA VELHA", "ESPINOSA", "FERREIROS"],
      }) as LocationInfo[];
  
      assertObjectMatch(
        metaData[0] as Record<PropertyKey, unknown>,
        { id: "4307708" },
      );
      assertObjectMatch(
        metaData[1] as Record<PropertyKey, unknown>,
        { id: "3124500" },
      );
      assertObjectMatch(
        metaData[2] as Record<PropertyKey, unknown>,
        { id: "4307609" },
      );
      assertObjectMatch(
        metaData[3] as Record<PropertyKey, unknown>,
        { id: "3124302" },
      );
      assertObjectMatch(
        metaData[4] as Record<PropertyKey, unknown>,
        { id: "2605509" },
      );
    },
  });
  
  Deno.test({
    name: "getOneCountryTest",
    fn: async () => {
      let polygon = await getOnePolygon("BR", "country")as GeoJsonObject;
      assertEquals("BR", polygon.features[0].properties.codarea);
    },
  });
  
  Deno.test({
    name: "getOneMacroTest",
    fn: async () => {
      let polygon = await getOnePolygon("centro-oeste", "macroregion") as GeoJsonObject;
      assertEquals("5", polygon.features[0].properties.codarea);
    },
  });
  
  Deno.test({
    name: "getOneStateTest",
    fn: async () => {
      let polygon = await getOnePolygon("mato grosso", "states") as GeoJsonObject;
      assertEquals("51", polygon.features[0].properties.codarea);
    },
  });
  
  Deno.test({
    name: "getOneMiddleTest",
    fn: async () => {
      let polygon = await getOnePolygon("norte fluminense", "middleregions") as GeoJsonObject;
      assertEquals("3302", polygon.features[0].properties.codarea);
    },
  });
  
  Deno.test({
    name: "getOneMicroTest",
    fn: async () => {
      let polygon = await getOnePolygon("afonso claudio", "microregions") as GeoJsonObject;
      assertEquals("32007", polygon.features[0].properties.codarea);
    },
  });
  
  Deno.test({
    name: "getOneImmediateTest",
    fn: async () => {
      let polygon = await getOnePolygon("brasileia", "immediate") as GeoJsonObject;
      assertEquals("120002", polygon.features[0].properties.codarea);
    },
  });
  
  Deno.test({
    name: "getOneIntermadiaryTest",
    fn: async () => {
      let polygon = await getOnePolygon("belem", "intermediary") as GeoJsonObject;
      assertEquals("1501", polygon.features[0].properties.codarea);
    },
  });
  
  Deno.test({
    name: "getOneCityTest",
    fn: async () => {
      let polygon = await getOnePolygon("amparo(pb)", "cities") as GeoJsonObject;
      assertEquals("2500734", polygon.features[0].properties.codarea);
    },
  });
  
  Deno.test({
    name: "getManyCitiesTest",
    fn: async () => {
      let polygon = await getManyPolygons({
        type: "cities",
        aliases: ["ESTEIO", "ESTIVA", "ESTANCIA VELHA", "ESPINOSA", "FERREIROS"],
      }) as LocationInfo[];
  
      assertObjectMatch(
        polygon[0] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "4307708",
          },
        },
      );
  
      assertObjectMatch(
        polygon[1] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "3124500",
          },
        },
      );
  
      assertObjectMatch(
        polygon[2] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "4307609",
          },
        },
      );
  
      assertObjectMatch(
        polygon[3] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "3124302",
          },
        },
      );
  
      assertObjectMatch(
        polygon[4] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "2605509",
          },
        },
      );
    },
  });
  
  Deno.test({
    name: "getManyMicrosTest",
    fn: async () => {
      let polygon = await getManyPolygons({
        type: "microregions",
        aliases: ["ALFENAS", "BANANAL", "CATU", "COLATINA", "CUIABA"],
      }) as LocationInfo[];
  
      assertObjectMatch(
        polygon[0] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "31049",
          },
        },
      );
  
      assertObjectMatch(
        polygon[1] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "35052",
          },
        },
      );
  
      assertObjectMatch(
        polygon[2] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "29019",
          },
        },
      );
  
      assertObjectMatch(
        polygon[3] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "32003",
          },
        },
      );
  
      assertObjectMatch(
        polygon[4] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "51017",
          },
        },
      );
    },
  });
  
  Deno.test({
    name: "getManyMiddlesTest",
    fn: async () => {
      let polygon = await getManyPolygons({
        type: "middleregions",
        aliases: ["BAURU", "BORBOREMA", "ITAPETININGA"],
      }) as LocationInfo[];
  
      assertObjectMatch(
        polygon[0] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "3504",
          },
        },
      );
  
      assertObjectMatch(
        polygon[1] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "2502",
          },
        },
      );
  
      assertObjectMatch(
        polygon[2] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "3511",
          },
        },
      );
    },
  });
  
  Deno.test({
    name: "getManyStatesTest",
    fn: async () => {
      let polygon = await getManyPolygons({
        type: "states",
        aliases: ["RIO DE JANEIRO", "SAO PAULO"],
      }) as LocationInfo[];
  
      assertObjectMatch(
        polygon[0] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "33",
          },
        },
      );
  
      assertObjectMatch(
        polygon[1] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "35",
          },
        },
      );
    },
  });
  
  Deno.test({
    name: "getManyMacrosTest",
    fn: async () => {
      let polygon = await getManyPolygons({
        type: "macroregion",
        aliases: ["NORTE", "SUL"],
      }) as LocationInfo[];
      
      
  
      assertObjectMatch(
        polygon[0] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "1",
          },
        },
      );
  
      assertObjectMatch(
        polygon[1] as Record<PropertyKey, unknown>,
        {
          properties: {
            codarea: "4",
          },
        },
      ); 
    },
  });
  
  // ERROR Tests
  
  Deno.test({
    name: "errorTestGetOneCity",
    fn: async () => {
      let polygon = await getOnePolygon("amparo", "cities");
      assertEquals(undefined, polygon);
    },
  });
  
  Deno.test({
    name: "errorTestGetOneMicro",
    fn: async () => {
      let polygon = await getOnePolygon("gurupi", "microregions");
      assertEquals(undefined, polygon);
    },
  });
  
  Deno.test({
    name: "errorTestGetManyCity",
    fn: async () => {
      let polygon = await getManyPolygons({
        type: "cities",
        aliases: ["amparo", "aparecida"],
      });
      assertEquals(undefined, polygon);
    },
  });
  
  Deno.test({
    name: "errorTestGetManyMicro",
    fn: async () => {
      let polygon = await getManyPolygons({
        type: "microregions",
        aliases: ["gurupi", "cascavel"],
      });
      assertEquals(undefined, polygon);
    },
  });
  
  Deno.test({
    name: "errorTestBelongsToCity",
    fn: async () => {
      let polygon = await belongsTo("amparo", "cities");
      assertEquals(undefined, polygon);
    },
  });
  
  Deno.test({
    name: "errorTestBelongsToMicro",
    fn: async () => {
      let polygon = await belongsTo("gurupi", "microregions");
      assertEquals(undefined, polygon);
    },
  });
  
  Deno.test({
    name: "errorTestBelongsManyCity",
    fn: async () => {
      let metaData = await belongsToMany({
        type: "cities",
        aliases: ["amparo", "atalaia"],
      });
      assertEquals(undefined, metaData);
    },
  });
  
  Deno.test({
    name: "errorTestBelongsManyMicro",
    fn: async () => {
      let polygon = await belongsToMany({
        type: "microregions",
        aliases: ["gurupi", "cascavel"],
      });
      assertEquals(undefined, polygon);
    },
  });
  
  Deno.test({
    name: "errorTestBelongsManyImmediate",
    fn: async () => {
      let polygon = await belongsToMany({
        type: "immediate",
        aliases: ["ITABAIANA", "VALENCA"],
      });
      assertEquals(undefined, polygon);
    },
  });
   
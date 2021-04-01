import { assertEquals, assertObjectMatch } from "https://deno.land/std@0.90.0/testing/asserts.ts"
import { getOnePolygon, getManyPolygons, belongsTo, belongsToMany, forwardGeocoding } from './mod.js'

Deno.test({
    name: "forwardGeocoding",
    fn: () => {

        let config = {
            request: "unstructured", 
            map_tiles: { 
              name: "aaa", 
              url: "http://... " 
            }
          }

        forwardGeocoding(config, 'jdijdiei')
    
    }
})

Deno.test({
    name: "belongsCityTest" ,
    fn: async () => {
        let metaData = await belongsTo('amparo(pb)', 'cities')
        
        assertObjectMatch(
            metaData,
            { id: 2500734 }
        )

    }
})

Deno.test({
    name: "belongsMicroTest" ,
    fn: async () => {
        let metaData = await belongsTo('afonso claudio', 'microregions')
        
        assertObjectMatch(
            metaData,
            { id: 32007 }
        )

    }
})

Deno.test({
    name: "belongsMiddleTest" ,
    fn: async () => {
        let metaData = await belongsTo('norte fluminense', 'middleregions')
        
        assertObjectMatch(
            metaData,
            { id: 3302 }
        )

    }
})

Deno.test({
    name: "belongsStatesTest" ,
    fn: async () => {
        let metaData = await belongsTo('mato grosso', 'states')
        
        assertObjectMatch(
            metaData,
            { id: 51 }
        )

    }
})

Deno.test({
    name: "belongsIntermediaryTest" ,
    fn: async () => {
        let metaData = await belongsTo('belem', 'intermediary')
        
        assertObjectMatch(
            metaData,
            { id: 1501 }
        )

    }
})

Deno.test({
    name: "belongsImmediateTest" ,
    fn: async () => {
        let metaData = await belongsTo('brasileia', 'immediate')
        
        assertObjectMatch(
            metaData,
            { id: 120002 }
        )

    }
})

Deno.test({
    name: "belongsManyMacroTest", 
    fn: async () => {
        let metaData = await belongsToMany({ type: "macroregion", aliases: ["NORTE", "SUL"] })
        
        assertObjectMatch(
            metaData[0],
            { id: 1 }
        )

        assertObjectMatch(
            metaData[1],
            { id: 4 }
        )

    } 
})

Deno.test({
    name: "belongsManyStateTest", 
    fn: async () => {
        let metaData = await belongsToMany({ type: "states", aliases: ["RIO DE JANEIRO", "SAO PAULO"] })
        
        assertObjectMatch(
            metaData[0],
            { id: 33 }
        )
        
        assertObjectMatch(
            metaData[1],
            { id: 35 }
        )

    } 
})

Deno.test({
    name: "belongsManyMiddleTest", 
    fn: async () => {
        let metaData = await belongsToMany({ type: "middleregions", aliases: ["BAURU", "BORBOREMA", "ITAPETININGA"] })
        
        assertObjectMatch(
            metaData[0],
            { id: 3504 }
        )
        
        assertObjectMatch(
            metaData[1],
            { id: 2502 }
        )
        assertObjectMatch(
            metaData[2],
            { id: 3511 }
        )

    } 
})

Deno.test({
    name: "belongsManyMicroTest", 
    fn: async () => {
        let metaData = await belongsToMany({ type: "microregions", aliases: ["ALFENAS", "BANANAL", "CATU", "COLATINA", "CUIABA"] })
        
        assertObjectMatch(
            metaData[0],
            { id: 31049 }
        )  
        assertObjectMatch(
            metaData[1],
            { id: 35052 }
        )
        assertObjectMatch(
            metaData[2],
            { id: 29019 }
        )
        assertObjectMatch(
            metaData[3],
            { id: 32003 }
        )
        assertObjectMatch(
            metaData[4],
            { id: 51017 }
        )

    } 
})

Deno.test({
    name: "belongsManyInterTest", 
    fn: async () => {
        let metaData = await belongsToMany({ type: "intermediary", aliases: ["CASTANHAL", "PARINTINS"] })
        
        assertObjectMatch(
            metaData[0],
            { id: 1502 }
        )  
        assertObjectMatch(
            metaData[1],
            { id: 1304 }
        )

    } 
})

Deno.test({
    name: "belongsManyImmediateTest", 
    fn: async () => {
        let metaData = await belongsToMany({ type: "immediate", aliases: ["ARIQUEMES", "CACOAL"] })
        
        assertObjectMatch(
            metaData[0],
            { id: 110002 }
        )  
        assertObjectMatch(
            metaData[1],
            { id: 110005 }
        )

    } 
})

Deno.test({
    name: "belongsManyCitiesTest", 
    fn: async () => {
        let metaData = await belongsToMany({ type: "cities", aliases: ["ESTEIO", "ESTIVA", "ESTANCIA VELHA", "ESPINOSA", "FERREIROS"] })
        
        assertObjectMatch(
            metaData[0],
            { id: 4307708 }
        )  
        assertObjectMatch(
            metaData[1],
            { id: 3124500 }
        )
        assertObjectMatch(
            metaData[2],
            { id: 4307609 }
        )
        assertObjectMatch(
            metaData[3],
            { id: 3124302 }
        )
        assertObjectMatch(
            metaData[4],
            { id: 2605509 }
        )

    } 
})

Deno.test({
    name: "getOneCountryTest", 
    fn: async () => {
        let polygon = await getOnePolygon('BR', 'country')
        assertEquals("BR", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "getOneMacroTest", 
    fn: async () => {
        let polygon = await getOnePolygon('centro-oeste', 'macroregion')
        assertEquals("5", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "getOneStateTest", 
    fn: async () => {
        let polygon = await getOnePolygon('mato grosso', 'states')
        assertEquals("51", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "getOneMiddleTest", 
    fn: async () => {
        let polygon = await getOnePolygon('norte fluminense', 'middleregions')
        assertEquals("3302", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "getOneMicroTest", 
    fn: async () => {
        let polygon = await getOnePolygon('afonso claudio', 'microregions')
        assertEquals("32007", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "getOneImmediateTest", 
    fn: async () => {
        let polygon = await getOnePolygon('brasileia', 'immediate')
        assertEquals("120002", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "getOneIntermadiaryTest", 
    fn: async () => {
        let polygon = await getOnePolygon('belem', 'intermediary')
        assertEquals("1501", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "getOneCityTest", 
    fn: async () => {
        let polygon = await getOnePolygon('amparo(pb)', 'cities')
        assertEquals("2500734", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "getManyCitiesTest", 
    fn: async () => {
        let polygon = await getManyPolygons({ type: "cities", aliases: ["ESTEIO", "ESTIVA", "ESTANCIA VELHA", "ESPINOSA", "FERREIROS"] })
        
        assertObjectMatch( 
            polygon[0],
            { properties: {
                codarea: "4307708"
                }
            })
            
        assertObjectMatch( 
            polygon[1],
            { properties: {
                codarea: "3124500"
                }
            })
            
        assertObjectMatch( 
            polygon[2],
            { properties: {
                codarea: "4307609"
                }
            })
        
        assertObjectMatch( 
            polygon[3],
            { properties: {
                codarea: "3124302"
                }
            })
            
        assertObjectMatch( 
            polygon[4],
            { properties: {
                codarea: "2605509"
                }
            })
        } 
})

Deno.test({
    name: "getManyMicrosTest", 
    fn: async () => {
        let polygon = await getManyPolygons({ type: "microregions", aliases: ["ALFENAS", "BANANAL", "CATU", "COLATINA", "CUIABA"] })
        
        assertObjectMatch( 
            polygon[0],
            { properties: {
                codarea: "31049"
                }
            })
            
        assertObjectMatch( 
            polygon[1],
            { properties: {
                codarea: "35052"
                }
            })
            
        assertObjectMatch( 
            polygon[2],
            { properties: {
                codarea: "29019"
                }
            })
        
        assertObjectMatch( 
            polygon[3],
            { properties: {
                codarea: "32003"
                }
            })
            
        assertObjectMatch( 
            polygon[4],
            { properties: {
                codarea: "51017"
                }
            })
        
        } 
})

Deno.test({
    name: "getManyMiddlesTest", 
    fn: async () => {
        let polygon = await getManyPolygons({ type: "middleregions", aliases: ["BAURU", "BORBOREMA", "ITAPETININGA"] })
        
        assertObjectMatch( 
            polygon[0],
            { properties: {
                codarea: "3504"
                }
            })
            
        assertObjectMatch( 
            polygon[1],
            { properties: {
                codarea: "2502"
                }
            })
            
        assertObjectMatch( 
            polygon[2],
            { properties: {
                codarea: "3511"
                }
            })
        
        } 
})

Deno.test({
    name: "getManyStatesTest", 
    fn: async () => {
        let polygon = await getManyPolygons({ type: "states", aliases: ["RIO DE JANEIRO", "SAO PAULO"] })
        
        assertObjectMatch( 
            polygon[0],
            { properties: {
                codarea: "33"
                }
            })
            
        assertObjectMatch( 
            polygon[1],
            { properties: {
                codarea: "35"
                }
            })

        } 
})

Deno.test({
    name: "getManyMacrosTest", 
    fn: async () => {
        let polygon = await getManyPolygons({ type: "macroregion", aliases: ["NORTE", "SUL"] })
        
        assertObjectMatch( 
            polygon[0],
            { properties: {
                codarea: "1"
                }
            })
            
        assertObjectMatch( 
            polygon[1],
            { properties: {
                codarea: "4"
                }
            })

        } 
})



// ERROR Tests

Deno.test({
    name: "errorTestGetOneCity", 
    fn: async () => {
        let polygon = await getOnePolygon('amparo', 'cities')
        assertEquals(undefined, polygon)
    } 
})

Deno.test({
    name: "errorTestGetOneMicro", 
    fn: async () => {
        let polygon = await getOnePolygon('gurupi', 'microregions')
        assertEquals(undefined, polygon)
    } 
})

Deno.test({
    name: "errorTestGetManyCity", 
    fn: async () => {
        let polygon = await getManyPolygons({ type: "cities", aliases: ["amparo", "aparecida"] })
        assertEquals(undefined, polygon)
    } 
})

Deno.test({
    name: "errorTestGetManyMicro", 
    fn: async () => {
        let polygon = await getManyPolygons({ type: "microregions", aliases: ["gurupi", "cascavel"] })
        assertEquals(undefined, polygon)
    } 
})

Deno.test({
    name: "errorTestBelongsToCity", 
    fn: async () => {
        let polygon = await belongsTo('amparo', 'cities')
        assertEquals(undefined, polygon)
    } 
})

Deno.test({
    name: "errorTestBelongsToMicro", 
    fn: async () => {
        let polygon = await belongsTo('gurupi', 'microregions')
        assertEquals(undefined, polygon)
    } 
})

Deno.test({
    name: "errorTestBelongsManyCity" ,
    fn: async () => {
        let metaData = await belongsToMany( { type: "cities", aliases: ['amparo', 'atalaia']} )
        assertEquals(undefined, metaData)
    }
})

Deno.test({
    name: "errorTestBelongsManyMicro", 
    fn: async () => {
        let polygon = await belongsToMany({ type: "microregions", aliases: ["gurupi", "cascavel"] })
        assertEquals(undefined, polygon)
    } 
})

Deno.test({
    name: "errorTestBelongsManyImmediate", 
    fn: async () => {
        let polygon = await belongsToMany({ type: "immediate", aliases: ["ITABAIANA", "VALENCA"] })
        assertEquals(undefined, polygon)
    } 
})

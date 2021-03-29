import { assertEquals, assertObjectMatch } from "https://deno.land/std@0.90.0/testing/asserts.ts"
import { getOnePolygon, getManyPolygons, belongsTo } from './mod.js'

/* Deno.test({
    name: "belongsCity" ,
    fn: async () => {
        let metaData = await belongsTo('amparo(pb)', 'cities')
    }
})
Deno.test({
    name: "belongsMicro" ,
    fn: async () => {
        let metaData = await belongsTo('afonso claudio', 'microregions')
    }
})
Deno.test({
    name: "belongsMiddle" ,
    fn: async () => {
        let metaData = await belongsTo('norte fluminense', 'middleregions')
    }
})
Deno.test({
    name: "belongsStates" ,
    fn: async () => {
        let metaData = await belongsTo('mato grosso', 'states')
    }
}) */

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
    name: "getOneCityErrorTest", 
    fn: async () => {
        let polygon = await getOnePolygon('amparo', 'cities')
        assertEquals(undefined, polygon)
    } 
})

Deno.test({
    name: "getOneMicroErrorTest", 
    fn: async () => {
        let polygon = await getOnePolygon('gurupi', 'microregions')
        assertEquals(undefined, polygon)
    } 
})

Deno.test({
    name: "getManyCityErrorTest", 
    fn: async () => {
        let polygon = await getManyPolygons({ type: "cities", aliases: ["amparo", "aparecida"] })
        assertEquals(undefined, polygon)
    } 
})

Deno.test({
    name: "getManyMicroErrorTest", 
    fn: async () => {
        let polygon = await getManyPolygons({ type: "microregions", aliases: ["gurupi", "cascavel"] })
        assertEquals(undefined, polygon)
    } 
})

Deno.test({
    name: "getManyImmediateErrorTest", 
    fn: async () => {
        let polygon = await getManyPolygons({ type: "immediate", aliases: ["VALENCA"] })
        assertEquals(undefined, polygon)
        } 
})
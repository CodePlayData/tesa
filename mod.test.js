import { assertEquals, assertObjectMatch } from "https://deno.land/std@0.90.0/testing/asserts.ts"
import { getOnePolygon, getManyPolygons } from './src/controllers.js'

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


// DOUBLES ERROR TESTS >> Tem que corrigir com flat() a saida de todos eles.

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

// Faltam os testes de estados e macroregiões. 

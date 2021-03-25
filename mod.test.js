import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts"
import { getOnePolygon, getManyPolygons } from './src/controllers.js'

Deno.test({
    name: "getOneCountryTest", 
    fn: async () => {
        let polygon = await getOnePolygon('BR', 'country')
        assertEquals("BR", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "getOneMacroregionTest", 
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
    name: "getOneMiddlewareTest", 
    fn: async () => {
        let polygon = await getOnePolygon('norte fluminense', 'middleregions')
        assertEquals("3302", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "getOneMicroregionTest", 
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
    name: "getOneCityErrorTest", 
    fn: async () => {
        let polygon = await getOnePolygon('amparo', 'cities')
        assertEquals(undefined, polygon)
    } 
})

Deno.test({
    name: "getManyCitiesErrorTest", 
    fn: async () => {
        let polygon = await getManyPolygons({ type: "cities", aliases: ["ESTEIO", "ESTIVA", "ESTANCIA VELHA"] })
        assertEquals(undefined, polygon)
    } 
})


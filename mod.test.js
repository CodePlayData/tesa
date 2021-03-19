import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts"
import { getPolygon } from './src/controllers.js'

Deno.test({
    name: "country-test", 
    fn: async () => {
        let polygon = await getPolygon('BR', 'country')
        assertEquals("BR", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "macroregion-test", 
    fn: async () => {
        let polygon = await getPolygon('centro-oeste', 'macroregion')
        assertEquals("5", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "state-test", 
    fn: async () => {
        let polygon = await getPolygon('mato grosso', 'states')
        assertEquals("51", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "middleware-test", 
    fn: async () => {
        let polygon = await getPolygon('norte fluminense', 'middleregions')
        assertEquals("3302", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "microregion-test", 
    fn: async () => {
        let polygon = await getPolygon('afonso claudio', 'microregions')
        assertEquals("32007", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "city-test", 
    fn: async () => {
        let polygon = await getPolygon('amparo(pb)', 'cities')
        assertEquals("2500734", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "city-test", 
    fn: async () => {
        let polygon = await getPolygon('amparo(pb)', 'cities')
        assertEquals("2500734", polygon.features[0].properties.codarea)
    } 
})

Deno.test({
    name: "city-error-test", 
    fn: async () => {
        let polygon = await getPolygon('amparo', 'cities')
        assertEquals(undefined, polygon)
    } 
})

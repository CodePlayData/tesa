import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'

async function getCountryPolygon (alias) {
    
    const list = 
        await parseCsv(
            await (
                await fetch("https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/country_list.csv"))
                .text(), { skipFirstRow: true, separator: ";" }
                )
    
    const result = 
        fetch(...list.filter(place => place.Alias === alias.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ""))
            .map(place => place.Link))

    let polygon
    
    polygon = 
        await (
            await result)
            .json()

    console.log(polygon)

}

async function getMacroregionPolygon (alias) {
    
    const list = 
        await parseCsv(
            await (
                await fetch("https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/macroregion_list.csv"))
                .text(), { skipFirstRow: true, separator: ";" }
                )
    
    const result = 
        fetch(...list.filter(place => place.Alias === alias.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ""))
            .map(place => place.Link))

    let polygon
    
    polygon = 
        await (
            await result)
            .json()
            
    console.log(polygon)

}

async function getStatesPolygon (alias) {
    
    const list = 
        await parseCsv(
            await (
                await fetch("https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/states_list.csv"))
                .text(), { skipFirstRow: true, separator: ";" }
                )
    
    const result = 
        fetch(...list.filter(place => place.Alias === alias.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ""))
            .map(place => place.Link))

    let polygon
    
    polygon = 
        await (
            await result)
            .json()

    console.log(polygon)

}

getCountryPolygon('BR')
getMacroregionPolygon('centro-oeste')
getStatesPolygon('11')
import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'

async function getCountryPolygon (alias) {
    
    const list = 
        await parseCsv(
            await (
                await fetch("https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/country_list.csv"))
                .text(), { skipFirstRow: true, separator: ";" }
                )
    
    const result = 
        fetch(...list.filter(place => place.Alias === alias
            .toUpperCase()
            .normalize('NFD')
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
        fetch(...list.filter(place => place.Alias === alias
            .toUpperCase()
            .normalize('NFD')
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
        fetch(...list.filter(place => place.Alias === alias
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ""))
            .map(place => place.Link))

    let polygon
    
    polygon = 
        await (
            await result)
            .json()

    console.log(polygon)

}

async function getMiddleRegions (alias) {
    
    const list = 
        await parseCsv(
            await (
                await fetch("https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/middlewareregion_list.csv"))
                .text(), { skipFirstRow: true, separator: ";" }
                )
    
    const result = 
        fetch(...list.filter(place => place.Alias === alias
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ""))
            .map(place => place.Link))

    let polygon
    
    polygon = 
        await (
            await result)
            .json()

    console.log(polygon)
}

async function getMicroRegions (alias) {
    
    const doubles_list = 
        await parseCsv(
            await (
                await fetch("https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/micro_double_list.csv"))
                .text(), { skipFirstRow: true, separator: ";" }
                )

    const doubles= 
        doubles_list.filter(place => place.Alias === alias
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ""))
            .map(place => [place.Opt1, place.Opt2])

    console.log(...doubles)
    
    const list = 
        await parseCsv(
            await (
                await fetch("https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/microregion_list.csv"))
                .text(), { skipFirstRow: true, separator: ";" }
                )
    
    const result = 
        fetch(...list.filter(place => place.Alias === alias
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ""))
            .map(place => place.Link))

    let polygon
    
    polygon = 
        await (
            await result)
            .json()

    console.log(polygon)
}

async function getCitiesRegions (alias) {
    
    const doubles_list = 
        await parseCsv(
            await (
                await fetch("https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_double_list.csv"))
                .text(), { skipFirstRow: true, separator: ";" }
                )

    const doubles= 
        doubles_list.filter(place => place.Alias === alias
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ""))
            .map(place => [place.Opt1, place.Opt2])

    console.log(...doubles)
    
    const list = 
        await parseCsv(
            await (
                await fetch("https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_list.csv"))
                .text(), { skipFirstRow: true, separator: ";" }
                )
    
    const result = 
        fetch(...list.filter(place => place.Alias === alias
            .toUpperCase()
            .normalize('NFD')
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
getStatesPolygon('mato grosso')
getMiddleRegions('norte fluminense')
getMicroRegions('afonso claudio')
getCitiesRegions('amparo(pb)')
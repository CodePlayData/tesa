import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'


async function getOnePolygon (alias, type) {
    
    let url
    let doubles_url
    let polygon

    switch (type) {
        case "microregions":
            doubles_url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/micro_double_list.csv"
            break
    
        case "cities":
            doubles_url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_double_list.csv"
            break
    }

    switch(type) {
        case "country": 
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/country_list.csv"
            break
        case "macroregion": 
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/macroregion_list.csv"
            break
        case "states": 
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/states_list.csv"
            break
        case "middleregions": 
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/middlewareregion_list.csv"
            break
        case "microregions": 
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/microregion_list.csv"
            break
        case "cities": 
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_list.csv"
            break
    }

    if (type === "microregions" || type === "cities") {
        
        const doubles_list = 
            await parseCsv(
                await (
                    await fetch(doubles_url))
                    .text(), { skipFirstRow: true, separator: ";" }
                    )

        const doubles= 
            doubles_list.filter(place => place.Alias === alias
                .toUpperCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ""))
                .map(place => [place.Opt1, place.Opt2, place.Opt3, place.Opt4, place.Opt5])
            
            if (doubles.length > 0) {
                console.log("Existem nomes repetidos nessa categoria geográfica, experimente trocar para:", ...doubles)   
                return            
            }      
    }

    try {
        const list = 
            await parseCsv(
                await (
                    await fetch(url))
                    .text(), { skipFirstRow: true, separator: ";" }
                    )
    
        const result = 
            fetch(...list.filter(place => place.Alias === alias
                .toUpperCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ""))
                .map(place => place.Link))
    
        polygon = 
            await (
                await result)
                .json()

        console.log('found!')
        return(polygon)

    } catch (error) {
        console.log(error.message)
        return
    }
}

async function getManyPolygons (request) {
    
    let url
    let doubles_url
    let polygons
    let { type, aliases } = request
    let doubles_results = []
    let place_codes = []

    switch (type) {
        case "microregions":
            doubles_url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/micro_double_list.csv"
            break
    
        case "cities":
            doubles_url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_double_list.csv"
            break
    }

    switch(type) {
        case "country": 
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/country_list.csv"
            break
        case "macroregion": 
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/macroregion_list.csv"
            break
        case "states": 
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/states_list.csv"
            break
        case "middleregions": 
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/middlewareregion_list.csv"
            break
        case "microregions": 
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/microregion_list.csv"
            break
        case "cities": 
            url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_list.csv"
            break
    }

    if (type === "microregions" || type === "cities") {
        
        const doubles_list = 
            await parseCsv(
                await (
                    await fetch(doubles_url))
                    .text(), { skipFirstRow: true, separator: ";" }
                    )

    let doubles =
        aliases.map(i=> doubles_list.filter(place => place.Alias === i
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ""))
            .map(place => [place.Opt1, place.Opt2, place.Opt3, place.Opt4, place.Opt5]))
        
    
        doubles.map(i => i.map(o => doubles_results.push(...o)))
    
        if (doubles_results.length > 0) {
            console.log("Existem nomes repetidos nessa categoria geográfica, experimente trocar para:", ...doubles_results)   
            return            
        }     
    }

    try {
        const list = 
            await parseCsv(
                await (
                    await fetch(url))
                    .text(), { skipFirstRow: true, separator: ";" }
                    )
    
        const result = 
            aliases.map(i=> list.filter(place => place.Alias === i
                .toUpperCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ""))
                .map(place => place.Code))
    
        result.map(i => place_codes.push(...i))

        console.log(place_codes)

    } catch (error) {
        console.log(error.message)
        return
    }
}

export {
    getOnePolygon,
    getManyPolygons

}
import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'


async function getOnePolygon (alias, type) {
    
    let url
    let doubles_url
    let polygon

    // defining the url that will get the double list
    switch (type) {
        case "microregions":
            doubles_url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/micro_double_list.csv"
            break
    
        case "cities":
            doubles_url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_double_list.csv"
            break
    }

    // defining the url that will get the alias list
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

    // check if there is any doubled names in microregions or cities
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

    
    let { type, aliases } = request
    let url
    let code
    let doubles_url
    let base_url
    let doubles_results = []
    let place_codes = []
    let unique_codes = []
    let polygons


    // defining the url that will get the double list
    switch (type) {
        case "microregions":
            doubles_url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/micro_double_list.csv"
            break
    
        case "cities":
            doubles_url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/cities_double_list.csv"
            break
    }


    // defining the url that will get the alias list
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


    


    // check if there is any doubled names in microregions or cities
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


    // in case of macroregion or states the method GET will be called once. For all others the call could vary from 1 to 27.
    if (type === "macroregion" || type === "states") {
        console.log("download dos poligonos por uma url só")
    }

    try {
    
    
        // get the alias list 
        const list = 
            await parseCsv(
                await (
                    await fetch(url))
                    .text(), { skipFirstRow: true, separator: ";" }
                    )
    
                    
        // filter the alias list to the items in aliases array of the request and getting the code to insert in the urls in case not macroregion and states
        const result = 
            aliases.map(i=> list.filter(place => place.Alias === i
                .toUpperCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ""))
                .map(place => place.Code)).flat()
    
        //ajeitei o flat no result pode quebrar aqui
        result.map(i => place_codes.push(i.toString().substring(0, 2)))
        
        unique_codes = [...new Set(place_codes)]
        
        const major_polygons = await Promise.all( unique_codes.map( async (i) => {
            
                code = eval(i)
                
                // defining the url that will get the polygons
                switch(type) {
                    case "macroregion": 
                        base_url = "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=regiao"
                        break
                    case "states": 
                        base_url = "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=UF"
                        break
                    case "middleregions": 
                        base_url = `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=mesorregiao`
                        break
                    case "microregions": 
                        base_url = `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=microrregiao`
                        break
                    case "cities": 
                        base_url = `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=municipio`
                        break
                }
            
                
             return JSON.parse( await (await fetch(base_url)).text() )
                
            })
        )
        
       
        
        polygons = [...result.map(i => major_polygons.map(o=> o.features.filter(u => u.properties.codarea === i) )).flat().flat()]
        
        console.log('found!')
        return(polygons)

    } catch (error) {
        console.log(error.message)
        return
    }
}

export {
    getOnePolygon,
    getManyPolygons
}

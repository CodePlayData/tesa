/* 

These functions are made for Geolocation. 

It's most atomics possible and can be used in High Order Functions, for example: if some one wants to perform a hierarchical geolocation, witch means, to get all polygons that determined point belongs, they can parse the address in country (if necessary), macroregion, states, middleware and microregions and city, to perform a download of all these polygons, put them in order and then insert the location of point as the lowest level. Of course to do that you have to known beforehand these locations, that's why the belongTo function exists.

*/ 

import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'

const config = JSON.parse(await Deno.readTextFile('config.json'))

// implementar trycatch
async function belongsTo (alias, type) { 
    
    let url
    let doubles_url

    // defining the url that will get the double list
    switch (type) {
        case "microregions":
            doubles_url = config.lists.doubles.microregions
            break
        case "immediate":
            doubles_url = config.lists.doubles.immediate
            break
        case "cities":
            doubles_url = config.lists.doubles.cities
            break
    }

    switch(type) {
        case "country": 
            url = config.lists.main.country
            break
        case "macroregion": 
            url = config.lists.main.macroregion
            break
        case "states": 
            url = config.lists.main.states
            break
        case "middleregions": 
            url = config.lists.main.middleregions
            break
        case "immediate": 
            url = config.lists.main.immediate
            break
        case "microregions": 
            url = config.lists.main.microregions
            break
        case "intermediary": 
            url = config.lists.main.intermediary
            break
        case "cities": 
            url = config.lists.main.cities
            break
    }

    if (type === "microregions" || type === "cities" || type === "immediate") {
            
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
                console.log("Existem nomes repetidos nessa categoria geográfica, experimente trocar para:\n")
                doubles.flat().map(i => console.log(String(i)))   
                return            
            }      
    }

    const list = 
            await parseCsv(
                await (
                    await fetch(url))
                    .text(), { skipFirstRow: true, separator: ";" }
                    )
    
        const result = await fetch(...list.filter(place => place.Alias === alias.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
                .map(place =>{
                               
                    switch (type) {
                        case "cities": return `${config.api.localidades.cities}${place.Code}`
                        case "microregions": return `${config.api.localidades.microregions}${place.Code}`
                        case "intermediary": return `${config.api.localidades.intermediary}${place.Code}`
                        case "middleregions": return `${config.api.localidades.middleregions}${place.Code}`
                        case "states": return `${config.api.localidades.states}${place.Code}`
                        case "immediate": return `${config.api.localidades.immediate}${place.Code}`
                    }

                } ))

        return( await JSON.parse(await result.text()) )
    
} 
// implementar trycatch
async function belongsToMany (request) {

    let type
    let aliases =[]

    if(typeof request !== "object") {
        let partial = JSON.parse(request)
        type = partial.type
        aliases = partial.aliases
    } else {
        type = request.type
        aliases = request.aliases
    }

    let url
    let code
    let doubles_url
    let base_url
    let doubles_results = []
    let place_codes = []
    let unique_codes = []
    let metaInfos

    // defining the url that will get the double list
    switch (type) {
        case "microregions":
            doubles_url = config.lists.doubles.microregions
            break
        case "immediate":
            doubles_url = config.lists.doubles.immediate
            break
        case "cities":
            doubles_url = config.lists.doubles.cities
            break
    }

    switch(type) {
        case "country": 
            url = config.lists.main.country
            break
        case "macroregion": 
            url = config.lists.main.macroregion
            break
        case "states": 
            url = config.lists.main.states
            break
        case "middleregions": 
            url = config.lists.main.middleregions
            break
        case "immediate": 
            url = config.lists.main.immediate
            break
        case "microregions": 
            url = config.lists.main.microregions
            break
        case "intermediary": 
            url = config.lists.main.intermediary
            break
        case "cities": 
            url = config.lists.main.cities
            break
    }

    if (type === "microregions" || type === "cities" || type === "immediate") {
            
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
                console.log("Existem nomes repetidos nessa categoria geográfica, experimente trocar para:\n")
                doubles_results.flat().map(i => console.log(String(i)))   
                return      
            }

        }

         // in case of macroregion or states the method GET will be called once. For all others the call could vary from 1 to 27.
         if (type === "macroregion" || type === "states") {
            
            switch(type) {
                case "macroregion": 
                    base_url = config.api.localidades.macroregion
                    break
                case "states": 
                    base_url = config.api.localidades.states
                    break
            
                }

            const states_json = JSON.parse(await (await fetch(base_url)).text())
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
                        .map(place => place.Code)).flat()
                result.map(i => place_codes.push(i.toString().substring(0, 2)))
                unique_codes = [...new Set(place_codes)]
                metaInfos = [...result.map(i => states_json.filter(o => o.id === eval(i)) ).flat()]
                return (metaInfos)
                    
            } else {
    
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
            
                    result.map(i => place_codes.push(i.toString().substring(0, 2)))
                
                    unique_codes = [...new Set(place_codes)]
                
                    const major_polygons = await Promise.all( unique_codes.map( async (i) => {
        
                        code = eval(i)
                        
                        // defining the url that will get the polygons
                        switch(type) {
                            case "middleregions": 
                                base_url = `${config.api.localidades.states}${code}/mesorregioes`
                                break
                            case "intermediary":
                                base_url = `${config.api.localidades.states}${code}/regioes-intermediarias`
                                break
                            case "immediate":
                                base_url = `${config.api.localidades.states}${code}/regioes-imediatas`
                                break
                            case "microregions": 
                                base_url = `${config.api.localidades.states}${code}/microrregioes`
                                break
                            case "cities": 
                                base_url = `${config.api.localidades.states}${code}/municipios`
                                break
                        }
                    
                        
                        return JSON.parse( await (await fetch(base_url)).text() )
                        
                    })
                )
                                
                metaInfos = [...result.map(i => major_polygons.map(o=> o.filter(u => u.id === eval(i)) )).flat().flat()]

                return (metaInfos)
            
        }
}

async function getOnePolygon (alias, type) {
    
    if(!alias | !type) throw 'some parameters was not fulfilled'
    if( typeof(alias)!=="string"  | typeof(type)!=="string" ) throw 'the parameters must be string'

    let url
    let doubles_url
    let polygon

    // defining the url that will get the double list
    switch (type) {
        case "microregions":
            doubles_url = config.lists.doubles.microregions
            break
        case "immediate":
            doubles_url = config.lists.doubles.immediate
            break
        case "cities":
            doubles_url = config.lists.doubles.cities
            break
    }

    // defining the url that will get the alias list
    switch(type) {
        case "country": 
            url = config.lists.main.country
            break
        case "macroregion": 
            url = config.lists.main.macroregion
            break
        case "states": 
            url = config.lists.main.states
            break
        case "middleregions": 
            url = config.lists.main.middleregions
            break
        case "immediate": 
            url = config.lists.main.immediate
            break
        case "microregions": 
            url = config.lists.main.microregions
            break
        case "intermediary": 
            url = config.lists.main.intermediary
            break
        case "cities": 
            url = config.lists.main.cities
            break
    }


    try {

        // check if there is any doubled names in microregions or cities
        if (type === "microregions" || type === "cities" || type === "immediate") {
            
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
                    console.log("Existem nomes repetidos nessa categoria geográfica, experimente trocar para:\n")
                    doubles.flat().map(i => console.log(String(i)))   
                    return            
                }      
        }

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

        return(polygon)

    } catch (error) {
        console.log(error.message)
        return
    }
}

async function getManyPolygons (request) {

    if(!request) throw 'the request was not fulfilled'
    
    let type
    let aliases =[]

    if(typeof request !== "object") {
        let partial = JSON.parse(request)
        type = partial.type
        aliases = partial.aliases
    } else {
        type = request.type
        aliases = request.aliases
    }
    
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
            doubles_url = config.lists.doubles.microregions
            break
        case "cities":
            doubles_url = config.lists.doubles.cities
            break
    }


    // defining the url that will get the alias list
    switch(type) {
        case "country": 
            url = config.lists.main.country
            break
        case "macroregion": 
            url = config.lists.main.macroregion
            break
        case "states": 
            url = config.lists.main.states
            break
        case "middleregions": 
            url = config.lists.main.middleregions
            break
        case "microregions": 
            url = config.lists.main.microregions
            break
        case "cities": 
            url = config.lists.main.cities
            break
    }
    
    
        try {  
            // check if there is any doubled names in microregions or cities
            if (type === "microregions" || type === "cities" ) {
        
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
                console.log("Existem nomes repetidos nessa categoria geográfica, experimente trocar para:\n")
                doubles_results.flat().map(i => console.log(String(i)))   
                return      
            }     
        }


            // in case of macroregion or states the method GET will be called once. For all others the call could vary from 1 to 27.
            if (type === "macroregion" || type === "states") {
                switch(type) {
                    case "macroregion": 
                        base_url = `${config.api.malhas.country}&intrarregiao=regiao`
                        break
                    case "states": 
                        base_url = `${config.api.malhas.country}&intrarregiao=UF`
                        break
                }
        
            const states_json = JSON.parse(await (await fetch(base_url)).text())
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
                    .map(place => place.Code)).flat()
            result.map(i => place_codes.push(i.toString().substring(0, 2)))
            unique_codes = [...new Set(place_codes)]
            polygons = [...result.map(i => states_json.features.filter(o => o.properties.codarea === i) ).flat()]
            return (polygons)
        } else {
    
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
                    case "middleregions": 
                        base_url = `${config.api.malhas.states}${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=mesorregiao`
                        break
                    case "microregions": 
                        base_url = `${config.api.malhas.states}${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=microrregiao`
                        break
                    case "cities": 
                        base_url = `${config.api.malhas.states}${code}?formato=application/vnd.geo+json&qualidade=maxima&intrarregiao=municipio`
                        break
                }
            
                
                return JSON.parse( await (await fetch(base_url)).text() )
                
            })
        )
                      
        polygons = [...result.map(i => major_polygons.map(o=> o.features.filter(u => u.properties.codarea === i) )).flat().flat()]
        
        return(polygons)
    
      }
            
  } catch (error) {
        console.log(error.message)
        return
    }

}

export {
    getOnePolygon,
    getManyPolygons,
    belongsTo,
    belongsToMany
}

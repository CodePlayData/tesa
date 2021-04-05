/* 

These functions are made for Geocoding.

The Geocoding process is highly dependent to the Map Tiles server. As for Brazil we can use the World Map in Nominatim/OpenStreetMap or setup a private server for the whole country and for each MacroRegion (Sudeste, Sul, Norte, Nordeste, Centro-Oeste), the functions in this section need a config object that can deal with these options.  


*/

import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'

async function forwardGeocoding ( config , location) {
  
  let { map_tiles } = config

  if (Array.isArray(map_tiles)) {
   
    let url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/states_list.csv"

    const list = 
            await parseCsv(
                await (
                    await fetch(url))
                    .text(), { skipFirstRow: true, separator: ";" }
                    )
    

    const result = 
        list.filter(place => place.Alias === location.state
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ""))[0].Subset

    map_tiles.map(server => server.filter(i => i.name === result)).flat()
    
    console.log(result)
    
  } else {
    
    let { request } = config
    let { name, url } = map_tiles
    
    if (request === "unstructured") {  
      console.log(`Requesting to ${ name } a unstructured query...`)
      return( await JSON.parse(await (await fetch ( `${ url }/search?q=${ location }&format=geojson`)).text()))
    } else {
      
      let { housenumber, street, city, state } = location
      
      console.log(`Requesting to ${ name } a structured query...`)
      return( await JSON.parse(await (await fetch ( `${ url }/search?street=${housenumber} ${street}&city=${city}&state=${state}&country=Brazil&format=geojson`)).text()))
    
    }
  }

}


export {
  forwardGeocoding
}
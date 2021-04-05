/* 

These functions are made for Geocoding.

The Geocoding process is highly dependent to the Map Tiles server. As for Brazil we can use the World Map in Nominatim/OpenStreetMap or setup a private server for the whole country and for each MacroRegion (Sudeste, Sul, Norte, Nordeste, Centro-Oeste), the functions in this section need a config object that can deal with these options.

Make sure the name of the subsets server is the name of the MacroRegion. 

Obviously, the reverse geocoding map only works for the whole country since beforehand you don't know witch states belongs the lat and lon code. However, you can select the private server or lets the nominatim one. 

ToDo: pass all non-package links as config.json file in root.

*/

import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'

async function forwardGeocoding ( config , location ) {
  
  let { map_tiles } = config

  if (Array.isArray(map_tiles)) {
   
    let list_url = "https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/states_list.csv"
    let { housenumber, street, city, state } = location

    const list = 
            await parseCsv(
                await (
                    await fetch(list_url))
                    .text(), { skipFirstRow: true, separator: ";" }
                    )
    

    let result =
        map_tiles.filter(server => server.name === 
            list.filter(place => place.Alias === location.state
              .toUpperCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, ""))[0].Subset)[0]
    
    console.log(`Requesting to ${ result.name } a structured query...`)
    return( await JSON.parse(await (await fetch ( `${ result.url }/search?street=${housenumber} ${street}&city=${city}&state=${state}&country=Brazil&format=geojson`)).text()))
    
  } else {
    
    let { request } = config
    let { name } = map_tiles
    let url = map_tiles.url  || "https://nominatim.openstreetmap.org"

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

async function reverseGeocoding ( config, location ) {
  
  let url = config.map_tiles.url  || "https://nominatim.openstreetmap.org"
  let { lat, lon } = location

  return( await JSON.parse(await (await fetch ( `${ url }/reverse?format=geojson&lat=${ lat }&lon=${ lon }`)).text()) )

}



export {
  forwardGeocoding,
  reverseGeocoding
}
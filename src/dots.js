/* 

These functions are made for Geocoding.

The Geocoding process is highly dependent to the Map Tiles server. As for Brazil we can use the World Map in Nominatim/OpenStreetMap or setup a private server for the whole country and for each MacroRegion (Sudeste, Sul, Norte, Nordeste, Centro-Oeste), the functions in this section need a layout object that can deal with these options.

Make sure the name of the subsets server is the name of the MacroRegion. 

Obviously, the reverse geocoding map only works for the whole country since beforehand you don't know witch states belongs the lat and lon code. However, you can select the private server or lets the nominatim one. 

*/

import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'

const config = JSON.parse(await Deno.readTextFile('config.json'))

// implementar trycatch
async function forwardGeocoding ( layout , location ) {
  
    let map_tiles
    let partial
    let request

    if(typeof layout !== "object") {
        partial = JSON.parse(layout)
        map_tiles = partial.map_tiles
    } else {
        map_tiles = layout.map_tiles
    }
    
  if (Array.isArray(map_tiles)) {
   
    let list_url = config.lists.main.states
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
    
    if(typeof layout !== "object") {
      request = partial.request
    } else {
      request = layout.request
      }

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
// implementar trycatch
async function reverseGeocoding ( layout, location ) {
  
  let lat
  let lon
  let map_tiles
  let partial
  let partial2

  if(typeof layout !== "object") {
    partial = JSON.parse(layout)
    partial2 = JSON.parse(location)
    map_tiles = partial.map_tiles
    lat = partial2.lat
    lon = partial2.lon
  } else {
    map_tiles = layout.map_tiles
    lat = location.lat
    lon = location.lon
  }

  let url = map_tiles.url  || "https://nominatim.openstreetmap.org"

  return( await JSON.parse(await (await fetch ( `${ url }/reverse?format=geojson&lat=${ lat }&lon=${ lon }`)).text()) )

}



export {
  forwardGeocoding,
  reverseGeocoding
}
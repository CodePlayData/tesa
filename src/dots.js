/* 

These functions are made for Geocoding.

The Geocoding process is highly dependent to the Map Tiles server. As for Brazil we can use the World Map in Nominatim/OpenStreetMap or setup a private server for the whole country and for each MacroRegion (Sudeste, Sul, Norte, Nordeste, Centro-Oeste), the functions in this section need a config object that can deal with these options.  

let config = {
  request: "unstructured", 
  map_tiles: { 
    name: "aaa", 
    url: "http://... " 
  }
}

let config_2 = {
  request: [ "state", "city", "number", "address" ],
  map_tiles: [
    {
      name: "Sudeste",
      tag: "Sudeste",
      url: "http://..."
    },
    {
      name: "nordeste",
      tag: "Nordeste",
      url: "http://..."
    }
  ]
}

*/

function forwardGeocoding ( config , location) {
  
  if (Array.isArray(config.map_tiles)) {
  
    
    if (config.request === "unstructured") {
      
      console.log('unstructured')
    
    } else {
      
      console.log('...')
    
    }
    
    console.log('array')

    
  } else {
    

    if (config.request === "unstructured") {
      
      console.log('unstructured')
    
    } else {
      
      console.log('...')
    
    }
    
    console.log('not array')

  }


}


export {
  forwardGeocoding
}
import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'

async function getCountryPolygon (alias) {
    
    const fetched_data = fetch("https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/country_list.csv")
    const raw_data = await fetched_data
    const raw_table = await raw_data.text()
    const country_list = await parseCsv(raw_table, { skipFirstRow: true, separator: ";" })
    const result = fetch(...country_list.filter(place => place.Alias === alias).map(place => place.Link)) 

    let polygon
    
    polygon = await (await result).json()
    console.log(polygon)

}

async function getMacroregionPolygon (alias) {
    
    const fetched_data = fetch("https://raw.githubusercontent.com/CodePlayData/tesa/main/src/data/macroregion_list.csv")
    const raw_data = await fetched_data
    const raw_table = await raw_data.text()
    const country_list = await parseCsv(raw_table, { skipFirstRow: true, separator: ";" })
    const result = fetch(...country_list.filter(place => place.Alias === alias).map(place => place.Link)) 

    let polygon
    
    polygon = await (await result).json()
    console.log(polygon)

}



getCountryPolygon('BR')
getMacroregionPolygon('centro-oeste')
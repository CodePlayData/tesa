import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'

self.onmessage = async (e) => {
  try {
    const { filename, alias } = e.data;
    const content = await parseCsv(await Deno.readTextFile(filename), { skipFirstRow: true, separator: ";" })
    const encoder = new TextEncoder()
    let result = []
    let data
    
    result.push(...content.filter(place => place.Alias === alias).map(place => place.Link))
    
    data = encoder.encode(...result);
    await Deno.writeFile("teste.txt", data)
    
  self.postMessage({filename: "./teste.txt"})

  } catch (error) {
    console.log(error.message)
  }   
  self.close()
}

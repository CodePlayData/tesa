import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'

self.onmessage = async (e) => {
  try {
    const { filename, alias } = e.data;
    const content = await parseCsv(await Deno.readTextFile(filename), { skipFirstRow: true, separator: ";" })
    const str2ab = (str) => {  
      let buffer = new Uint16Array(str.length)   
      for(let idx = 0, len = str.length; idx < len; ++idx) { buffer[idx] = str.charCodeAt(idx) }     
      return buffer
    }

    let result = []
    let bufferedResult
    result.push(...content.filter(place => place.Alias === alias).map(place => place.Link))
    bufferedResult = str2ab(...result)
    postMessage([bufferedResult])
  } catch (error) {
    console.log(error.message)
  }   
  self.close()
}

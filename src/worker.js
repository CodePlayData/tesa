import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'

self.onmessage = async (e) => {
    const { filename, alias, type } = e.data;
    const content = await parseCsv(await Deno.readTextFile(filename), { skipFirstRow: true, separator: ";" }),
		result = content.filter(place => place.Alias === alias).map(place => place.Link)
    
	console.log({ "alias": alias, "type": type, "result": result })
    self.close()
  }

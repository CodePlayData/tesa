import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'

self.onmessage = async (e) => {
    const { filename, alias } = e.data;
    const result = await parseCsv(await Deno.readTextFile(filename), { skipFirstRow: true, separator: ";" })
    postMessage(result.filter(place => place.Alias === alias).map(place => place.Link))
    self.close()
  };
import { parse as parseCsv } from 'https://deno.land/std@0.82.0/encoding/csv.ts'

onmessage = async (e) => {
    const 
        { filename } = e.data,
        content = await parseCsv(await Deno.readTextFile(filename), { skipFirstRow: true })
        
    setInterval(() => {
        postMessage(content)
        self.close()
    }, 5000)
  }


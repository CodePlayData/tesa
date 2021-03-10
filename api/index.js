import { app } from './app.js';
import "https://deno.land/x/dotenv/load.ts"

const port = Deno.env.get('PORT_SIGNIN')

app.addEventListener("listen", ({ hostname, port, secure }) => { console.log( `Listening on: ${secure ? "https://" : "http://"}${hostname ?? "localhost"}:${port}`) })

await app.listen({ port: eval(port) })

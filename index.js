import { app } from './src/app.js';
import "https://deno.land/x/dotenv/load.ts"

// deno gets the env value like string, even if it's a number. To get things work would need to eval() it's content
const port = Deno.env.get('PORT_SIGNIN') || 2000

// adding a event listerner to the console log stays binds to the success of the listen function
app.addEventListener("listen", ({ hostname, port, secure }) => { console.log( `Listening on: ${secure ? "https://" : "http://"}${hostname ?? "localhost"}:${port}`) })

// starting the serve and, like said before, eval the env variable.
await app.listen({ port: eval(port) })

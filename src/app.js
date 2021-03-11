import { Application } from "https://deno.land/x/oak/mod.ts"
import { organ } from "https://raw.githubusercontent.com/denjucks/organ/master/mod.ts"
import { oakCors } from "https://deno.land/x/cors/mod.ts"
import { router } from "./routes.js";

// instancing the Oak app
const app = new Application()

// in this app we will use a router, permit all methods available in this router, reporting all logs in console with organ/morgan and enable Cors.
app
    .use(router.routes())
    .use(router.allowedMethods())
    .use(organ('dev', true))
    .use(oakCors())
    .use((ctx) => { ctx.response.body = "The app is running!" })

// exporting the Oak app to index.js
export {
    app
}
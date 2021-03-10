import { Application } from "https://deno.land/x/oak/mod.ts"
import { organ } from "https://raw.githubusercontent.com/denjucks/organ/master/mod.ts"
import { oakCors } from "https://deno.land/x/cors/mod.ts"
import { router } from "./routes.js";

const app = new Application()


app
    .use(router.routes())
    .use(router.allowedMethods())
    .use(organ('dev', true))
    .use(oakCors())
    .use((ctx) => { ctx.response.body = "Hello World!" })

export {
    app
}
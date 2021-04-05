import { parse } from "https://deno.land/std/flags/mod.ts";

function main(args) {
  
    const { type, name, not, help, _: [dir = "."] } = parse(args)

    console.log({ type, name, not, help, dir })

}

main(Deno.args)
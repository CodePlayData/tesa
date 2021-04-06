import { parse } from "https://deno.land/std/flags/mod.ts"
import { createHash } from "https://deno.land/std@0.92.0/hash/mod.ts"

import { getOnePolygon, getManyPolygons, belongsTo, belongsToMany, forwardGeocoding, reverseGeocoding } from './mod.js'

async function tesa (args) {
    
    let params = parse(args)
    let call = params._[0]
    let { output } = params
    let cached = false
    let cachedFiles = []
    let hash = createHash("md5")


    for await (let dirEntry of Deno.readDir('.')) {
        if (dirEntry.isDirectory && dirEntry.name === ".cache") {
            cached = true
          }
      }
    
    if(cached) {
        for await (let dirEntry of Deno.readDir('./.cache')) {
            if (dirEntry.isFile) {
                cachedFiles.push(dirEntry.name)
              }
          }
    }

    switch (call) {

        case 'getOnePolygon': {

            if(!params.alias | !params.type) throw 'some parameter was not fulfilled'
            if(output !== "console" && output !== "file") throw 'You must choose some type of output (options: console or file)'

            hash.update(`polygon${ params.type }${ params.alias }`)
            let hashInHex = hash.toString()
            
            switch (output) {
                case "file": {
                    if(!cached) {
                        Deno.chdir(Deno.cwd())
                        Deno.mkdir('./.cache')
                        Deno.writeTextFile(`./.cache/${ hashInHex }.json`, JSON.stringify(await getOnePolygon(params.alias, params.type)))
                    } else {
                        let result = cachedFiles.filter(file => file === `${hashInHex}.json`)
                        if(result.length>0) {
                            console.log(`\nYour file already exists in: ./.cache/${ result }`)
                        } else {
                            Deno.chdir(Deno.cwd())
                            Deno.writeTextFile(`./.cache/${ hashInHex }.json`, JSON.stringify(await getOnePolygon(params.alias, params.type)))
                        }
                    }
                }
                break
                case "console": {
                    if(!cached) {
                        console.log(JSON.stringify(await getOnePolygon(params.alias, params.type)))
                    } else {
                        let result = cachedFiles.filter(file => file === `${hashInHex}.json`)
                        if(result.length>0) {
                            console.log(await Deno.readTextFile(`./.cache/${result}`))
                        } else {
                            console.log(JSON.stringify(await getOnePolygon(params.alias, params.type)))
                        }
                    }
                }
                break
            }
        }
            break
        case 'getManyPolygons': {

            if(!params.request) throw 'some parameter was not fulfilled'
            if(output !== "console" && output !== "file") throw 'You must choose some type of output (options: console or file)'
            
            hash.update(`polygons${ params.request.type }${ params.request.aliases }`)
            let hashInHex = hash.toString()
            let { request } = params

            switch (output) {
                case "file": {
                    if(!cached) {
                        Deno.chdir(Deno.cwd())
                        Deno.mkdir('./.cache')
                        Deno.writeTextFile(`./.cache/${ hashInHex }.json`, JSON.stringify(await getManyPolygons(request)))
                    } else {
                        let result = cachedFiles.filter(file => file === `${hashInHex}.json`)
                        if(result.length>0) {
                            console.log(`\nYour file already exists in: ./.cache/${ result }`)
                        } else {
                            Deno.chdir(Deno.cwd())
                            Deno.writeTextFile(`./.cache/${ hashInHex }.json`, JSON.stringify(await getManyPolygons(request)))
                        }
                    }
                }
                break
                case "console": {
                    if(!cached) {
                        console.log(JSON.stringify(await getManyPolygons(params.request)))
                    } else {
                        let result = cachedFiles.filter(file => file === `${hashInHex}.json`)
                        if(result.length>0) {
                            console.log(await Deno.readTextFile(`./.cache/${result}`))
                        } else {
                            console.log(JSON.stringify(await getManyPolygons(params.request)))
                        }
                    }
                }
                break
            }
        }          
            break
        case 'belongsTo':
            if(!params.alias | !params.type) throw 'some parameter was not fulfilled'
            if (mode === "console") console.log(JSON.stringify(await belongsTo(params.alias, params.type)))
            break
        case 'belongsToMany':
            if(!params.request) throw 'some parameter was not fulfilled'
            if (mode === "console") console.log(JSON.stringify(await belongsToMany(params.request)))
            break
        case 'forwardGeocoding':
            if(!params.layout | !params.location) throw 'some parameter was not fulfilled'
            if (mode === "console") console.log(JSON.stringify(await forwardGeocoding(params.layout, params.location)))
            break
        case 'reverseGeocoding':
            if(!params.layout | !params.location) throw 'some parameter was not fulfilled'
            if (mode === "console") console.log(JSON.stringify(await reverseGeocoding(params.layout, params.location)))
            break
        default: throw 'The Call is required as first parameter.'
    }

}

tesa(Deno.args)




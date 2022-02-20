/*

These functions are made to improve the implemetation and storage. 

You may ask, "why is that?". It's simple, this can be stored as a single document in [MongoDB](https://docs.mongodb.com/manual/reference/geojson/), wich means that your colletion can have multiple maps, about any subject, at limit of 16MB (which is a lot!).
Another advantage is that you can parse this file and all layers that you need, as well as data to show in map, is in that.


*/

import { belongsTo, getOnePolygon, belongsToMany, getManyPolygons } from './polygons.ts'

async function hierarchicalOrdering(request) {

    const getByArray = async () => {
        let cities = request.map(i => i.city)
        let order = await belongsToMany(
            {
                type: "cities", 
                aliases: [...new Set(cities)]
            }
        )
        let city = (await getManyPolygons(
            {
                type: "cities", 
                aliases: [...new Set(cities)]
            }
        )).map(i => i.geometry)

        let microregion = (await getManyPolygons(
            {
                type: "microregions", 
                aliases: [...order.map(i => i.microrregiao.nome)]
            }
        )).map(i => i.geometry)
        
        let middleregion = (await getManyPolygons(
            {
                type: "middleregions", 
                aliases: [...order.map(i => i.microrregiao.mesorregiao.nome)]
            }
        )).map(i => i.geometry)
        
        let state = (await getManyPolygons(
            {
                type: "states", 
                aliases: [...order.map(i => i.microrregiao.mesorregiao.UF.nome)]
            }
        )).map(i => i.geometry)

        let location = request.map(i => i.geometry)

        let map = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    properties: {
                        polygon: {   
                            state: [...order.map(i => i.microrregiao.mesorregiao.UF.name)],
                            midleregion: [...order.map(i => i.microrregiao.mesorregiao.name)],
                            microregion: [...order.map(i => i.microrregiao.name)],
                            city: [...order.map(i => i.name)]
                        },
                        point: [ ...request.map(i => {
                            return {
                                street: i.street,
                                number: i.number
                                } 
                            })
                        ]
                    },
                    geometry: [
                        {
                            type: "GeometryCollection",
                            geometries: [
                                {
                                    type: "MultiPolygon",
                                    coordinates: [...state ]
                                },
                                {
                                    type: "MultiPolygon",
                                    coordinates: [...middleregion]
                                },
                                {
                                    type: "MultiPolygon",
                                    coordinates: [...microregion]
                                },
                                {
                                    type: "MultiPolygon",
                                    coordinates: [...city]
                                },
                                {
                                    type: "MultiPoint",
                                    coordinates: location
                                }
                            ]
                        }
                    ]
                }
            ] 
        }
        return map
    }

    const getByObject = async () => {
        let order = await belongsTo(request.city, 'cities')
        let city = await (await getOnePolygon(order.nome, 'cities')).features[0].geometry
        let microregion = await (await getOnePolygon(order.microrregiao.nome, 'microregions')).features[0].geometry
        let middleregion = await (await getOnePolygon(order.microrregiao.mesorregiao.nome, 'middleregions')).features[0].geometry
        let state = await (await getOnePolygon(order.microrregiao.mesorregiao.UF.nome, 'states')).features[0].geometry
        let location = {
            type: "Point",
            coordinates: [
                request.geometry[0],
                request.geometry[1]
            ]
        }
        let map = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    properties: {
                        polygon: {
                            state: order.microrregiao.mesorregiao.UF.nome,
                            midleregion: order.microrregiao.mesorregiao.nome,
                            microregion: order.microrregiao.nome,
                            city: order.nome
                        },
                        point: [
                            {
                                street: request.street,
                                number: request.number
                            }
                        ]
                    },
                    geometry: [
                        {
                            type: "GeometryCollection",
                            geometries: [
                                state,
                                middleregion,
                                microregion,
                                city, 
                                location
                            ]
                        }
                    ]
                }
            ] 
        }
        return map
    }

    if(Array.isArray(request)) {
        return await getByArray()
    } else {
        return await getByObject()
    }
}

export { hierarchicalOrdering }
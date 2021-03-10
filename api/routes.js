import { Router } from 'https://deno.land/x/oak/mod.ts'
import { getPlace, postDataset, getAllDatasets, getOneDataset, updateOneDataset, deleteOneDataset, deleteAllDatasets } from './controllers.js';

const router = new Router()

router
    //Querying in the URI a place. Intendent to get a polygon of one single place.
    .get('/place/:type/:alias', getPlace)
    /* These endpoints are made for data-scientists who wanted to post their datasets directly and let that the API extract the polygons that should ask for. The logic is simples, if you put a dataset the API must store in a JSON these polygons. To recover that JSON object the data-scientist should ask in the route /dataset/:id the method GET. All objects returned by API contains metadata and a status property that indicates if they are **wainting** for authorization, if the **converting** is processing or if is already **done**. The method GET in the route /dataset returns only the metadata of each dataset stored in the API and their status.
    To change the status of a dataset object some kind of authorization midlleware is required (like payment microservice).
    To access the API some authentication service must exists because the data persistence is identified by user. */
    .post('/dataset', postDataset)
    .get('/dataset', getAllDatasets)
    .get('/dataset/:id', getOneDataset)
    .put('dataset/:id', updateOneDataset)
    .delete('/dataset/:id', deleteOneDataset)
    .delete('/dataset', deleteAllDatasets)

export {
    router
}
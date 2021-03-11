// all the application logic must be here.
const 
    getPlace = ({ params, response }) => {
        
        const 
            { type, alias } = params,
            worker = new Worker(new URL("./worker.js", import.meta.url).href, { type: "module", deno: { namespace: true } })
            worker.postMessage({ 
                filename: "./src/data/" + type + "_list.csv",
                alias: alias
            })
            worker.onmessage = (e, response) => console.log(...e.data)
        
        response.body = {
            "type": type,
            "alias": alias
        }
    
    },
    postDataset = (ctx) => {
        ctx.response.body = "postDataset"
    },
    getAllDatasets = (ctx) => {
        ctx.response.body = "getAllDatasets"
    },
    getOneDataset = (ctx) => {
        ctx.response.body = "getOneDataset"
    },
    updateOneDataset = (ctx) => {
        ctx.response.body = "updateOneDataset"
    },
    deleteOneDataset = (ctx) => {
        ctx.response.body = "deleteOneDataset"
    },
    deleteAllDatasets = (ctx) => {
        ctx.response.body = "deleteAllDatasets"
    }

export {
    getPlace,
    postDataset,
    getAllDatasets,
    getOneDataset,
    updateOneDataset,
    deleteOneDataset,
    deleteAllDatasets
}
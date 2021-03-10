const 
    getPlace = (ctx) => {
        const 
            { type, alias } = ctx.params,
            worker = new Worker(new URL("./worker.js", import.meta.url).href, { type: "module", deno: { namespace: true } })
            worker.postMessage({ filename: "./alias_list.csv" })
            
        ctx.response.body = {
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
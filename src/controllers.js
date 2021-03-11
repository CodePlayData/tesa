// all the application logic must be here.
const 
    getPlace = ({ params, response }) => {
        
        let 
            { type, alias } = params,
            worker = new Worker(new URL("./worker.js", import.meta.url).href, { type: "module", deno: { namespace: true } })
        
	worker.postMessage({filename: "./" + type + "_list.csv", type, alias})
  
	    worker.addEventListener('message', (event, response) => console.log(event.data))

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

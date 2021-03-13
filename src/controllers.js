// all the application logic must be here.
const 
    getPlace = async ({ params, response }) => {
        
        let { type, alias } = params
        let worker = new Worker(new URL("./worker.js", import.meta.url).href, { type: "module", deno: { namespace: true } })
        let data
	
	const decoder = new TextDecoder("utf-8")
	
	worker.postMessage({ filename: "./" + type + "_list.csv", type, alias })
	    
	await worker.onMessage = async (e) => ( response.body = await decoder.decode(await Deno.readFile(e.data.filename)) )
	
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

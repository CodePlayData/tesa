// all the application logic must be here.
const 
    getPlace = async ({ params, response }) => {
        
        let { type, alias } = params
        let worker = new Worker(new URL("./worker.js", import.meta.url).href, { type: "module", deno: { namespace: true } })
        
	    await  worker.addEventListener('message',  async (e) => {console.log(e.data)})
        
        const sendToWork = (worker, type, alias) => {
                worker.postMessage({ filename: "./" + type + "_list.csv", type, alias })
                console.log('\nData is already in the worker\n')
        }
        
        sendToWork(worker,type,alias)

	    const decoder = new TextDecoder("utf-8");
        const data = await Deno.readFile("teste.txt")
	response.body = decoder.decode(data)
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

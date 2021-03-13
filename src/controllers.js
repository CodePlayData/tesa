// all the application logic must be here.
const 
    getPlace = ({ params, response }) => {
        
        let { type, alias } = params
        let worker = new Worker(new URL("./worker.js", import.meta.url).href, { type: "module", deno: { namespace: true } })
        
        worker.addEventListener('message',  async (e) => {
            const ab2str = (buff) => {
                let arr = new Uint16Array(buff)
                let retVal = ""            
                for(var idx = 0, len = arr.length; idx < len; idx += 65535){
                    if(idx + 65535 > len){
                        retVal += String.fromCharCode.apply(null, arr.subarray(idx, idx + (len - idx)))
                    }
                    else{
                        retVal += String.fromCharCode.apply(null, arr.subarray(idx, idx + 65535))
                    }
                }         
                return retVal
            }  

            let result = await Promise.resolve(
                ab2str(Object.values(...e.data))
            )
            console.log(result)
        })

        const sendToWork = (worker, type, alias) => {
                worker.postMessage({ filename: "./src/data/" + type + "_list.csv", type, alias })
                console.log('\nData is already in the worker\n')
        }
        
        sendToWork(worker,type,alias)
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

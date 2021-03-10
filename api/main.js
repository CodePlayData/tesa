const workers = 1

    for (let index = 0; index < workers; index++) { 
        let worker = new Worker(new URL("worker.js", import.meta.url).href, { type: "module", deno: true })
        worker.postMessage({ filename: "./alias_list.csv" })
        worker.onmessage = e => console.log(e.data)
    }
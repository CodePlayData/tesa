const 
    getLocation = (ctx) => {
        ctx.response.body = "getLocation"
    },
    getOrderReponse = (ctx) => {
        ctx.response.body = "getOrderReponse"
    },
    postOrder = (ctx) => {
        ctx.response.body = "postOrder"
    },
    updateOrder = (ctx) => {
        ctx.response.body = "updateOrder"
    },
    deleteOrder = (ctx) => {
        ctx.response.body = "deleteOrder"
    }

export {
    getLocation,
    getOrderReponse,
    postOrder,
    updateOrder,
    deleteOrder
}
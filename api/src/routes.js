import { Router } from 'https://deno.land/x/oak/mod.ts'
import { getLocation, getOrderReponse, postOrder, updateOrder, deleteOrder } from './controllers.js';

const router = new Router()

router
    .get('/location', getLocation)
    .get('/order/:id', getOrderReponse)
    .post('/order', postOrder)
    .put('order/:id', updateOrder)
    .delete('order/:id', deleteOrder)

export {
    router
}
import {Router} from 'express';
import {CartController} from '../controllers/cartController';

export class CartRoutes{

    public router: Router;
    public cartController = new CartController();
    constructor() {
        this.router = Router();
        this.routers();
    }

    routers(){
        this.router.post('/', this.cartController.addItemToCart);
        this.router.post('/checkout', this.cartController.checkout);
        this.router.get('/:userId', this.cartController.viewCart);
        this.router.put('/:userId/checkout', this.cartController.removeItemFromCart);
    }
}
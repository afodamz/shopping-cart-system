import {Router} from 'express';
import ProductController from '../controllers/productController';

export class ProductRoutes{

    public router: Router;
    public productController = new ProductController();
    constructor() {
        this.router = Router();
        this.routers();
    }

    routers(){
        this.router.get('/', this.productController.getProducts);
        this.router.get('/:id', this.productController.getProductById);
        this.router.post('/', this.productController.createProduct);
        this.router.put('/:id', this.productController.updateProduct);
    }
}
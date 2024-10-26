import { Request, Response } from 'express';
import Cart, { ICart, ICartItem } from '../models/cart';
import Product from '../models/product';
import { plainToInstance } from 'class-transformer';
import { validate, validateOrReject } from 'class-validator';
import { CheckoutDto } from '../dtos/checkout.dto';
import RedisClient from '../config/redisClient';
import Redlock from 'redlock';
import { ClientSession, ObjectId, Types } from 'mongoose';
import { errorResponse, successResponse } from '../dtos/response.dto';
import { AddToCartDto, CartProductResponseDto, CartResponseDto, RemoveFromCartDto } from '../dtos/cart.dto';

const redisClient = RedisClient.getInstance().getClient();
const redlock = new Redlock(
    [redisClient],
    {
        retryCount: 5,
        retryDelay: 200,
        retryJitter: 100
    }
);

export class CartController {
    redisClient: RedisClient;
    private redlock: Redlock;

    constructor() {
        this.redisClient = RedisClient.getInstance();
        this.redlock = redlock;
    }
    private redisKey(userId: string): string {
        return `cart:${userId}`;
    }

    addItemToCart = async (req: Request, res: Response): Promise<void> => {
        const addToCartDto = plainToInstance(AddToCartDto, req.body);
        try {
            await validateOrReject(addToCartDto);
            const { userId, productId, quantity } = req.body;
            const redisKey = this.redisKey(userId);

            const product = await Product.findById(productId);
            if (!product) {
                errorResponse(res, 'Product not found', 'Product not found', 400)
                return;
            }
            if (product.stock < quantity) {
                errorResponse(res, 'Insufficient stock', 'Insufficient stock', 400)
                return;
            }

            let cartData = await this.redisClient.get(redisKey);
            let cart = cartData ? new Cart(JSON.parse(cartData)) : await Cart.findOne({ userId });

            if (!cart) {
                // If no cart exists, retrieve from DB or create new in MongoDB
                cart = new Cart({ userId, products: [] });
            }
    
            // Update the quantity if the product exists in cart, or add a new product entry
            const existingItem = cart.products.find(item => item.productId.equals(productId));
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.products.push({ productId: new Types.ObjectId(productId), quantity });
            }
    
            // Save cart to MongoDB and cache updated cart in Redis
            await cart.save();
            await this.redisClient.set(redisKey, JSON.stringify(cart));
            successResponse(res, cart, 'Item added to cart', 201);
        } catch (err) {
            errorResponse(res, err);
        }
    };

    removeItemFromCart = async (req: Request, res: Response): Promise<void> => {
        const removeFromCartDto = plainToInstance(RemoveFromCartDto, req.body);

        try {
            await validateOrReject(removeFromCartDto);
            const { productId } = removeFromCartDto;
            const { userId } = req.params;
            const redisKey = this.redisKey(userId);
            // Find the user's cart
            let cartData = await this.redisClient.get(redisKey);

            const cart: ICart = cartData ? JSON.parse(cartData) : await Cart.findOne({ userId });

            if (!cart) {
                errorResponse(res, 'Cart not found', 'Cart not found', 404);
                return;
            }

            // Filter out the product to remove it from the cart
            const initialLength = cart.products.length;
            cart.products = cart.products.filter(item => item.productId.toString() !== productId.toString());

            // Check if the product was removed
            if (initialLength === cart.products.length) {
                errorResponse(res, 'Product not found in cart', 'Product not found', 404);
                return;
            }

            // Save the updated cart
            if (cartData){
                await Cart.findOneAndUpdate({ userId }, { products: cart.products });
            }else{
                await cart.save();
            }
            await this.redisClient.set(redisKey, JSON.stringify(cart));
            successResponse(res, cart, 'Item removed from cart', 200);
        } catch (err) {
            errorResponse(res, err);
        }
    };

    viewCart = async (req: Request, res: Response): Promise<void> => {
        const { userId } = req.params;
        try {
            const redisKey = this.redisKey(userId);
            let cartData = await this.redisClient.get(redisKey);
            if (!cartData) {
                const cart = await Cart.findOne({ userId }).populate('products.productId');
                if (!cart) {
                    errorResponse(res, "Cart not found", 'Cart not found', 404);
                    return;
                }
                cartData = JSON.stringify(cart);
                await this.redisClient.set(redisKey, cartData);
            }
            successResponse(res, JSON.parse(cartData), '');
        } catch (err) {
            errorResponse(res, err);
        }
    };

    checkout = async (req: Request, res: Response): Promise<void> => {
        const checkoutDto = plainToInstance(CheckoutDto, req.body);
        const validationErrors = await validate(checkoutDto);

        if (validationErrors.length > 0) {
            errorResponse(res, validationErrors, "Cart not found", 400);
            return;
        }

        const { userId } = checkoutDto;
        const redisKey = `cart:${userId}`;

        try {
            // Get cart from Redis or MongoDB
            let cartData = await this.redisClient.get(redisKey);
            let cart: ICart = cartData ? JSON.parse(cartData) : await Cart.findOne({ userId }).populate('products.productId');

            if (!cart) {
                errorResponse(res, "Cart not found", "Cart not found", 404);
                return;
            }

            // Handle product stock
            await this.handleProductStock(cart);

            // Clear the cart
            await Cart.findOneAndDelete({ userId });
            await this.redisClient.del(redisKey);

            successResponse(res, {}, 'Checkout successful');
        } catch (err) {
            errorResponse(res, err, 'An error occurred during checkout', 500);
        }
    };

    private handleProductStock = async (cart: ICart) => {
        return Promise.all(cart.products.map(async (item: ICartItem) => {
            const lockResource = `locks:products:${item.productId._id}`;
            const ttl = 1000;

            let lock;
            try {
                // Acquire lock for product
                lock = await this.redlock.acquire([lockResource], ttl);

                const product = await Product.findById(item.productId);
                if (!product || product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${item.productId._id}`);
                }

                // Update stock
                product.stock -= item.quantity;
                await product.save();
            } finally {
                if (lock) await lock.release();
            }
        }));
    };
}

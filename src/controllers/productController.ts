import { Request, Response } from 'express';
import Product, { IProduct } from '../models/product';
import RedisClient from '../config/redisClient';
import { CreateProductDto, GetProductByIdDto, UpdateProductDto } from "../dtos/product.dto";
import { plainToInstance } from "class-transformer";
import { validate, validateOrReject } from "class-validator";
import { errorResponse, paginationResponse, PaginationDto, successResponse } from '../dtos/response.dto';

export default class ProductController {
    createProduct = async (req: Request, res: Response) => {
        try {
            const createProductDto = plainToInstance(CreateProductDto, req.body);
            const errors = await validate(createProductDto);
            if (errors.length > 0) {
                errorResponse(res, errors, '', 400);
            }
            const { name, price, stock, description } = createProductDto;

            const product: IProduct = new Product({ name, price, stock, description });
            await product.save();

            successResponse(res, product, 'Product created', 201);
        } catch (err) {
            errorResponse(res, err);
        }
    }

    getProducts = async (req: Request, res: Response) => {
        try {
            const paginationDto = plainToInstance(PaginationDto, req.query);
            await validateOrReject(paginationDto);

            const { limit, page } = paginationDto;
            const skip = (page - 1) * limit;

            const [products, totalItems] = await Promise.all([
                Product.find().skip(skip).limit(limit),
                Product.countDocuments()
            ]);

            return paginationResponse(res, products, totalItems, page, limit);
        } catch (err) {
            errorResponse(res, err);
        }
    }

    public async getProductById(req: Request, res: Response): Promise<void> {
        try {
            const getProductById = plainToInstance(GetProductByIdDto, req.params);
            await validateOrReject(getProductById);

            const { id } = getProductById;
            const product = await Product.findById(id);
            if (!product) {
                errorResponse(res, 'Product not found', 'Product not found', 404);
                return;
            }
            successResponse(res, product, 'Product gotten successfully', 200);
        } catch (error) {
            errorResponse(res, error, 'Error fetching product', 500);
        }
    }

    public async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const updateProductDto = plainToInstance(UpdateProductDto, req.body);
            const errors = await validate(updateProductDto);

            if (errors.length > 0) {
                errorResponse(res, errors, '', 400);
            }

            const { name, price, stock, description } = updateProductDto;
            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                { name, price, stock, description },
                { new: true }
            );
            if (!updatedProduct) {
                errorResponse(res, 'Product not found', 'Product not found', 404);
                return;
            }
            successResponse(res, updatedProduct, 'Product updated successfully', 200);
        } catch (error) {
            errorResponse(res, error, 'Error updating product', 500);
        }
    }
}

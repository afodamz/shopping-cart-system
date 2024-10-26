import request from 'supertest';
import Server from '../server';
import mongoose from 'mongoose';
import Product from '../models/product';
import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import Database from '../config/db';
import express from 'express';

let db: Database;
let server: Server;
let app: express.Application;

describe('Product API', () => {
    beforeAll(async () => {
        db = Database.getInstance();
        await db.connect();
        server = new Server();
        await server.start();
        app = server.getApp();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    it('should create a new product', async () => {
        const product = {
            name: 'Test Product',
            price: 10.99,
            stock: 100
        };

        const res = await request(app).post('/api/products').send(product);

        expect(res.statusCode).toEqual(201);
        expect(res.body.data).toHaveProperty('name', 'Test Product'); // Updated expectation
    });

    it('should fetch all products', async () => {
        const res = await request(app).get('/api/products');

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toBeInstanceOf(Array); // Updated expectation
    });

    it('should update an existing product', async () => {
        const product = await Product.create({ name: 'Old Product', price: 20, stock: 50 });
        const updatedData = { price: 15 };

        const res = await request(app).put(`/api/products/${product._id}`).send(updatedData);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.price).toEqual(15); // Ensure this reflects your response structure
    });
});

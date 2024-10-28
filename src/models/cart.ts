import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
}

export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    products: ICartItem[];
    status: string;
}

const cartSchema: Schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' } 
});

export default mongoose.model<ICart>('Cart', cartSchema);

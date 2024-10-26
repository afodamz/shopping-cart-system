import mongoose, {Document, Schema} from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    stock: number;
}

const productSchema: Schema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: false},
    price: {type: Number, required: true},
    stock: {type: Number, required: true, default: 0}
});

export default mongoose.model<IProduct>('Product', productSchema);

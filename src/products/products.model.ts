import mongoose, { Schema, Document } from 'mongoose';

export interface IContact {
  name: string;
  email: string;
  phone: string;
}

export interface IManufacturer {
  name: string;
  country: string;
  website?: string;
  description?: string;
  address?: string;
  contact: IContact;
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  description?: string;
  price: number;
  category: string;
  manufacturer: IManufacturer;
  amountInStock: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true }
}, { _id: false });

const ManufacturerSchema = new Schema<IManufacturer>({
  name: { type: String, required: true },
  country: { type: String, required: true },
  website: { type: String },
  description: { type: String },
  address: { type: String },
  contact: { type: ContactSchema, required: true }
}, { _id: false });

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  manufacturer: { type: ManufacturerSchema, required: true },
  amountInStock: { type: Number, required: true, min: 0, default: 0 }
}, {
  timestamps: true
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
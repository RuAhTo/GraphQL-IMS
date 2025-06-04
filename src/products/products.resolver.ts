import mongoose from 'mongoose';
import { Product, IProduct } from './products.model.js';

interface ProductFilter {
  category?: string;
  manufacturerName?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

interface ProductArgs {
  filter?: ProductFilter;
  limit?: number;
  offset?: number;
}

interface ProductByIdArgs {
  id: string;
}

interface CreateProductArgs {
  input: Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'>;
}

interface UpdateProductArgs {
  id: string;
  input: Partial<Omit<IProduct, '_id' | 'createdAt' | 'updatedAt'>>;
}

interface DeleteProductArgs {
  id: string;
}

export const productResolvers = {
  Query: {
    products: async (_: any, args: ProductArgs): Promise<IProduct[]> => {
      const { filter = {}, limit = 10, offset = 0 } = args;
      const mongoFilter: any = {};

      // Build filter
      if (filter.category) {
        mongoFilter.category = new RegExp(filter.category, 'i');
      }
      if (filter.manufacturerName) {
        mongoFilter['manufacturer.name'] = new RegExp(filter.manufacturerName, 'i');
      }
      if (filter.minPrice || filter.maxPrice) {
        mongoFilter.price = {};
        if (filter.minPrice) mongoFilter.price.$gte = filter.minPrice;
        if (filter.maxPrice) mongoFilter.price.$lte = filter.maxPrice;
      }
      if (filter.inStock === true) {
        mongoFilter.amountInStock = { $gt: 0 };
      } else if (filter.inStock === false) {
        mongoFilter.amountInStock = { $eq: 0 };
      }

      return await Product.find(mongoFilter)
        .limit(limit)
        .skip(offset)
        .sort({ createdAt: -1 });
    },

    product: async (_: any, args: ProductByIdArgs): Promise<IProduct | null> => {
      const { id } = args;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid product ID');
      }
      return await Product.findById(id);
    },

    productCount: async (_: any, { filter = {} }: { filter?: ProductFilter }): Promise<number> => {
      const mongoFilter: any = {};

      // Build filter (same logic as products query)
      if (filter.category) {
        mongoFilter.category = new RegExp(filter.category, 'i');
      }
      if (filter.manufacturerName) {
        mongoFilter['manufacturer.name'] = new RegExp(filter.manufacturerName, 'i');
      }
      if (filter.minPrice || filter.maxPrice) {
        mongoFilter.price = {};
        if (filter.minPrice) mongoFilter.price.$gte = filter.minPrice;
        if (filter.maxPrice) mongoFilter.price.$lte = filter.maxPrice;
      }
      if (filter.inStock === true) {
        mongoFilter.amountInStock = { $gt: 0 };
      } else if (filter.inStock === false) {
        mongoFilter.amountInStock = { $eq: 0 };
      }

      return await Product.countDocuments(mongoFilter);
    },

    totalStockValue: async (): Promise<number> => {
      const result = await Product.aggregate([
        {
          $project: {
            stockValue: { $multiply: ['$price', '$amountInStock'] }
          }
        },
        {
          $group: {
            _id: null,
            totalValue: { $sum: '$stockValue' }
          }
        }
      ]);
      
      return result.length > 0 ? result[0].totalValue : 0;
    },

    totalStockValueByManufacturer: async () => {
      const result = await Product.aggregate([
        {
          $project: {
            manufacturer: '$manufacturer.name',
            stockValue: { $multiply: ['$price', '$amountInStock'] }
          }
        },
        {
          $group: {
            _id: '$manufacturer',
            totalValue: { $sum: '$stockValue' }
          }
        },
        {
          $project: {
            _id: 0,
            manufacturer: '$_id',
            totalValue: 1
          }
        },
        {
          $sort: { totalValue: -1 }
        }
      ]);
      
      return result;
    },

    lowStockProducts: async (): Promise<IProduct[]> => {
      return await Product.find({ amountInStock: { $lt: 10 } })
        .sort({ amountInStock: 1 });
    },

    criticalStockProducts: async () => {
      const products = await Product.find({ amountInStock: { $lt: 5 } })
        .sort({ amountInStock: 1 });
      
      return products.map(product => ({
        id: product._id.toString(),
        name: product.name,
        sku: product.sku,
        amountInStock: product.amountInStock,
        manufacturerName: product.manufacturer.name,
        contactName: product.manufacturer.contact.name,
        contactPhone: product.manufacturer.contact.phone,
        contactEmail: product.manufacturer.contact.email
      }));
    },

    manufacturers: async () => {
      const result = await Product.aggregate([
        {
          $group: {
            _id: {
              name: '$manufacturer.name',
              country: '$manufacturer.country',
              website: '$manufacturer.website',
              description: '$manufacturer.description',
              address: '$manufacturer.address',
              contact: '$manufacturer.contact'
            }
          }
        },
        {
          $project: {
            _id: 0,
            name: '$_id.name',
            country: '$_id.country',
            website: '$_id.website',
            description: '$_id.description',
            address: '$_id.address',
            contact: '$_id.contact'
          }
        },
        {
          $sort: { name: 1 }
        }
      ]);
      
      return result;
    }
  },

  Mutation: {
    addProduct: async (_: any, { input }: CreateProductArgs): Promise<IProduct> => {
      try {
        // Check if SKU already exists
        const existingProduct = await Product.findOne({ sku: input.sku });
        if (existingProduct) {
          throw new Error(`Product with SKU ${input.sku} already exists`);
        }

        const product = new Product(input);
        return await product.save();
      } catch (error: any) {
        if (error.code === 11000) {
          throw new Error(`Product with SKU ${input.sku} already exists`);
        }
        throw new Error(`Failed to create product: ${error.message}`);
      }
    },

    updateProduct: async (_: any, { id, input }: UpdateProductArgs): Promise<IProduct> => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid product ID');
      }

      try {
        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          input,
          { new: true, runValidators: true }
        );

        if (!updatedProduct) {
          throw new Error('Product not found');
        }

        return updatedProduct;
      } catch (error: any) {
        if (error.code === 11000) {
          throw new Error('SKU already exists');
        }
        throw new Error(`Failed to update product: ${error.message}`);
      }
    },

    deleteProduct: async (_: any, { id }: DeleteProductArgs): Promise<boolean> => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid product ID');
      }

      const deletedProduct = await Product.findByIdAndDelete(id);
      return !!deletedProduct;
    }
  },

  // Field resolvers
  Product: {
    id: (product: IProduct) => product._id?.toString() || '',
    createdAt: (product: IProduct) => product.createdAt.toISOString(),
    updatedAt: (product: IProduct) => product.updatedAt.toISOString(),
  }
};
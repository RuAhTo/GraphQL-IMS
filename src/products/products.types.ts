import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Contact {
    name: String!
    email: String!
    phone: String!
  }

  type Manufacturer {
    name: String!
    country: String!
    website: String
    description: String
    address: String
    contact: Contact!
  }

  type Product {
    id: ID!
    name: String!
    sku: String!
    description: String
    price: Float!
    category: String!
    manufacturer: Manufacturer!
    amountInStock: Int!
    createdAt: String!
    updatedAt: String!
  }

  input ContactInput {
    name: String!
    email: String!
    phone: String!
  }

  input ManufacturerInput {
    name: String!
    country: String!
    website: String
    description: String
    address: String
    contact: ContactInput!
  }

  input ProductInput {
    name: String!
    sku: String!
    description: String
    price: Float!
    category: String!
    manufacturer: ManufacturerInput!
    amountInStock: Int = 0
  }

  input ProductUpdateInput {
    name: String
    description: String
    price: Float
    category: String
    manufacturer: ManufacturerInput
    amountInStock: Int
  }

  input ProductFilter {
    category: String
    manufacturerName: String
    minPrice: Float
    maxPrice: Float
    inStock: Boolean
  }

  type StockValue {
    manufacturer: String!
    totalValue: Float!
  }

  type CriticalStockProduct {
    id: ID!
    name: String!
    sku: String!
    amountInStock: Int!
    manufacturerName: String!
    contactName: String!
    contactPhone: String!
    contactEmail: String!
  }

  type Query {
    products(filter: ProductFilter, limit: Int = 10, offset: Int = 0): [Product!]!
    product(id: ID!): Product
    productCount(filter: ProductFilter): Int!
    totalStockValue: Float!
    totalStockValueByManufacturer: [StockValue!]!
    lowStockProducts: [Product!]!
    criticalStockProducts: [CriticalStockProduct!]!
    manufacturers: [Manufacturer!]!
  }

  type Mutation {
    addProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductUpdateInput!): Product!
    deleteProduct(id: ID!): Boolean!
  }
`;
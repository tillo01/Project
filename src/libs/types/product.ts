/** @format */

import { ObjectId } from "mongoose";
import {
   ProductCollection,
   ProductSize,
   ProductStatus,
} from "../enums/product.enum";

export interface Product {
   _id: ObjectId;
   productStatus: ProductStatus;
   productCollection: ProductCollection;
   productName: string;
   productPrice: number;
   productLeftCount: number;
   productSize: ProductSize;
   productVolume: number;
   productDiscount: number;
   productIsDicounted?: number;
   productDesc?: string;
   productImages: string[];
   productViews: number;
   productExpiryDate: number;

   createdAt: Date;
   updatedAt: Date;
}

export interface ProductInquery {
   order: string;
   page: number;
   limit: number;
   productCollection?: ProductCollection;
   search?: string;
}
export interface ProductInput {
   productStatus?: ProductStatus;
   productCollection: ProductCollection;
   productName: string;
   productPrice: number;
   productLeftCount: number;
   productSize?: ProductSize;
   productVolume?: number;
   productDesc?: string;
   productImages?: string[];
   productViews?: number;
}

export interface ProductUpdateInput {
   _di: ObjectId;
   productStatus?: ProductStatus;
   productCollection?: ProductCollection;
   productName?: string;
   productPrice?: number;
   productLeftCount?: number;
   productSize?: ProductSize;
   productVolume?: number;
   productDesc?: string;
   productImages?: string[];
   productViews?: number;
   productDiscount?: number;
   productIsDicounted?: number;
   productExpiryDate: null;
}

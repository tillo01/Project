/** @format */

import mongoose, { Schema } from "mongoose";
import {
   ProductCollection,
   ProductKids,
   ProductSize,
   ProductStatus,
} from "../libs/enums/product.enum";
import { format } from "date-fns";

const productSchema = new Schema(
   {
      productStatus: {
         type: String,
         enum: ProductStatus,
         default: ProductStatus.PAUSE,
      },
      productCollection: {
         type: String,
         enum: ProductCollection,
         required: true,
      },
      productName: {
         type: String,
         required: true,
      },
      productPrice: {
         type: Number,
         required: true,
      },
      productDiscount: {
         type: Number,
         default: 0,
      },

      productIsDicounted: {
         type: Number,
         default: 0,
      },
      productLeftCount: {
         type: Number,
         required: true,
      },
      productSize: {
         type: String,
         enum: ProductSize,
         default: ProductSize.XL,
      },

      productKids: {
         type: Number,
         enum: ProductKids,
         default: ProductKids.S26,
      },

      productDesc: {
         type: String,
      },
      productImages: {
         type: [String],
         default: [],
      },
      productViews: {
         type: Number,
         default: 0,
      },
      productSold: {
         type: Number,
         default: 0,
      },

      productExpiryDate: {
         type: Date,
         default: () => format(new Date(), "yyyy-MM-dd"),
      },
   },
   { timestamps: true }, // updatedAt, createdAt
);

productSchema.index(
   { productName: 1, ProductSize: 1, ProductVolume: 1 },
   { unique: true },
);

export default mongoose.model("Product", productSchema);

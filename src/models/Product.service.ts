/** @format */

import { HttpCode } from "../libs/types/Errors";
import {
   Product,
   ProductInput,
   ProductInquery,
   ProductInqueryDaily,
   ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { Message } from "../libs/types/Errors";
import Errors from "../libs/types/Errors";
import { shapeIntoMongooseObjectId } from "../libs/types/config";
import { T } from "../libs/types/common";
import { ProductStatus } from "../libs/enums/product.enum";
import { ObjectId } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import { addHours, format } from "date-fns";
import { OrderUpdateInput } from "../libs/types/order";

class ProductService {
   private readonly productModel;
   public viewService;
   constructor() {
      this.productModel = ProductModel;
      this.viewService = new ViewService();
   }

   /* SPA START */

   public async getProducts(inquiry: ProductInquery): Promise<Product[]> {
      console.log("inquiry", inquiry);
      const match: T = {
         productStatus: ProductStatus.PROCESS && ProductStatus.DAILYDEALS,
      };

      if (inquiry.productCollection)
         match.productCollection = inquiry.productCollection;
      if (inquiry.productStatus) {
         match.productStatus = inquiry.productStatus;
      }

      if (inquiry.search) {
         match.productName = { $regex: new RegExp(inquiry.search, "i") };
      }
      const sort: T =
         inquiry.order === "productPrice"
            ? {
                 [inquiry.order]: 1,
              }
            : { [inquiry.order]: -1 };

      const result = this.productModel
         .aggregate([
            { $match: match },
            { $sort: sort },
            { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
            { $limit: inquiry.limit * 1 },
         ])

         .exec();
      if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      return result;
   }

   /* SPA  END*/
   public async getAllProducts(): Promise<Product[]> {
      const result = await this.productModel.find().exec();

      if (!result.length)
         throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

      return result;
   }

   public async createNewProduct(input: ProductInput): Promise<Product> {
      try {
         return await this.productModel.create(input);
      } catch (err) {
         console.error("Error,model:createNewPRoduct", err);

         throw new Errors(HttpCode.BAD_RQUEST, Message.CREATE_FAILED);
      }
   }

   public async getProduct(
      memberId: ObjectId | null,
      id: string,
   ): Promise<Product> {
      const productId = shapeIntoMongooseObjectId(id);
      let result = await this.productModel
         .findOne({ _id: productId, productStatus: ProductStatus.PROCESS })
         .exec();
      if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

      if (memberId) {
         // Check Existence

         const input: ViewInput = {
            memberId: memberId,
            viewRefId: productId,
            viewGroup: ViewGroup.PRODUCT,
         };
         const existView = await this.viewService.checkViewExistence(input);

         if (!existView) {
            // Insert view

            console.log("Planning to insert new view");
            await this.viewService.inserMemberView(input);

            // Increase counts
            result = await this.productModel
               .findByIdAndUpdate(
                  productId,
                  { $inc: { productViews: +1 } },
                  { new: true },
               )
               .exec();
         }
      }

      return result;
   }

   public async updateChoosenProduct(
      id: string,
      input: ProductUpdateInput,
   ): Promise<Product> {
      id = shapeIntoMongooseObjectId(id);
      const product = await this.productModel.findById(id).exec();
      if (!product)
         throw new Errors(HttpCode.NOT_FOUND, Message.UPDATED_FAILED);
      const result = await this.productModel

         .findOneAndUpdate({ _id: id }, input, { new: true })
         .exec();

      if (!result)
         throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATED_FAILED);

      return result;
   }
   public async applyDiscount(
      productId: string,
      discount: number,
   ): Promise<Product> {
      try {
         productId = shapeIntoMongooseObjectId(productId);

         const product = await this.productModel.findById(productId);

         const discountedValue = Math.floor(
            product.productPrice * (discount / 100),
         );

         const discountedPrice = product.productPrice - discountedValue;
         product.productDiscount = discountedPrice;
         console.log("discountedPrice", discountedPrice);

         const result = await this.productModel
            .findByIdAndUpdate(
               productId,
               {
                  productIsDicounted: discountedValue,
                  productDiscount: discountedPrice,
               },
               { new: true },
            )
            .exec();
         if (!result) {
            throw new Errors(HttpCode.NOT_FOUND, Message.UPDATED_FAILED);
         }
         console.log("result", result);

         return result;
      } catch (error) {
         console.error(error);
         throw new Errors(HttpCode.NOT_FOUND, Message.UPDATED_FAILED);
      }
   }

   public async uploadToDaily(
      _id: string,
      expiryHours: number,
      input: ProductUpdateInput,
   ): Promise<Product> {
      try {
         _id = shapeIntoMongooseObjectId(_id);

         const expiryDate = addHours(new Date(), expiryHours);

         const result = await this.productModel.findByIdAndUpdate(
            _id,
            {
               input,
               productExpiryDate: expiryDate,
            },
            { new: true },
         );

         return result;
      } catch (err) {
         throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATED_FAILED);
      }
   }
}
export default ProductService;

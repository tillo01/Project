/** @format */

import { Member } from "../libs/types/member";
import OrderItemModel from "../schema/OrderItem.model";
import OrderModel from "../schema/Order.model";
import {
   Order,
   OrderInquiry,
   OrderItemInput,
   OrderUpdateInput,
} from "../libs/types/order";
import { shapeIntoMongooseObjectId } from "../libs/types/config";
import { Message } from "../libs/types/Errors";
import { HttpCode } from "../libs/types/Errors";
import { ObjectId } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enum";
import Errors from "../libs/types/Errors";
import MemberService from "./Member.service";
class OrderService {
   private readonly orderModel;
   private readonly orderItemModel;
   private readonly memberService;

   constructor() {
      this.orderModel = OrderModel;
      this.orderItemModel = OrderItemModel;
      this.memberService = new MemberService();
   }

   public async createOrder(
      member: Member,
      input: OrderItemInput[],
   ): Promise<Order> {
      console.log("input=>", input, member);
      const memberId = shapeIntoMongooseObjectId(member._id);
      const amount = input.reduce(
         (accumulator: number, item: OrderItemInput) => {
            return accumulator + item.itemPrice * item.itemQuantity;
         },
         0,
      );
      const delivery = amount < 100 ? 5 : 0;
      try {
         const newOrder = await this.orderModel.create({
            orderTotal: amount + delivery,
            orderDelivery: delivery,
            memberId: memberId,
         });
         console.log("orderId", newOrder._id);
         const orderId = newOrder._id;
         await this.recordOrderItem(orderId, input);
         //   TODO create items

         return newOrder;
      } catch (err) {
         console.log("Error model:createOrder", err);

         throw new Errors(HttpCode.BAD_RQUEST, Message.CREATE_FAILED);
      }
   }
   private async recordOrderItem(
      orderId: ObjectId,
      input: OrderItemInput[],
   ): Promise<void> {
      const promisedList = input.map(async (item: OrderItemInput) => {
         item.orderId = orderId;
         item.productId = shapeIntoMongooseObjectId(item.productId);
         await this.orderItemModel.create(item);
         return "INSERTED ";
      });
      const orderItemsState = await Promise.all(promisedList);
      console.log("orderItemState", orderItemsState);
   }

   public async getMyOrders(
      member: Member,
      inquiry: OrderInquiry,
   ): Promise<Order[]> {
      const memberId = shapeIntoMongooseObjectId(member._id);
      const matches = { memberId: memberId, orderStatus: inquiry.orderStatus };

      const result = await this.orderModel
         .aggregate([
            { $match: matches },
            { $sort: { updatedAt: -1 } },
            { $skip: (inquiry.page - 1) * inquiry.limit },
            { $limit: inquiry.limit },
            {
               $lookup: {
                  from: "orderItems",
                  localField: "_id",
                  foreignField: "orderId",
                  as: "orderItems",
               },
            },
            {
               $lookup: {
                  from: "products",
                  localField: "orderItems.productId",
                  foreignField: "_id",
                  as: "productData",
               },
            },
         ])

         .exec();
      if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      return result;
   }

   public async orderUpdate(
      member: Member,
      input: OrderUpdateInput,
   ): Promise<Order> {
      const memberId = shapeIntoMongooseObjectId(member._id),
         orderId = shapeIntoMongooseObjectId(input.orderId),
         orderStatus = input.orderStatus;
      const result = await this.orderModel
         .findOneAndUpdate(
            { memberId: memberId, _id: orderId },
            { orderStatus: orderStatus },
            { new: true },
         )
         .exec();
      if (!result)
         throw new Errors(HttpCode.NOT_MODIFIED, Message.CREATE_FAILED);
      if (orderStatus === OrderStatus.PROCESS) {
         await this.memberService.addUserPoint(member, +1);
      }
      return result;
   }
}

export default OrderService;

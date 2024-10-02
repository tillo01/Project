/** @format */

import mongoose, { Schema } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enum";

const orderSchema = new Schema(
   {
      orderTotal: {
         type: Number,
         required: true,
      },
      orderDelivery: {
         type: Number,
         required: true,
      },
      orderStatus: {
         type: String,
         enum: OrderStatus,
         default: OrderStatus.PAUSE,
      },
      memberId: {
         type: Schema.Types.ObjectId,
         required: true,
         ref: "Member",
      },
      productSold: {
         type: Number,
         default: 0,
      },
   },
   { timestamps: true },
);

export default mongoose.model("order", orderSchema);

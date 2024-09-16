/** @format */

import { ExtendedRequest } from "../libs/types/member";
import { T } from "../libs/types/common";
import Errors, { HttpCode } from "../libs/types/Errors";
import { Response } from "express";
import OrderService from "../models/Order.service";
import { OrderInquiry, OrderUpdateInput } from "../libs/types/order";
import { OrderStatus } from "../libs/enums/order.enum";

const orderService = new OrderService();

const orderController: T = {};
orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
   const result = await orderService.createOrder(req.member, req.body);
   res.status(HttpCode.CREATED).json(result);
   try {
      console.log("createOrder");
   } catch (err) {
      console.log("Error on createOrder ", err);
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
   console.log("getMyOrders");

   const { page, limit, orderStatus } = req.query;
   const inquiry: OrderInquiry = {
      page: Number(page),
      limit: Number(limit),
      orderStatus: orderStatus as OrderStatus,
   };
   console.log("inquiry", inquiry);

   const result = await orderService.getMyOrders(req.member, inquiry);

   res.status(HttpCode.CREATED).json(result);
   try {
      console.log("getMyOrders");
   } catch (err) {
      console.log("Error on getMyOrders ", err);
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};
orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
   try {
      console.log("updateOrder");
      const input: OrderUpdateInput = req.body;
      console.log("input=>");

      const result = await orderService.orderUpdate(req.member, input);

      res.status(HttpCode.OK).json(result);
   } catch (err) {
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

export default orderController;

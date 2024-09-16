/** @format */

import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/types/Errors";
import { T } from "../libs/types/common";
import ProductService from "../models/Product.service";
import { ProductInput, ProductInquery } from "../libs/types/product";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ProductCollection } from "../libs/enums/product.enum";
import MemberService from "../models/Member.service";

const productService = new ProductService();
const productController: T = {};

/* SPA */
productController.getProducts = async (req: Request, res: Response) => {
   try {
      console.log("getProducts");
      const { order, page, limit, productCollection, search } = req.query;
      const inquiry: ProductInquery = {
         order: String(order),
         page: Number(page),
         limit: Number(limit),
      };
      if (productCollection) {
         inquiry.productCollection = productCollection as ProductCollection;
      }
      if (search) inquiry.search = String(search);
      const result = await productService.getProducts(inquiry);

      res.status(HttpCode.OK).json(result);
   } catch (err) {
      console.log("Error on getProducts ", err);
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

productController.getProduct = async (req: ExtendedRequest, res: Response) => {
   try {
      console.log("getProduct");
      const { id } = req.params;
      console.log("req.member=>", req.member);

      const memberId = req.member?._id ?? null,
         result = await productService.getProduct(memberId, id);

      res.status(HttpCode.OK).json(result);
   } catch (err) {
      console.log("Error on getProduct ", err);
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

/* SPA */

productController.getAllProducts = async (req: Request, res: Response) => {
   try {
      const data = await productService.getAllProducts();
      res.render("products", { products: data });
   } catch (err) {
      console.log("Error on product section", err);
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

productController.createNewProduct = async (
   req: AdminRequest,
   res: Response,
) => {
   try {
      console.log("createNewProduct");

      if (!req.files?.length)
         throw new Errors(
            HttpCode.INTERNAL_SERVER_ERROR,
            Message.CREATE_FAILED,
         );
      const data: ProductInput = req.body;
      data.productImages = req.files?.map((ele) => {
         return ele.path.replace(/\\/g, "/");
      });

      await productService.createNewProduct(data);
      res.send(
         `<script> alert("Successfully creation"); window.location.replace('/admin/product/all');</script>`,
      );
   } catch (err) {
      console.log("Errors, createNewProduct", err);
      const message =
         err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
      res.send(
         `<script> alert(" ${message}"); window.location.replace('/admin/product/all')</script>`,
      );
   }
};

productController.updateChoosenProduct = async (
   req: Request,
   res: Response,
) => {
   try {
      console.log("updateChoosenProduct");
      const id = req.params.id;

      const result = await productService.updateChoosenProduct(id, req.body);

      res.status(HttpCode.OK).json({ data: result });
   } catch (err) {
      console.log("updateChoosenProduct", err);
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

productController.applyDiscount = async (req: Request, res: Response) => {
   try {
      console.log("applyDiscount");

      const productId = req.params.id;
      const { discount } = req.body;
      console.log("re.body", req.body);

      const result = await productService.applyDiscount(productId, discount);
      return res.status(HttpCode.OK).json(result);
   } catch (err) {
      console.log("Error on discountEnter");
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

productController.uploadToDaily = async (req: Request, res: Response) => {
   console.log("uploadToDaily");

   try {
      const { id } = req.params;

      const result = await productService.uploadToDaily(id);
      res.status(HttpCode.OK).json({ data: result });
   } catch (err) {
      console.log("Error on discountEnter");
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

export default productController;

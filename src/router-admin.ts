/** @format */

import express from "express";
const routerAdmin = express.Router();
import restaurantController from "./controller/restaurant.controller";
import productController from "./controller/product.controller";
import makeUploader from "./libs/utils/uploader";

/* Restaurant */
routerAdmin.get("/", restaurantController.goHome);

routerAdmin
   .get("/login", restaurantController.getLogin)
   .post("/login", restaurantController.processLogin);

routerAdmin
   .get("/signup", restaurantController.getSignup)
   .post(
      "/signup",
      makeUploader("members").single("memberImage"),
      restaurantController.processSignup,
   );

routerAdmin.get("/check-me", restaurantController.checAuthSession);
routerAdmin.get("/logout", restaurantController.logout);

/* Product */

routerAdmin.get(
   "/product/all",
   restaurantController.verifyRestaurant,
   productController.getAllProducts,
);

routerAdmin.post(
   "/product/create",
   restaurantController.verifyRestaurant,
   makeUploader("products").array("productImages", 5),
   productController.createNewProduct,
),
   routerAdmin.post("/product/discount/:id", productController.applyDiscount);

routerAdmin.post(
   "/product/update/:id",
   restaurantController.verifyRestaurant,
   productController.updateChoosenProduct,
);
// to the Dily

/* user  */

routerAdmin.get(
   "/user/all",
   restaurantController.verifyRestaurant,
   restaurantController.getUsers,
),
   routerAdmin.post(
      "/user/edit",
      restaurantController.verifyRestaurant,
      restaurantController.updateChoosenUser,
   );

export default routerAdmin;

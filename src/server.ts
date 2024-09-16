/** @format */

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app";
mongoose
   .connect(process.env.MONGO_URL as string, {})
   .then((data) => {
      console.log("Mongodb connection successed");
      const PORT = process.env.PORT ?? 3003;
      app.listen(PORT, function () {
         console.log(`The server is running successfully on port: ${PORT}`);
         console.log(`Admin Project on http://localhost:${PORT}/admin \n`);
      });
   })
   .catch((err) => console.log("Failed on connection mongodb ", err));

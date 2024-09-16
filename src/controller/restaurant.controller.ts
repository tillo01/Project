/** @format */

import express, { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";

import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/types/Errors";

const memberService = new MemberService();
// gohome
const restaurantController: T = {};
restaurantController.goHome = (req: Request, res: Response) => {
   try {
      console.log("goHome");

      res.render("home");
      // send/ json / redirect / end / render
   } catch (err) {
      console.log("Error,goHome", err);
      res.redirect("/admin");
   }
};

// getSignup
restaurantController.getSignup = (req: Request, res: Response) => {
   try {
      res.render("signup");
   } catch (err) {
      console.log("Error, on sign up");
      res.redirect("/admin");
   }
};
// getLogin
restaurantController.getLogin = (req: Request, res: Response) => {
   try {
      res.render("login");
   } catch (err) {
      console.log("Erro,on login", err);
      res.redirect("/admin");
   }
};

// processSignup
restaurantController.processSignup = async (
   req: AdminRequest,
   res: Response,
) => {
   try {
      console.log("processSignup");
      console.log("Body:", req.body);
      const file = req.file;
      if (!file)
         throw new Errors(HttpCode.BAD_RQUEST, Message.SOMETHING_WENT_WRONG);

      const newMember: MemberInput = req.body;
      newMember.memberImage = file?.path.replace(/\\/g, "/");
      newMember.memberType = MemberType.SHOPOWNER;

      const result = await memberService.processSignup(newMember);

      req.session.member = result;
      req.session.save(function () {
         res.redirect("/admin/product/all");
      });
   } catch (err) {
      console.log("Error, on processSignup", err);
      const message =
         err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
      res.send(
         `<script> alert("${message}"); window.location.replace('/admin/signup');</script>`,
      );
   }
};
// processLogin
restaurantController.processLogin = async (
   req: AdminRequest,
   res: Response,
) => {
   try {
      console.log("processLogin");
      console.log("body:", req.body);

      const input: LoginInput = req.body;
      const result = await memberService.processLogin(input);

      req.session.member = result;
      req.session.save(function () {
         res.redirect("/admin/product/all");
      });

      // res.send(result);
   } catch (err) {
      console.log("Error, on processLgin");
      const message =
         err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
      res.send(
         `<script> alert("${message}"); window.location.replace('/admin/login')</script>`,
      );
   }
};

// logout
restaurantController.logout = async (req: AdminRequest, res: Response) => {
   try {
      console.log("logout");

      req.session.destroy(function () {
         res.redirect("/admin");
      });
   } catch (err) {
      console.log("Error, on processLgin", err);
      res.redirect("/admin/login");
   }
};

// getUsers
restaurantController.getUsers = async (req: Request, res: Response) => {
   try {
      const result = await memberService.getUsers();
      console.log("result", result);

      res.render("users", { users: result });
   } catch (err) {
      console.log("Error, on getUsers", err);
      res.redirect("/admin/login");
   }
};

// updateChoosenUser
restaurantController.updateChoosenUser = async (
   req: Request,
   res: Response,
) => {
   try {
      console.log("updateChoosenUser");
      const result = await memberService.updateChoosenUser(req.body);
      res.status(HttpCode.OK).json({ data: result });
   } catch (err) {
      console.log("Error, on updateChoosenUser", err);
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

// checAuthSession
restaurantController.checAuthSession = async (
   req: AdminRequest,
   res: Response,
) => {
   try {
      console.log("checAuthSession");

      if (req.session?.member)
         res.send(
            `<script> alert("${req.session.member.memberNick}")</script>`,
         );
      else res.send(`<script> alert("${Message.NOT_AUTHNTICATED}")</script>`);
   } catch (err) {
      console.log("Error, on processLgin", err);
      res.send(err);
   }
};

// verifyRestaurant
restaurantController.verifyRestaurant = (
   req: AdminRequest,
   res: Response,
   next: NextFunction,
) => {
   if (req.session?.member?.memberType === MemberType.SHOPOWNER) {
      req.member = req.session.member;
      next();
   } else {
      const message = Message.NOT_AUTHNTICATED;
      res.send(
         `<script> alert("${message}"); window.location.replace('/admin/login');</script>`,
      );
   }
};

export default restaurantController;

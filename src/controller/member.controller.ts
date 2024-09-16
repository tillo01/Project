/** @format */

import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import {
   LoginInput,
   Member,
   MemberInput,
   MemberUpdateInput,
} from "../libs/types/member";
import MemberService from "../models/Member.service";
import Errors, { HttpCode, Message } from "../libs/types/Errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../libs/types/config";
import { ExtendedRequest } from "../libs/types/member";

const memberService = new MemberService();
const authService = new AuthService();

const memberController: T = {};

memberController.getRestaurant = async (req: Request, res: Response) => {
   try {
      console.log("getRestaurant");

      const result = await memberService.getRestaurant();
      res.status(HttpCode.OK).json(result);
   } catch (err) {
      console.log("Error getRestaurant", err);
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};
// REACT

memberController.signup = async (req: Request, res: Response) => {
   try {
      console.log("signup");
      const input: MemberInput = req.body,
         result: Member = await memberService.signup(input);
      const token = await authService.createToken(result);

      res.cookie("accesToken", token, {
         maxAge: AUTH_TIMER * 3600 * 1000,
         httpOnly: false,
      });

      res.status(HttpCode.CREATED).json({ member: result, accesToken: token });
   } catch (err) {
      console.log("Error signup", err);
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

memberController.login = async (req: Request, res: Response) => {
   try {
      console.log("login");
      const input: LoginInput = req.body,
         result = await memberService.login(input),
         token = await authService.createToken(result);
      console.log("tokens =>", token);

      res.cookie("accesToken", token, {
         maxAge: AUTH_TIMER * 3600 * 1000,
         httpOnly: false,
      });

      res.status(HttpCode.OK).json({ member: result, accesToken: token });
   } catch (err) {
      console.log("Error, on login", err);
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

memberController.logout = (req: ExtendedRequest, res: Response) => {
   try {
      console.log("logout");
      res.cookie("accesToken", null, { maxAge: 0, httpOnly: true });
      res.status(HttpCode.OK).json({ logout: true });
   } catch (err) {
      console.log("err", err);

      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

memberController.getMemberDetail = async (
   req: ExtendedRequest,
   res: Response,
) => {
   try {
      console.log("getMemberDetail");
      const result = await memberService.getMemberDetail(req.member);
      res.status(HttpCode.OK).json(result);
   } catch (err) {
      console.log("err", err);

      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

memberController.getTopUsers = async (req: Request, res: Response) => {
   try {
      console.log("getTopUsers");
      const result = await memberService.getTopUsers();
      res.status(HttpCode.OK).json(result);
   } catch (err) {
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

memberController.updateMember = async (req: ExtendedRequest, res: Response) => {
   try {
      console.log("updateMember");
      const input: MemberUpdateInput = req.body;
      if (req.file) input.memberImage = req.file.path.replace(/\\/, "/");
      const result = await memberService.updateMember(req.member, input);
      // console.log("memberImage", memberImage);

      res.status(HttpCode.OK).json(result);
   } catch (err) {
      console.log("updateMember", err);
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

memberController.verifyAuth = async (
   req: ExtendedRequest,
   res: Response,
   next: NextFunction,
) => {
   try {
      let member = null;
      const token = req.cookies["accesToken"];
      console.log("req.token=>", token);
      if (token) req.member = await authService.checkAuth(token);
      if (!req.member)
         throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHNTICATED);
      next();
   } catch (err) {
      console.log("Error, on verifyAuth", err);
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
   }
};

memberController.retriewAuth = async (
   req: ExtendedRequest,
   res: Response,
   next: NextFunction,
) => {
   try {
      const token = req.cookies["accesToken"];
      console.log("req.token=>", token);
      if (token) req.member = await authService.checkAuth(token);
      next();
   } catch (err) {
      console.log("Error, on verifyAuth", err);
      next();
   }
};

export default memberController;

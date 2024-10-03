/** @format */

import MemberModel from "../schema/Member.model";
import {
   LoginInput,
   Member,
   MemberInput,
   MemberUpdateInput,
   sendMessasgeInput,
} from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/types/Errors";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import nodemailer from "nodemailer";
import * as bcrypt from "bcryptjs";
import { shapeIntoMongooseObjectId } from "../libs/types/config";
import { SentMessageInfo } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

require("dotenv").config();

// CONTROLLER SHU YERGA JONATADI FURST VA KEGIN MODELDAN SCHEMA MODELGA KETADI

class MemberService {
   static addUserPoint(member: Member, arg1: number) {
      throw new Error("Method not implemented.");
   }
   private readonly memberModel;

   constructor() {
      this.memberModel = MemberModel;
   }

   public async getRestaurant(): Promise<Member> {
      const result = await this.memberModel
         .findOne({ memberType: MemberType.SHOPOWNER })
         .exec();

      if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      return result;
   }

   // SPA
   public async signup(input: MemberInput): Promise<Member> {
      const salt = await bcrypt.genSalt();
      input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

      try {
         const result = await this.memberModel.create(input);
         result.memberPassword = "";
         return result.toJSON();
      } catch (err) {
         console.error("Error mode:signup", err);

         throw new Errors(HttpCode.BAD_RQUEST, Message.USED_NICK_PHONE);
      }
   }

   public async login(input: LoginInput): Promise<Member> {
      // TO DO Consider member status later
      const member = await this.memberModel
         .findOne(
            {
               memberNick: input.memberNick,
               memberStatus: { $ne: MemberStatus.DELETE },
            },
            { memberNick: 1, memberPassword: 1, memberStatus: 1 },
         )
         .exec();
      if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
      else if (member.memberStatus === MemberStatus.BLOCK) {
         throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
      }
      const isMatch = await bcrypt.compare(
         input.memberPassword,
         member.memberPassword,
      );
      console.log("isMacth", isMatch);

      if (!isMatch)
         throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);

      return await this.memberModel.findById(member._id).lean().exec();
   }

   public async getMemberDetail(member: Member): Promise<Member> {
      const memberId = shapeIntoMongooseObjectId(member._id);
      const result = await this.memberModel
         .findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
         .exec();
      if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      return result;
   }
   public async updateMember(
      member: Member,
      input: MemberUpdateInput,
   ): Promise<Member> {
      const memberId = shapeIntoMongooseObjectId(member._id);
      const result = await this.memberModel
         .findOneAndUpdate({ _id: memberId }, input, { new: true })
         .exec();
      if (!result)
         throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATED_FAILED);
      return result;
   }

   public async getTopUsers(): Promise<Member[]> {
      const result = await this.memberModel
         .find({ memberStatus: MemberStatus.ACTIVE, memberPoints: { $gte: 1 } })
         .sort({ memberPoints: -1 })
         .limit(4)
         .exec();
      if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      return result;
   }

   public async addUserPoint(member: Member, point: number): Promise<Member> {
      const memberId = shapeIntoMongooseObjectId(member._id);
      return await this.memberModel
         .findOneAndUpdate(
            {
               _id: memberId,
               memberType: MemberType.USER,
               memberStatus: MemberStatus.ACTIVE,
            },
            { $inc: { memberPoints: point } },
            { new: true },
         )
         .exec();
   }
   // SPA end

   // SSR

   public async processSignup(input: MemberInput): Promise<Member> {
      const exist = await this.memberModel
         .findOne({ memberType: MemberType.SHOPOWNER })
         .exec();
      console.log("exist", exist);

      if (exist) throw new Errors(HttpCode.BAD_RQUEST, Message.CREATE_FAILED);

      console.log("before", input.memberPassword);

      const salt = await bcrypt.genSalt();
      input.memberPassword = await bcrypt.hash(input.memberPassword, salt);
      console.log("after", input.memberPassword);

      try {
         const result = await this.memberModel.create(input);
         result.memberPassword = "";
         return result;
      } catch (err) {
         throw new Errors(HttpCode.BAD_RQUEST, Message.CREATE_FAILED);
      }
   }

   // Log in

   public async processLogin(input: LoginInput): Promise<Member> {
      const member = await this.memberModel
         .findOne(
            { memberNick: input.memberNick },
            { memberNick: 1, memberPassword: 1 },
         )
         .exec();

      if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
      const isMatch = await bcrypt.compare(
         input.memberPassword,
         member.memberPassword,
      );

      // const isMatch = input.memberPassword === member.memberPassword;
      console.log("isMatch", isMatch);

      if (!isMatch)
         throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);

      return await this.memberModel.findById(member._id).exec();
   }
   public async getUsers(): Promise<Member[]> {
      const result = await this.memberModel
         .find({ memberType: MemberType.USER })
         .exec();
      if (!result)
         throw new Errors(HttpCode.NOT_MODIFIED, Message.NO_DATA_FOUND);
      return result;
   }

   public async updateChoosenUser(input: MemberUpdateInput): Promise<Member> {
      input._id = shapeIntoMongooseObjectId(input._id);

      const result = await this.memberModel
         .findByIdAndUpdate({ _id: input._id }, input, { new: true })
         .exec();
      if (!result)
         throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATED_FAILED);
      return result;
   }

   public async helpMessageHandler(
      input: sendMessasgeInput,
   ): Promise<SentMessageInfo> {
      console.log("Input received in sendMessage:", input);
      const transporter = nodemailer.createTransport({
         service: "gmail",

         auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
         },
         tls: {
            rejectUnauthorized: false,
         },
      } as SMTPTransport.Options);
      console.log("Using email:", process.env.EMAIL_USER);
      console.log(
         "Using password:",
         process.env.EMAIL_PASS ? "****" : "Not Set",
      );
      const mailOptions = {
         from: input.name,
         to: process.env.EMAIL_USER,
         subject: input.subject,
         text: input.message,
      };
      console.log("Mail options:", mailOptions);
      try {
         console.log("Sending email to admin:", mailOptions);
         await transporter.sendMail(mailOptions);
         return { data: "ok" };
      } catch (err) {
         console.log("++", err);

         throw new Errors(HttpCode.BAD_RQUEST, Message.CREATE_FAILED);
      }
   }
}
// SSR end

export default MemberService;

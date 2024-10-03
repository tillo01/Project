/** @format */

import { ObjectId } from "mongoose";
import { MemberStatus, MemberType } from "../enums/member.enum";
import { Session } from "express-session";
import { Request } from "express";

export interface Member {
   _id: ObjectId;
   memberType: MemberType;
   memebrStatus: MemberStatus;
   memberNick: string;
   memberPhone: string;
   memberPassword: string;
   memberAddress?: string;
   memberEmail: string;
   memberDesc?: string;
   memberImage?: string;
   memberPoints: number;
   createdAt: Date;
   updatedAt: Date;
}

export interface MemberInput {
   memberType?: MemberType;
   membrStatus?: MemberStatus;
   memberNick: string;
   memberPhone: string;
   memberPassword: string;
   memberAddress?: string;
   memberDesc?: string;
   memberImage?: string;
   memberPoints?: number;
   memberEmail: string;
}

export interface LoginInput {
   memberNick: string;
   memberPassword: string;
}

export interface MemberUpdateInput {
   _id: ObjectId;
   memberType?: MemberType;
   membrStatus?: MemberStatus;
   memberNick?: string;
   memberPhone?: string;
   memberPassword?: string;
   memberAddress?: string;
   memberDesc?: string;
   memberImage?: string;
   memberPoints?: number;
   memberEmail: string;
}

export interface ExtendedRequest extends Request {
   member: Member;
   file: Express.Multer.File;
   files: Express.Multer.File[];
}
export interface AdminRequest extends Request {
   member: Member;
   session: Session & { member: Member };
   file: Express.Multer.File;
   files: Express.Multer.File[];
}
export interface sendMessasgeInput {
   email: string;
   message: string;
   name: string;
   subject: string;
}

/** @format */

import { HttpCode } from "../libs/types/Errors";
import { View, ViewInput } from "../libs/types/view";
import ViewModel from "../schema/View.model";
import { Message } from "../libs/types/Errors";
import Errors from "../libs/types/Errors";

class ViewService {
  private readonly viewModel;
  constructor() {
    this.viewModel = ViewModel;
  }

  public async checkViewExistence(input: ViewInput): Promise<View> {
    return await this.viewModel.findOne({ memberId: input.memberId, viewRefId: input.viewRefId }).exec();
  }

  public async inserMemberView(input: ViewInput): Promise<View> {
    try {
      return await this.viewModel.create(input);
    } catch (err) {
      console.log("ERROR on model:inserMemberView ", err);
      throw new Errors(HttpCode.BAD_RQUEST, Message.CREATE_FAILED);
    }
  }
}

export default ViewService;

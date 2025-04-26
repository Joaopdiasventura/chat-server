import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { User } from "../entities/user.entity";
import { IUserRepository } from "./user.repository";

export class MongoUserRepository implements IUserRepository {
  public constructor(
    @InjectModel("User") private readonly userModel: Model<User>,
  ) {}

  public async create(CreateUserDto: CreateUserDto): Promise<User> {
    return await this.userModel.create(CreateUserDto);
  }

  public async findById(id: string): Promise<User> {
    return await this.userModel.findById(id).select("-password").exec();
  }

  public async findByEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email }).exec();
  }

  public async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userModel.findByIdAndUpdate(id, updateUserDto).exec();
  }

  public async delete(id: string): Promise<User> {
    return await this.userModel.findByIdAndDelete(id).exec();
  }
}

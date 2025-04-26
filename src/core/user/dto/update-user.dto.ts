import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @Transform(() => false)
  public isVerified?: boolean;
}

import { Test, TestingModule } from "@nestjs/testing";
import { InviteController } from "../invite.controller";
import { InviteService } from "../invite.service";
import { Invite } from "../entities/invite.entity";
import { ResponseMessage } from "../../../shared/interfaces/response-message";
import { UserService } from "../../user/user.service";

describe("InviteController", () => {
  let controller: InviteController;
  let service: jest.Mocked<InviteService>;

  const mockResponse: ResponseMessage = { message: "OK" };
  const mockInvites: Invite[] = [
    { _id: "i1", chat: "c1", user: "u1" } as unknown as Invite,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InviteController],
      providers: [
        {
          provide: InviteService,
          useValue: {
            acceptInvite: jest.fn(),
            findManyByUser: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn().mockReturnValue({
              _id: "u1",
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<InviteController>(InviteController);
    service = module.get(InviteService) as jest.Mocked<InviteService>;
  });

  it("should be defined", () => expect(controller).toBeDefined());

  describe("acceptInvite", () => {
    it("should call inviteService.acceptInvite and return ResponseMessage", async () => {
      service.acceptInvite.mockResolvedValue(mockResponse);

      const result = await controller.acceptInvite("invite-id");
      expect(service.acceptInvite).toHaveBeenCalledWith("invite-id");
      expect(result).toBe(mockResponse);
    });
  });

  describe("findManyByUser", () => {
    it("should call inviteService.findManyByUser and return Invite[]", async () => {
      service.findManyByUser.mockResolvedValue(mockInvites);

      const result = await controller.findManyByUser("u1");
      expect(service.findManyByUser).toHaveBeenCalledWith("u1");
      expect(result).toBe(mockInvites);
    });
  });

  describe("delete", () => {
    it("should call inviteService.delete and return ResponseMessage", async () => {
      service.delete.mockResolvedValue(mockResponse);

      const result = await controller.delete("invite-id");
      expect(service.delete).toHaveBeenCalledWith("invite-id");
      expect(result).toBe(mockResponse);
    });
  });
});

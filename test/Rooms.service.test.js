import { expect } from "chai";
import sinon from "sinon";

import Rooms from "../src/models/Rooms.model.js";
import RoomsService from "../src/services/Rooms.service.js";

describe("Rooms.service Tests", async () => {
    let roomsService;
    let caughtError;

    beforeEach(() => {
        roomsService = new RoomsService();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("createRoom Tests", () => {
        it("should create a room with correct properties", async () => {
            // Arrange
            const id = "owner_id";
            const username = "owner_username";

            let saveStub = sinon.stub(Rooms.prototype, "save");
            saveStub.resolvesThis();

            let findOneStub = sinon.stub(Rooms, "findOne");
            findOneStub.returns({ exec: sinon.stub().resolves(null) });

            const alphanumericRegex = /^[a-zA-Z0-9]+$/;

            // Act
            const room = await roomsService.createRoom(id, username);

            // Assert
            expect(room.owner_id).to.equal(id);
            expect(room.owner_username).to.equal(username);
            expect(room.players).to.be.an("array").that.is.empty;
            expect(findOneStub.calledOnce).to.be.true;
            expect(saveStub.calledOnce).to.be.true;
        });
        it("should create a room code that is exactly six alphanumeric characters", async () => {
            // Arrange
            const id = "owner_id";
            const username = "owner_username";

            let saveStub = sinon.stub(Rooms.prototype, "save");
            saveStub.resolvesThis();

            let findOneStub = sinon.stub(Rooms, "findOne");
            findOneStub.returns({ exec: sinon.stub().resolves(null) });

            const alphanumericRegex = /^[a-zA-Z0-9]+$/;

            // Act
            const room = await roomsService.createRoom(id, username);

            // Assert
            expect(room.room_code).to.have.lengthOf(6);
            expect(room.room_code).to.match(alphanumericRegex);
        });
        it("should call the find room again if a room is found with that room code the first time", async () => {
            // Arrange
            const id = "owner_id";
            const username = "owner_username";

            let saveStub = sinon.stub(Rooms.prototype, "save");
            saveStub.resolvesThis();

            let findOneStub = sinon.stub(Rooms, "findOne");
            findOneStub.onCall(0).returns({ exec: sinon.stub().resolves({}) });
            findOneStub
                .onCall(1)
                .returns({ exec: sinon.stub().resolves(null) });

            const alphanumericRegex = /^[a-zA-Z0-9]+$/;

            // Act
            const room = await roomsService.createRoom(id, username);

            // Assert
            expect(findOneStub.calledTwice).to.be.true;
        });
    });

    describe("getOwner Tests", async () => {
        it("should return an owner id if the room is present", async () => {
            // Arrange
            const roomCode = "testRoomCode";

            const room = { owner_id: "owner_id" };
            let findOneStub = sinon.stub(Rooms, "findOne");
            findOneStub.returns(room);

            // Act
            const result = await roomsService.getOwner(roomCode);

            // Assert
            expect(findOneStub.calledOnce).to.be.true;
            expect(result).to.equal(room.owner_id);
        });

        it("should error if the room is not present", async () => {
            // Arrange
            const roomCode = "testRoomCode";

            let findOneStub = sinon.stub(Rooms, "findOne");
            findOneStub.returns(null);

            const error = new Error("Room not found");

            // Act
            try {
                await roomsService.getOwner(roomCode);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(findOneStub.calledOnce).to.be.true;
            expect(caughtError).to.deep.equal(error);
        });
    });

    describe("getPlayers Tests", async () => {
        it("should return an array of player ids if the room is present", async () => {
            // Arrange
            const roomCode = "testRoomCode";
            const playerIDs = ["user_id1", "user_id2"];

            const room = {
                players: [{ user_id: playerIDs[0] }, { user_id: playerIDs[1] }],
            };

            let findOneStub = sinon.stub(Rooms, "findOne");
            findOneStub.returns(room);

            // Act
            const result = await roomsService.getPlayers(roomCode);

            // Assert
            expect(findOneStub.calledOnce).to.be.true;
            expect(result).to.deep.equal(playerIDs);
        });

        it("should throw error if the room is not present", async () => {
            // Arrange
            const roomCode = "testRoomCode";

            let findOneStub = sinon.stub(Rooms, "findOne");
            findOneStub.returns(null);

            const error = new Error("Room not found");

            // Act
            try {
                await roomsService.getPlayers(roomCode);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(findOneStub.calledOnce).to.be.true;
            expect(caughtError).to.deep.equal(error);
        });
    });
});

import { expect } from "chai";
import sinon from "sinon";

import Rooms from "../../src/models/Rooms.model.js";
import RoomsService from "../../src/services/Rooms.service.js";

describe("Rooms.service Tests", async () => {
    let roomsService;
    let caughtError;
    let saveStub;
    let findOneStub;
    let findOneAndDeleteStub;
    let findOneAndUpdateStub;

    beforeEach(() => {
        roomsService = new RoomsService();
        saveStub = sinon.stub(Rooms.prototype, "save");
        findOneStub = sinon.stub(Rooms, "findOne");
        findOneAndDeleteStub = sinon.stub(Rooms, "findOneAndDelete");
        findOneAndUpdateStub = sinon.stub(Rooms, "findOneAndUpdate");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("createRoom Tests", () => {
        it("should create a room with correct properties", async () => {
            // Arrange
            const id = "owner_id";
            const username = "owner_username";

            saveStub.resolvesThis();

            findOneStub.returns({ exec: sinon.stub().resolves(null) });

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

            saveStub.resolvesThis();

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

            saveStub.resolvesThis();

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

    describe("deleteRoom Tests", async () => {
        it("should return a deleted room if the room is present", async () => {
            // Arrange
            const roomCode = "testRoomCode";

            const foundRoom = {};
            findOneStub.returns(foundRoom);

            const deletedRoom = {};
            findOneAndDeleteStub.returns(deletedRoom);

            // Act
            const result = await roomsService.deleteRoom(roomCode);

            // Assert
            expect(findOneStub.calledOnce).to.be.true;
            expect(result).to.equal(deletedRoom);
        });

        it("should throw error if the room is not present", async () => {
            // Arrange
            const roomCode = "testRoomCode";

            findOneStub.returns(null);

            const error = new Error("Room not found");

            // Act
            try {
                await roomsService.deleteRoom(roomCode);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(findOneStub.calledOnce).to.be.true;
            expect(caughtError).to.deep.equal(error);
        });
    });

    describe("joinRoom Tests", async () => {
        it("should return a room to join if the room is present", async () => {
            // Arrange
            const testRoomCode = "testRoomCode";
            const testID = "testID";
            const testUsername = "testUsername";

            const foundRoom = { in_progress: false };
            findOneStub.onCall(0).returns(null);
            findOneStub.onCall(1).returns(foundRoom);

            findOneAndUpdateStub.returns(foundRoom);

            // Act
            const result = await roomsService.joinRoom(
                testRoomCode,
                testID,
                testUsername
            );

            // Assert
            expect(findOneAndUpdateStub.calledOnce).to.be.true;
            expect(
                findOneAndUpdateStub.calledWith(
                    { room_code: testRoomCode },
                    {
                        $push: {
                            players: {
                                user_id: testID,
                                username: testUsername,
                            },
                        },
                    },
                    { new: true }
                )
            ).to.be.true;
            expect(result).to.deep.equal(foundRoom);
        });
        it("should throw an error if a room is already found with that username", async () => {
            // Arrange
            const testRoomCode = "testRoomCode";
            const testID = "testID";
            const testUsername = "testUsername";

            const foundRoom = {};
            findOneStub.returns(foundRoom);

            const error = new Error("Username already taken!");

            // Act
            try {
                await roomsService.joinRoom(testRoomCode, testID, testUsername);
            } catch (e) {
                caughtError = e;
            }

            // Arrange
            expect(findOneStub.calledOnce).to.be.true;
            expect(caughtError).to.deep.equal(error);
        });
        it("should throw an error if a room is not found with that room code", async () => {
            // Arrange
            const testRoomCode = "testRoomCode";
            const testID = "testID";
            const testUsername = "testUsername";

            const foundRoom = { in_progress: false };
            findOneStub.returns(null);

            const error = new Error("Room code not recognised!");

            // Act
            try {
                await roomsService.joinRoom(testRoomCode, testID, testUsername);
            } catch (e) {
                caughtError = e;
            }

            // Arrange
            expect(findOneStub.calledTwice).to.be.true;
            expect(caughtError).to.deep.equal(error);
        });
        it("should throw an error if the room is in progress", async () => {
            // Arrange
            const testRoomCode = "testRoomCode";
            const testID = "testID";
            const testUsername = "testUsername";

            const foundRoom = { in_progress: true };
            findOneStub.onCall(0).returns(null);
            findOneStub.onCall(1).returns(foundRoom);

            findOneAndUpdateStub.returns(foundRoom);
            const error = new Error("Game in progress!");

            // Act
            try {
                await roomsService.joinRoom(testRoomCode, testID, testUsername);
            } catch (e) {
                caughtError = e;
            }

            // Arrange
            expect(findOneStub.calledTwice).to.be.true;
            expect(caughtError).to.deep.equal(error);
        });
    });

    describe("leaveRoom Tests", async () => {
        it("should return a left room if the room is present", async () => {
            // Arrange
            const id = "testID";

            const room = {};
            findOneAndUpdateStub.returns(room);

            // Act
            const result = await roomsService.leaveRoom(id);

            // Assert
            expect(findOneAndUpdateStub.calledOnce).to.be.true;
            expect(result).to.equal(room);
        });

        it("should error if the room is not present", async () => {
            // Arrange
            const id = "testID";

            findOneAndUpdateStub.returns(null);

            const error = new Error("Room not found!");

            // Act
            try {
                await roomsService.leaveRoom(id);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(findOneAndUpdateStub.calledOnce).to.be.true;
            expect(caughtError).to.deep.equal(error);
        });
    });

    describe("startGame Tests", async () => {
        it("should call update the game to be in progress", async () => {
            const id = "testID";
            const room = {
                settings: { owner_is_playing: false, werewolf_ratio: 0.25 },
                players: [
                    { game_role: "", user_id: "0" },
                    { game_role: "", user_id: "1" },
                    { game_role: "", user_id: "2" },
                ],
                in_progress: false,
            };

            findOneStub.returns(room);

            findOneAndUpdateStub.returns(room);

            // Act
            const result = await roomsService.startGame(id, room.settings);

            // Assert
            expect(findOneStub.calledTwice).to.be.true;
            expect(findOneAndUpdateStub.calledThrice).to.be.true;
            expect(result).to.equal(room);
        });
        it("should hand out roles to players", async () => {
            // Arrange
            const id = "testID";
            const room = {
                settings: {
                    owner_is_playing: false,
                    werewolf_ratio: 0.25,
                },
                players: [
                    { game_role: "", user_id: "0" },
                    { game_role: "", user_id: "1" },
                    { game_role: "", user_id: "2" },
                ],
                in_progress: false,
            };

            findOneStub.returns(room);

            findOneAndUpdateStub.returns(room);

            // Act
            const result = await roomsService.startGame(id, room.settings);

            // Assert
            expect(result.players[0].game_role).to.be.oneOf([
                "Werewolf",
                "Villager",
            ]);
            expect(result.players[1].game_role).to.be.oneOf([
                "Werewolf",
                "Villager",
            ]);
            expect(result.players[2].game_role).to.be.oneOf([
                "Werewolf",
                "Villager",
            ]);
        });
        it("should add the owner if owner is playing", async () => {
            // Arrange
            const id = "testID";
            const room = {
                settings: {
                    owner_is_playing: true,
                    werewolf_ratio: 0.25,
                },
                players: [
                    { game_role: "", user_id: "0" },
                    { game_role: "", user_id: "1" },
                    { game_role: "", user_id: "2" },
                ],
                in_progress: false,
            };

            findOneStub.returns(room);

            findOneAndUpdateStub.returns(room);

            let joinRoomStub = sinon.stub(roomsService, "joinRoom");

            // Act
            await roomsService.startGame(id, room.settings);

            // Assert
            expect(joinRoomStub.calledOnce).to.be.true;
        });
        it("should throw an error if the owner cannot be added", async () => {
            // Arrange
            const id = "testID";
            const room = {
                settings: {
                    owner_is_playing: true,
                    werewolf_ratio: 0.25,
                },
                players: [
                    { game_role: "", user_id: "0" },
                    { game_role: "", user_id: "1" },
                    { game_role: "", user_id: "2" },
                ],
                in_progress: false,
            };

            findOneStub.returns(room);

            findOneAndUpdateStub.returns(room);

            const error = new Error("Test error");
            let joinRoomStub = sinon.stub(roomsService, "joinRoom");
            joinRoomStub.throws(error);
            const resultError = new Error(
                "Error adding owner to room: " + error.message
            );

            // Act
            try {
                await roomsService.startGame(id, room.settings);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(findOneStub.calledOnce).to.be.true;
            expect(caughtError).to.deep.equal(resultError);
        });
        it("should throw an error if the room is not found", async () => {
            // Arrange
            const id = "testID";

            const error = new Error("Room not found!");
            findOneStub.returns(null);

            try {
                await roomsService.startGame(id, {});
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.deep.equal(error);
        });
        it("should throw an error if the game is already in progress", async () => {
            // Arrange
            const id = "testID";
            const room = {
                in_progress: true,
            };

            findOneStub.returns(room);

            const error = new Error("Game already in progress!");

            try {
                await roomsService.startGame(id, {});
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.deep.equal(error);
        });
    });

    describe("endGame Tests", async () => {
        it("should call update the game to not be in progress", async () => {
            const id = "testID";
            const room = {
                settings: { owner_is_playing: false, werewolf_ratio: 0.25 },
                players: [
                    { game_role: "", user_id: "0" },
                    { game_role: "", user_id: "1" },
                    { game_role: "", user_id: "2" },
                ],
                in_progress: true,
            };

            findOneStub.returns(room);

            findOneAndUpdateStub.returns(room);

            // Act
            const result = await roomsService.endGame(id, room.settings);

            // Assert
            expect(findOneStub.calledTwice).to.be.true;
            expect(findOneAndUpdateStub.calledTwice).to.be.true;
            expect(result).to.equal(room);
        });
        it("should remove roles from players", async () => {
            // Arrange
            const id = "testID";
            const room = {
                settings: {
                    owner_is_playing: false,
                    werewolf_ratio: 0.25,
                },
                players: [
                    { game_role: "Werewolf", user_id: "0" },
                    { game_role: "Villager", user_id: "1" },
                    { game_role: "Villager", user_id: "2" },
                ],
                in_progress: true,
            };

            findOneStub.returns(room);

            findOneAndUpdateStub.returns(room);

            // Act
            const result = await roomsService.endGame(id, room.settings);

            // Assert
            expect(result.players[0].game_role).to.equal("");
            expect(result.players[1].game_role).to.equal("");
            expect(result.players[2].game_role).to.equal("");
        });
        it("should remove the owner if owner was playing", async () => {
            // Arrange
            const id = "testID";
            const room = {
                settings: {
                    owner_is_playing: true,
                    werewolf_ratio: 0.25,
                },
                players: [
                    { game_role: "", user_id: "0" },
                    { game_role: "", user_id: "1" },
                    { game_role: "", user_id: "2" },
                ],
                in_progress: true,
            };

            findOneStub.returns(room);

            findOneAndUpdateStub.returns(room);

            let leaveRoomStub = sinon.stub(roomsService, "leaveRoom");

            // Act
            await roomsService.endGame(id, room.settings);

            // Assert
            expect(leaveRoomStub.calledOnce).to.be.true;
        });
        it("should throw an error if the owner cannot be removed", async () => {
            // Arrange
            const id = "testID";
            const room = {
                settings: {
                    owner_is_playing: true,
                    werewolf_ratio: 0.25,
                },
                players: [
                    { game_role: "", user_id: "0" },
                    { game_role: "", user_id: "1" },
                    { game_role: "", user_id: "2" },
                ],
                in_progress: true,
            };

            findOneStub.returns(room);

            findOneAndUpdateStub.returns(room);

            const error = new Error("Test error");
            let leaveRoomStub = sinon.stub(roomsService, "leaveRoom");
            leaveRoomStub.throws(error);
            const resultError = new Error(
                "Error removing owner from room: " + error.message
            );

            // Act
            try {
                await roomsService.endGame(id, room.settings);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(findOneStub.calledOnce).to.be.true;
            expect(caughtError).to.deep.equal(resultError);
        });
        it("should throw an error if the room is not found", async () => {
            // Arrange
            const id = "testID";

            const error = new Error("Room not found!");
            findOneStub.returns(null);

            try {
                await roomsService.endGame(id, {});
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.deep.equal(error);
        });
        it("should throw an error if the game is not in progress", async () => {
            // Arrange
            const id = "testID";
            const room = {
                in_progress: false,
            };

            findOneStub.returns(room);

            const error = new Error("Game is not in progress!");

            try {
                await roomsService.endGame(id, {});
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.deep.equal(error);
        });
    });

    describe("getRole Tests", async () => {
        it("should return a role if the player has a role", async () => {
            // Arrange
            const testID = "testID";
            const testRole = "testRole";
            const room = {
                players: [{ game_role: testRole, user_id: testID }],
                in_progress: true,
            };

            findOneStub.returns(room);

            // Act
            const result = await roomsService.getRole(testID);

            // Assert
            expect(result).to.deep.equal(testRole);
        });

        it("should return an error if the game has not started", async () => {
            // Arrange
            const testID = "testID";
            const testRole = "testRole";
            const room = {
                players: [{ game_role: testRole, user_id: testID }],
                in_progress: false,
            };

            findOneStub.returns(room);

            const error = new Error("Game has not started!");

            // Act
            try {
                await roomsService.getRole(testID);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.deep.equal(error);
        });

        it("should return an error if the player is not in a room", async () => {
            // Arrange
            const testID = "testID";

            findOneStub.returns(null);

            const error = new Error("Player is not in a room!");

            // Act
            try {
                await roomsService.getRole(testID);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.deep.equal(error);
        });

        it("should return an error if the owner is making the request and the game has not started", async () => {
            // Arrange
            const testID = "testID";
            const room = {
                in_progress: false,
            };

            findOneStub.onCall(0).returns(null);
            findOneStub.onCall(1).returns(room);

            const error = new Error("Game has not started!");

            // Act
            try {
                await roomsService.getRole(testID);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.deep.equal(error);
        });

        it("should return an error if the owner is making the request and the game has not started", async () => {
            // Arrange
            const testID = "testID";
            const room = {
                in_progress: true,
            };

            findOneStub.onCall(0).returns(null);
            findOneStub.onCall(1).returns(room);

            const error = new Error("Owner is not playing!");

            // Act
            try {
                await roomsService.getRole(testID);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.deep.equal(error);
        });
    });
    describe("getOwnedRoomByID Tests", async () => {
        it("should return a room if the database finds one", async () => {
            // Arrange
            const testID = "testID";
            const testRoom = {};
            findOneStub.resolves(testRoom);

            // Act
            const result = await roomsService.getOwnedRoomByID(testID);

            // Assert
            expect(result).to.equal(testRoom);
        });
        it("should return null if the database does not find a room", async () => {
            // Arrange
            const testID = "testID";
            findOneStub.resolves(null);

            // Act
            const result = await roomsService.getOwnedRoomByID(testID);

            // Assert
            expect(result).to.be.null;
        });
        it("should throw an error if the database throws one", async () => {
            // Arrange
            const testID = "testID";
            const testError = new Error("Test Error");
            findOneStub.rejects(testError);

            // Act
            try {
                await roomsService.getOwnedRoomByID(testID);
            } catch (e) {
                caughtError = e;
            }

            // Assert
            expect(caughtError).to.equal(testError);
        });
    });
});

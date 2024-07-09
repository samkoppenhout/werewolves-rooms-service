import { expect } from "chai";
import sinon from "sinon";

import RoomsController from "../../src/controllers/Rooms.controller.js";

describe("Rooms.controller tests", async () => {
    let roomsController;
    let roomsServices;
    let req;
    let res;

    beforeEach(() => {
        roomsServices = {
            createRoom: sinon.stub(),
            getOwner: sinon.stub(),
            getPlayers: sinon.stub(),
            deleteRoom: sinon.stub(),
            joinRoom: sinon.stub(),
            leaveRoom: sinon.stub(),
            startGame: sinon.stub(),
            endGame: sinon.stub(),
            getRole: sinon.stub(),
            getOwnedRoomByID: sinon.stub(),
        };
        roomsController = new RoomsController(roomsServices);
        req = {
            headers: {},
            body: {},
            params: {},
        };
        res = {
            json: sinon.stub(),
            status: sinon.stub().returnsThis(),
            sendStatus: sinon.stub(),
        };
    });

    describe("createRoom tests", async () => {
        it("should call the service when a username and id are present", async () => {
            // Arrange
            req.body._id = "Test ID";
            req.body.username = "Test Username";

            const result = { room_code: "success" };
            roomsServices.createRoom.resolves(result);

            // Act
            await roomsController.createRoom(req, res);

            // Assert
            expect(roomsServices.createRoom.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(result)).to.be.true;
        });
        it("should fail if the id is not present", async () => {
            req.body.username = "Test Username";

            const result = { room_code: "success" };
            roomsServices.createRoom.resolves(result);

            // Act
            await roomsController.createRoom(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid ID",
                })
            ).to.be.true;
        });
        it("should fail if the username is not present", async () => {
            // Arrange
            req.body._id = "Test ID";

            const result = { room_code: "success" };
            roomsServices.createRoom.resolves(result);

            // Act
            await roomsController.createRoom(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid username",
                })
            ).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            req.body._id = "Test ID";
            req.body.username = "Test Username";

            const error = new Error("Test error");
            roomsServices.createRoom.throws(error);

            // Act
            await roomsController.createRoom(req, res);

            // Assert
            expect(roomsServices.createRoom.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
    });
    describe("getOwner tests", async () => {
        it("should call the service when a roomcode is present", async () => {
            // Arrange
            req.params.roomcode = "Test room code";

            const testOwnerID = "testOwnerID";
            roomsServices.getOwner.resolves(testOwnerID);

            // Act
            await roomsController.getOwner(req, res);

            // Assert
            expect(roomsServices.getOwner.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(testOwnerID)).to.be.true;
        });
        it("should fail if the room code is not present", async () => {
            // Act
            await roomsController.getOwner(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid room code",
                })
            ).to.be.true;
        });
        it("should fail if the owned room is null", async () => {
            // Arrange
            req.params.roomcode = "Test room code";

            roomsServices.getOwner.resolves(null);

            // Act
            await roomsController.getOwner(req, res);

            // Assert
            expect(res.status.calledWith(404)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Owner not found",
                })
            ).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            req.params.roomcode = "Test room code";

            const error = new Error("Test error");
            roomsServices.getOwner.throws(error);

            // Act
            await roomsController.getOwner(req, res);

            // Assert
            expect(roomsServices.getOwner.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
    });
    describe("getPlayers tests", async () => {
        it("should call the service when a roomcode is present", async () => {
            // Arrange
            req.params.roomcode = "Test room code";

            const testPlayerID = ["testPlayerID"];
            roomsServices.getPlayers.resolves(testPlayerID);

            // Act
            await roomsController.getPlayers(req, res);

            // Assert
            expect(roomsServices.getPlayers.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(testPlayerID)).to.be.true;
        });
        it("should fail if the room code is not present", async () => {
            // Act
            await roomsController.getPlayers(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid room code",
                })
            ).to.be.true;
        });
        it("should fail if the players call returns is null", async () => {
            // Arrange
            req.params.roomcode = "Test room code";

            roomsServices.getPlayers.resolves(null);

            // Act
            await roomsController.getPlayers(req, res);

            // Assert
            expect(res.status.calledWith(404)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "PlayerIDs not found",
                })
            ).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            req.params.roomcode = "Test room code";

            const error = new Error("Test error");
            roomsServices.getPlayers.throws(error);

            // Act
            await roomsController.getPlayers(req, res);

            // Assert
            expect(roomsServices.getPlayers.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
    });
    describe("deleteRoom tests", async () => {
        it("should call the service when a roomcode is present", async () => {
            // Arrange
            req.params.roomcode = "Test room code";

            const room = "room";
            roomsServices.deleteRoom.resolves(room);

            // Act
            await roomsController.deleteRoom(req, res);

            // Assert
            expect(roomsServices.deleteRoom.calledOnce).to.be.true;
            expect(res.status.calledWith(202)).to.be.true;
            expect(res.json.calledWith(room)).to.be.true;
        });
        it("should fail if the room code is not present", async () => {
            // Act
            await roomsController.deleteRoom(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid room code",
                })
            ).to.be.true;
        });
        it("should fail if the deleted room is null", async () => {
            // Arrange
            req.params.roomcode = "Test room code";

            roomsServices.deleteRoom.resolves(null);

            // Act
            await roomsController.deleteRoom(req, res);

            // Assert
            expect(res.status.calledWith(404)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Room not found",
                })
            ).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            req.params.roomcode = "Test room code";

            const error = new Error("Test error");
            roomsServices.deleteRoom.throws(error);

            // Act
            await roomsController.deleteRoom(req, res);

            // Assert
            expect(roomsServices.deleteRoom.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
    });
    describe("joinRoom tests", async () => {
        it("should call the service when a room code, username and id are present", async () => {
            // Arrange
            req.params.roomcode = "Test room code";
            req.body._id = "Test ID";
            req.body.username = "Test Username";

            const result = { room_code: "success" };
            roomsServices.joinRoom.resolves(result);

            // Act
            await roomsController.joinRoom(req, res);

            // Assert
            expect(roomsServices.joinRoom.calledOnce).to.be.true;
            expect(res.status.calledWith(202)).to.be.true;
        });
        it("should fail if the id is not present", async () => {
            req.params.roomcode = "Test room code";
            req.body.username = "Test Username";

            const result = { room_code: "success" };
            roomsServices.joinRoom.resolves(result);

            // Act
            await roomsController.joinRoom(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid ID",
                })
            ).to.be.true;
        });
        it("should fail if the username is not present", async () => {
            // Arrange
            req.params.roomcode = "Test room code";
            req.body._id = "Test ID";

            const result = { room_code: "success" };
            roomsServices.joinRoom.resolves(result);

            // Act
            await roomsController.joinRoom(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid username",
                })
            ).to.be.true;
        });
        it("should fail if the room code is not present", async () => {
            // Arrange
            req.body._id = "Test ID";
            req.body.username = "Test Username";

            const result = { room_code: "success" };
            roomsServices.joinRoom.resolves(result);

            // Act
            await roomsController.joinRoom(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid room code",
                })
            ).to.be.true;
        });
        it("should fail if the room to join is null", async () => {
            // Arrange
            req.params.roomcode = "Test room code";
            req.body._id = "Test ID";
            req.body.username = "Test Username";

            roomsServices.joinRoom.resolves(null);

            // Act
            await roomsController.joinRoom(req, res);

            // Assert
            expect(res.status.calledWith(404)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Room not found",
                })
            ).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            req.params.roomcode = "Test room code";
            req.body._id = "Test ID";
            req.body.username = "Test Username";

            const error = new Error("Test error");
            roomsServices.joinRoom.throws(error);

            // Act
            await roomsController.joinRoom(req, res);

            // Assert
            expect(roomsServices.joinRoom.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
    });
    describe("leaveRoom tests", async () => {
        it("should call the service when a roomcode is present", async () => {
            // Arrange
            req.body._id = "Test ID";

            const room = "room";
            roomsServices.leaveRoom.resolves(room);

            // Act
            await roomsController.leaveRoom(req, res);

            // Assert
            expect(roomsServices.leaveRoom.calledOnce).to.be.true;
            expect(res.status.calledWith(202)).to.be.true;
            expect(res.json.calledWith({ message: "Room left successfully!" }))
                .to.be.true;
        });
        it("should fail if the id is not present", async () => {
            // Act
            await roomsController.leaveRoom(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid ID",
                })
            ).to.be.true;
        });
        it("should fail if the left room is null", async () => {
            // Arrange
            req.body._id = "Test ID";

            roomsServices.leaveRoom.resolves(null);

            // Act
            await roomsController.leaveRoom(req, res);

            // Assert
            expect(res.status.calledWith(404)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Room not found",
                })
            ).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            req.body._id = "Test ID";

            const error = new Error("Test error");
            roomsServices.leaveRoom.throws(error);

            // Act
            await roomsController.leaveRoom(req, res);

            // Assert
            expect(roomsServices.leaveRoom.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
    });
    describe("startGame tests", async () => {
        it("should call the service when an id and a settings object are present", async () => {
            // Arrange
            req.body._id = "Test ID";
            req.body.settings = {};

            const result = "success";
            roomsServices.startGame.resolves(result);

            // Act
            await roomsController.startGame(req, res);

            // Assert
            expect(roomsServices.startGame.calledOnce).to.be.true;
            expect(res.status.calledWith(202)).to.be.true;
            expect(
                res.json.calledWith({ message: "Game started successfully!" })
            ).to.be.true;
        });
        it("should fail if the id is not present", async () => {
            // Arrange
            req.body.settings = {};

            const result = { room_code: "success" };
            roomsServices.startGame.resolves(result);

            // Act
            await roomsController.startGame(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid ID",
                })
            ).to.be.true;
        });
        it("should fail if the settings object is not present", async () => {
            // Arrange
            req.body._id = "Test ID";

            const result = { room_code: "success" };
            roomsServices.startGame.resolves(result);

            // Act
            await roomsController.startGame(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid settings",
                })
            ).to.be.true;
        });
        it("should fail if the room to join is null", async () => {
            // Arrange
            req.body._id = "Test ID";
            req.body.settings = {};

            roomsServices.startGame.resolves(null);

            // Act
            await roomsController.startGame(req, res);

            // Assert
            expect(res.status.calledWith(404)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Room not found",
                })
            ).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            req.body._id = "Test ID";
            req.body.settings = {};

            const error = new Error("Test error");
            roomsServices.startGame.throws(error);

            // Act
            await roomsController.startGame(req, res);

            // Assert
            expect(roomsServices.startGame.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
    });
    describe("endGame tests", async () => {
        it("should call the service when an id is present", async () => {
            // Arrange
            req.body._id = "Test ID";

            const room = "room";
            roomsServices.endGame.resolves(room);

            // Act
            await roomsController.endGame(req, res);

            // Assert
            expect(roomsServices.endGame.calledOnce).to.be.true;
            expect(res.status.calledWith(202)).to.be.true;
            expect(res.json.calledWith({ message: "Game ended successfully!" }))
                .to.be.true;
        });
        it("should fail if an id is not present", async () => {
            // Act
            await roomsController.endGame(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid ID",
                })
            ).to.be.true;
        });
        it("should fail if the ended room is null", async () => {
            // Arrange
            req.body._id = "Test ID";

            roomsServices.endGame.resolves(null);

            // Act
            await roomsController.endGame(req, res);

            // Assert
            expect(res.status.calledWith(404)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Room not found",
                })
            ).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            req.body._id = "Test ID";

            const error = new Error("Test error");
            roomsServices.endGame.throws(error);

            // Act
            await roomsController.endGame(req, res);

            // Assert
            expect(roomsServices.endGame.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
    });
    describe("getRole tests", async () => {
        it("should call the service when an id is present", async () => {
            // Arrange
            req.params.id = "Test ID";

            const role = "role";
            roomsServices.getRole.resolves(role);

            // Act
            await roomsController.getRole(req, res);

            // Assert
            expect(roomsServices.getRole.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(role)).to.be.true;
        });
        it("should fail if an id is not present", async () => {
            // Act
            await roomsController.getRole(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid ID",
                })
            ).to.be.true;
        });
        it("should fail if the role is null", async () => {
            // Arrange
            req.params.id = "Test ID";

            roomsServices.getRole.resolves(null);

            // Act
            await roomsController.getRole(req, res);

            // Assert
            expect(res.status.calledWith(404)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Role not found",
                })
            ).to.be.true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            req.params.id = "Test ID";

            const error = new Error("Test error");
            roomsServices.getRole.throws(error);

            // Act
            await roomsController.getRole(req, res);

            // Assert
            expect(roomsServices.getRole.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
    });
    describe("getOwnedRoomByID tests", async () => {
        it("should call the service when an id is present", async () => {
            // Arrange
            req.params.id = "Test ID";

            const room = "room";
            roomsServices.getOwnedRoomByID.resolves(room);

            // Act
            await roomsController.getOwnedRoomByID(req, res);

            // Assert
            expect(roomsServices.getOwnedRoomByID.calledOnce).to.be.true;
            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(room)).to.be.true;
        });
        it("should fail if an id is not present", async () => {
            // Act
            await roomsController.getOwnedRoomByID(req, res);

            // Assert
            expect(res.status.calledWith(400)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Invalid ID",
                })
            ).to.be.true;
        });
        it("should fail if the room is null", async () => {
            // Arrange
            req.params.id = "Test ID";

            roomsServices.getOwnedRoomByID.resolves(null);

            // Act
            await roomsController.getOwnedRoomByID(req, res);

            // Assert
            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith({ message: "Room not found" })).to.be
                .true;
        });
        it("should throw an error if the service errors", async () => {
            // Arrange
            req.params.id = "Test ID";

            const error = new Error("Test error");
            roomsServices.getOwnedRoomByID.throws(error);

            // Act
            await roomsController.getOwnedRoomByID(req, res);

            // Assert
            expect(roomsServices.getOwnedRoomByID.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(
                res.json.calledWith({
                    message: "Test error",
                })
            ).to.be.true;
        });
    });
});

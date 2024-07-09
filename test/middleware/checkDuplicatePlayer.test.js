import { expect } from "chai";
import sinon from "sinon";

import Rooms from "../../src/models/Rooms.model.js";
import checkDuplicatePlayer from "../../src/middleware/checkDuplicatePlayer.js";

describe("checkDuplicatePlayer tests", async () => {
    let findOneStub;
    let req;
    let res;
    let next;
    let nextCalled;

    beforeEach(() => {
        findOneStub = sinon.stub(Rooms, "findOne");
        req = {
            headers: {},
            body: { _id: "testID" },
            params: {},
        };
        res = {
            json: sinon.stub(),
            status: sinon.stub().returnsThis(),
            sendStatus: sinon.stub(),
        };
        nextCalled = false;
        next = () => {
            nextCalled = true;
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should call next if there is no room containing that user", async () => {
        // Arrange
        findOneStub.resolves(null);

        // Act
        await checkDuplicatePlayer(req, res, next);

        // Assert
        expect(nextCalled).to.be.true;
        expect(res.status.called).to.be.false;
        expect(res.json.called).to.be.false;
    });
    it("should return 400 if the user is already a player in a room", async () => {
        // Arrange
        findOneStub
            .onFirstCall()
            .resolves({ players: [{ user_id: "user123" }] });

        // Act
        await checkDuplicatePlayer(req, res, next);

        // Assert
        expect(nextCalled).to.be.false;
        expect(res.status.calledOnceWith(400)).to.be.true;
        expect(
            res.json.calledOnceWith({
                message: "Could not join room: User is already in a room!",
            })
        ).to.be.true;
    });
    it("should return 400 if the user is the owner of a room", async () => {
        // Arrange
        findOneStub.onFirstCall().resolves(null);
        findOneStub.onSecondCall().resolves({ owner_id: "user123" });

        // Act
        await checkDuplicatePlayer(req, res, next);

        // Assert
        expect(nextCalled).to.be.false;
        expect(res.status.calledOnceWith(400)).to.be.true;
        expect(
            res.json.calledOnceWith({
                message: "Could not join room: User is already in a room!",
            })
        ).to.be.true;
    });
    it("should throw and error if the find request returns an error", async () => {
        // Arrange
        const error = new Error("Database error");
        findOneStub.rejects(error);

        // Act
        await checkDuplicatePlayer(req, res, next);

        // Assert
        expect(nextCalled).to.be.false;
        expect(res.status.calledOnceWith(500)).to.be.true;
        expect(res.json.calledOnceWith({ message: error.message })).to.be.true;
    });
});

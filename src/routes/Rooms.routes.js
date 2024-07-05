import { Router } from "express";
import { body } from "express-validator";
import RoomsController from "../controllers/Rooms.controller.js";
import checkDuplicateRoomOwner from "../middleware/checkDuplicateRoomOwner.js";
import checkDuplicatePlayer from "../middleware/checkDuplicatePlayer.js";

export default class RoomsRoutes {
    #controller;
    #router;
    #routeStartPoint;

    constructor(controller = new RoomsController(), routeStartPoint = "/") {
        this.#controller = controller;
        this.#routeStartPoint = routeStartPoint;
        this.#router = Router();
        this.#initialiseRoutes();
    }

    #initialiseRoutes = () => {
        this.#router.put(
            "/rooms/create",
            [
                body("_id").exists().withMessage("ID is required.").escape(),
                body("username")
                    .exists()
                    .withMessage("Username is required.")
                    .escape(),
                checkDuplicateRoomOwner,
            ],
            this.#controller.createRoom
        );

        this.#router.get(
            "/rooms/:roomcode/getowner",
            this.#controller.getOwner
        );

        this.#router.get(
            "/rooms/:roomcode/getplayers",
            this.#controller.getPlayers
        );

        this.#router.delete(
            "/rooms/:roomcode/delete",
            this.#controller.deleteRoom
        );

        this.#router.post(
            "/rooms/:roomcode/join",
            [
                body("_id").exists().withMessage("ID is required.").escape(),
                body("username")
                    .exists()
                    .withMessage("Username is required.")
                    .escape(),
                checkDuplicatePlayer,
            ],
            this.#controller.joinRoom
        );

        this.#router.post(
            "/rooms/leave",
            [body("_id").exists().withMessage("ID is required.").escape()],
            this.#controller.leaveRoom
        );

        this.#router.post(
            "/rooms/startgame",
            [
                body("_id").exists().withMessage("ID is required.").escape(),
                body("settings")
                    .exists()
                    .withMessage("Settings object is required."),
            ],
            this.#controller.startGame
        );

        this.#router.post(
            "/rooms/endgame",
            [body("_id").exists().withMessage("ID is required.").escape()],
            this.#controller.endGame
        );

        this.#router.get("/rooms/:id/getrole", this.#controller.getRole);
        this.#router.get(
            "/rooms/:id/getOwnedRoom",
            this.#controller.getOwnedRoomByID
        );
    };

    getRouter = () => {
        return this.#router;
    };

    getRouteStartPoint = () => {
        return this.#routeStartPoint;
    };
}

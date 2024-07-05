import RoomsService from "../services/Rooms.service.js";

export default class RoomsController {
    #service;

    constructor(service = new RoomsService()) {
        this.#service = service;
    }

    createRoom = async (req, res) => {
        try {
            const { _id: id, username } = req.body;

            if (!id) {
                return res.status(400).json({ message: "Invalid ID" });
            }

            if (!username) {
                return res.status(400).json({ message: "Invalid username" });
            }

            const createdRoom = await this.#service.createRoom(id, username);

            return res.status(201).json({
                room_code: createdRoom.room_code,
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    };

    getOwner = async (req, res) => {
        try {
            const roomCode = req.params.roomcode;
            if (!roomCode)
                return res.status(400).json({ message: "Invalid room code" });

            const ownerID = await this.#service.getOwner(roomCode);

            if (!ownerID)
                return res.status(404).json({ message: "Owner not found" });

            return res.status(201).json(ownerID);
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    };

    getPlayers = async (req, res) => {
        try {
            const roomCode = req.params.roomcode;
            if (!roomCode)
                return res.status(400).json({ message: "Invalid room code" });

            const playerIDs = await this.#service.getPlayers(roomCode);

            if (!playerIDs)
                return res.status(404).json({ message: "PlayerIDs not found" });

            return res.status(201).json(playerIDs);
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    };

    deleteRoom = async (req, res) => {
        try {
            const roomCode = req.params.roomcode;
            if (!roomCode)
                return res.status(400).json({ message: "Invalid room code" });

            const room = await this.#service.deleteRoom(roomCode);

            if (!room)
                return res.status(404).json({ message: "Room not found" });

            return res.status(202).json(room);
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    };

    joinRoom = async (req, res) => {
        try {
            const roomCode = req.params.roomcode;
            if (!roomCode)
                return res.status(400).json({ message: "Invalid room code" });

            const userID = req.body._id;
            if (!userID) return res.status(400).json({ message: "Invalid ID" });

            const username = req.body.username;
            if (!username)
                return res.status(400).json({ message: "Invalid username" });

            const room = await this.#service.joinRoom(
                roomCode,
                userID,
                username
            );

            if (!room)
                return res.status(404).json({ message: "Room not found" });

            return res
                .status(202)
                .json({ message: "Room joined successfully!" });
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    };

    leaveRoom = async (req, res) => {
        try {
            const userID = req.body._id;

            if (!userID) return res.status(400).json({ message: "Invalid ID" });

            const room = await this.#service.leaveRoom(userID);

            if (!room)
                return res.status(404).json({ message: "Room not found" });

            return res.status(202).json({ message: "Room left successfully!" });
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    };

    startGame = async (req, res) => {
        try {
            const userID = req.body._id;
            if (!userID) return res.status(400).json({ message: "Invalid ID" });

            const settings = req.body.settings;
            if (!settings)
                return res.status(400).json({ message: "Invalid settings" });

            const room = await this.#service.startGame(userID, settings);

            if (!room)
                return res.status(404).json({ message: "Room not found" });

            return res
                .status(202)
                .json({ message: "Game started successfully!" });
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    };

    endGame = async (req, res) => {
        try {
            const userID = req.body._id;
            if (!userID) return res.status(400).json({ message: "Invalid ID" });

            const room = await this.#service.endGame(userID);

            if (!room)
                return res.status(404).json({ message: "Room not found" });

            return res
                .status(202)
                .json({ message: "Game ended successfully!" });
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    };

    getRole = async (req, res) => {
        try {
            const userID = req.params.id;

            if (!userID) return res.status(400).json({ message: "Invalid ID" });

            const role = await this.#service.getRole(userID);

            if (!role)
                return res.status(404).json({ message: "Role not found" });

            return res.status(201).json(role);
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    };

    getOwnedRoomByID = async (req, res) => {
        try {
            const userID = req.params.id;
            if (!userID) return res.status(400).json({ message: "Invalid ID" });

            const room = await this.#service.getOwnedRoomByID(userID);

            if (!room)
                return res.status(404).json({ message: "Room not found" });

            return res.status(201).json(room);
        } catch (e) {
            return res.status(500).json({ message: e.message });
        }
    };
}

import Rooms from "../models/Rooms.model.js";

export default class RoomsService {
    createRoom = async (id, username) => {
        const roomCode = await this.#newRoomCode();
        const room = new Rooms({
            room_code: roomCode,
            owner_id: id,
            owner_username: username,
            players: [],
        });
        await room.save();
        return room;
    };

    getOwner = async (roomCode) => {
        const room = await Rooms.findOne({ room_code: roomCode });
        if (!room) throw new Error("Room not found");
        return room.owner_id;
    };

    getPlayers = async (roomCode) => {
        const room = await Rooms.findOne({ room_code: roomCode });
        if (!room) throw new Error("Room not found");
        return room.players.map((player) => player.user_id);
    };

    deleteRoom = async (roomCode) => {
        const user = await Rooms.findOne({ room_code: roomCode });
        if (!user) {
            throw new Error("Room not found");
        }
        return await Rooms.findOneAndDelete({ room_code: roomCode });
    };

    joinRoom = async (roomCode, id, username) => {
        let room = await Rooms.findOne({ "players.username": username });
        if (room) {
            throw new Error("Username already taken!");
        }

        room = await Rooms.findOne({ room_code: roomCode });
        if (!room) {
            throw new Error("Room code not recognised!");
        }

        if (room.in_progress) {
            throw new Error("Game in progress!");
        }

        return await Rooms.findOneAndUpdate(
            { room_code: roomCode },
            {
                $push: {
                    players: { user_id: id, username: username },
                },
            },
            { new: true }
        );
    };

    leaveRoom = async (id) => {
        console.log(id);
        return await Rooms.findOneAndUpdate(
            { "players.user_id": id },
            {
                $pull: {
                    players: { user_id: id },
                },
            },
            { new: true }
        );
    };

    startGame = async (id, settings) => {
        let room = await Rooms.findOne({ owner_id: id });
        if (!room) {
            throw new Error("Room not found!");
        }
        if (room.in_progress) {
            throw new Error("Game already in progress!");
        }
        room = await this.#updateSettingsOnStart(id, settings);
        if (room.settings.owner_is_playing) {
            await this.#addOwner(room);
        }
        await this.#assignRoles(id);
        room = await this.#updateInProgressOnStart(id);
        return room;
    };

    endGame = async (id) => {
        let room = await Rooms.findOne({ owner_id: id });
        if (!room) {
            throw new Error("Room not found!");
        }
        if (!room.in_progress) {
            throw new Error("Game is not in progress!");
        }
        if (room.settings.owner_is_playing) {
            await this.#removeOwner(room);
        }
        await this.#unassignRoles(id);
        room = await this.#updateInProgressOnEnd(id);
        return room;
    };

    getRole = async (id) => {
        let role;
        let ownedRoom;
        const room = await Rooms.findOne({
            "players.user_id": id,
        });
        if (!room) {
            ownedRoom = await Rooms.findOne({ owner_id: id });
        }
        if (ownedRoom) {
            throw new Error("Game has not started!");
        }
        if (!room) {
            throw new Error("Player is not in a room!");
        }
        if (!room.in_progress) {
            throw new Error("Game has not started!");
        }
        room.players.forEach((player) => {
            if (player.user_id === id) {
                role = player.game_role;
            }
        });
        return role;
    };

    #newRoomCode = async () => {
        let roomCode;
        let roomByRoomCode;
        do {
            roomCode = this.#generateRoomCodeString();
            roomByRoomCode = await Rooms.findOne({
                room_code: roomCode,
            }).exec();
        } while (roomByRoomCode);
        return roomCode;
    };

    #generateRoomCodeString = () => {
        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return result;
    };

    #updateSettingsOnStart = async (id, settings) => {
        return await Rooms.findOneAndUpdate(
            { owner_id: id },
            {
                settings: settings,
            },
            { new: true }
        );
    };

    #assignRoles = async (id) => {
        const room = await Rooms.findOne({ owner_id: id });
        if (!room) {
            throw new Error("Room not found!");
        }

        const numberOfWerewolves = Math.max(
            Math.floor(room.players.length * room.settings.werewolf_ratio),
            1
        );

        const playerArray = this.#assignRoleNames(
            this.#shuffleArray(room.players),
            numberOfWerewolves
        );

        const roomWithRoles = await Rooms.findOneAndUpdate(
            { owner_id: id },
            {
                players: playerArray,
            },
            { new: true }
        );
        if (!roomWithRoles) {
            throw new Error("Room not found!");
        }
        return roomWithRoles;
    };

    #shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    #assignRoleNames = (playerArray, numberOfWerewolves) => {
        for (let i = 0; i < numberOfWerewolves; i++) {
            playerArray[i].game_role = "Werewolf";
        }

        for (let i = numberOfWerewolves; i < playerArray.length; i++) {
            playerArray[i].game_role = "Villager";
        }

        return playerArray;
    };

    #updateInProgressOnStart = async (id) => {
        return await Rooms.findOneAndUpdate(
            { owner_id: id },
            {
                in_progress: true,
            },
            { new: true }
        );
    };

    #addOwner = async (room) => {
        try {
            console.log(room);
            await this.joinRoom(
                room.room_code,
                room.owner_id,
                room.owner_username
            );
        } catch (e) {
            throw new Error("Error adding owner to room: " + e.message);
        }
    };

    #removeOwner = async (room) => {
        try {
            await this.leaveRoom(room.owner_id);
        } catch (e) {
            throw new Error("Error removing owner from room!");
        }
    };

    #unassignRoles = async (id) => {
        const room = await Rooms.findOne({ owner_id: id });
        if (!room) {
            throw new Error("Room not found!");
        }

        const playerArray = room.players;
        playerArray.forEach((player) => {
            player.game_role = "";
        });

        const roomWithoutRoles = await Rooms.findOneAndUpdate(
            { owner_id: id },
            {
                players: playerArray,
            },
            { new: true }
        );
        if (!roomWithoutRoles) {
            throw new Error("Room not found!");
        }
        return roomWithoutRoles;
    };

    #updateInProgressOnEnd = async (id) => {
        return await Rooms.findOneAndUpdate(
            { owner_id: id },
            {
                in_progress: false,
            },
            { new: true }
        );
    };

    getOwnedRoomByID = async (id) => {
        const room = await Rooms.findOne({ owner_id: id });
        return room;
    };
}

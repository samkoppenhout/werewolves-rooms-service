import { Schema, model } from "mongoose";

const roomsSchema = new Schema({
    room_code: { type: String, required: true },
    owner_id: { type: String, required: true },
    owner_username: { type: String, required: true },
    settings: {
        werewolf_ratio: { type: Number, default: 0.25 },
        owner_is_playing: { type: Boolean, default: true },
    },
    in_progress: { type: Boolean, default: false },
    players: [
        {
            user_id: { type: String, required: true },
            username: { type: String, required: true },
            game_role: { type: String, default: "" },
        },
    ],
});

const Rooms = model("rooms", roomsSchema);

export default Rooms;

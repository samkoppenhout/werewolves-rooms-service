import Rooms from "../models/Rooms.model.js";

const checkDuplicatePlayer = async (req, res, next) => {
    try {
        let roomByRoomUser = await Rooms.findOne({
            "players.user_id": req.body._id,
        });

        if (!roomByRoomUser) {
            roomByRoomUser = await Rooms.findOne({
                owner_id: req.body._id,
            });
        }

        if (!roomByRoomUser) {
            next();
        } else {
            return res.status(400).json({
                message: `Could not join room: User is already in a room!`,
            });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export default checkDuplicatePlayer;

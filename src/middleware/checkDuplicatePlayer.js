import Rooms from "../models/Rooms.model.js";

const checkDuplicatePlayer = async (req, res, next) => {
    try {
        let roomByRoomUser = await Rooms.findOne({
            "players.user_id": req.body._id,
        }).exec();

        if (!roomByRoomUser) {
            roomByRoomUser = await Rooms.findOne({
                owner_id: req.body._id,
            }).exec();
        }

        if (!roomByRoomUser) {
            next();
        } else {
            return res.status(400).send({
                message: `Could not join room: User is already in a room!`,
            });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

export default checkDuplicatePlayer;

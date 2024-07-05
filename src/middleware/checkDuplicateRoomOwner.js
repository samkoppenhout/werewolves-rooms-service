import Rooms from "../models/Rooms.model.js";

const checkDuplicateRoomOwner = async (req, res, next) => {
    try {
        const roomByRoomOwner = await Rooms.findOne({
            owner_id: req.body._id,
        }).exec();
        if (roomByRoomOwner) {
            return res.status(400).send({
                message: `Could not create room: User already owns a room!`,
            });
        }
        next();
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

export default checkDuplicateRoomOwner;

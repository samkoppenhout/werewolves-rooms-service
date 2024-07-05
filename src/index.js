import Config from "./config/Config.js";
import Database from "./db/Database.js";
import Server from "./server/Server.js";
import RoomsRoutes from "./routes/Rooms.routes.js";

Config.load();
const { PORT, HOST, DB_URI } = process.env;

const roomsRoutes = new RoomsRoutes();

const server = new Server(PORT, HOST, roomsRoutes);
const database = new Database(DB_URI);

server.start();
database.connect();

console.log(process.env);

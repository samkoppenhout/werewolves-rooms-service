import express from "express";
import cors from "cors";
import morgan from "morgan";

export default class Server {
    #app;
    #host;
    #port;
    #router;
    #server;

    constructor(port, host, router) {
        this.#app = express();
        this.#port = port;
        this.#host = host;
        this.#server = null;
        this.#router = router;
    }

    getApp = () => {
        return this.#app;
    };

    start() {
        this.#app.use(cors({ origin: "http://localhost:3003" }));
        this.#app.use(morgan("tiny"));
        this.#app.use(express.json());
        this.#app.use(express.urlencoded({ extended: true }));

        this.#app.use(
            this.#router.getRouteStartPoint(),
            this.#router.getRouter()
        );

        this.#server = this.#app.listen(this.#port, this.#host, () => {
            console.log(
                `Server is listening on http://${this.#host}:${this.#port}`
            );
        });
    }

    close() {
        this.#server?.close();
    }
}

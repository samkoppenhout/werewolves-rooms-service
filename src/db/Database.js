import mongoose from "mongoose";

export default class Database {
    #connectionAttempts = 0;
    #uri;
    #maxAttempts = 10;
    #retryDelay = 1000;

    constructor(uri) {
        this.#uri = uri;
    }

    connect = async () => {
        while (this.#connectionAttempts < this.#maxAttempts) {
            try {
                this.#connectionAttempts++;
                await mongoose.connect(this.#uri);
                console.log(
                  `Database connection to ${this.#uri} (DB: ${
                    mongoose.connection.db.databaseName
                  }) was successful`
                );
                return;
            } catch (e) {
                console.log(`Database connection error (attempt ${this.#connectionAttempts}):`, e);
                if (this.#connectionAttempts >= this.#maxAttempts) {
                    console.log(`Database unavailable after ${this.#maxAttempts} attempts`);
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, this.#retryDelay));
            }
        }
    };

    close = async () => {
        try {
            await mongoose.disconnect();
            console.log("Database connection closed");
        } catch (e) {
            console.log("Error closing the database connection", e);
        }
    };
}
import 'reflect-metadata';
import Server from "./server";

(async () => {
    const server: Server = new Server();
    await server.start();
})();

const express = require("express");
var cors = require("cors");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.appRoutes = {
      items: "/api/items",
    };

    this.middlewares();

    this.routes();
  }

  middlewares() {
    //CORS
    this.app.use(cors());

    //LECTURA Y PARSEO DEL BODY
    this.app.use(express.json());
  }

  routes() {
    this.app.use(this.appRoutes.items, require("../routes/items"));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log("Servidor corriendo en puerto", this.port);
    });
  }
}

module.exports = Server;

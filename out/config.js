"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// you have to update this config file to your own Postgres Database
exports.config = {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: 'super',
    database: "postgres",
    connection_limit: 100
};

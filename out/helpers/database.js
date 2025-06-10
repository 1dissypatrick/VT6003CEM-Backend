"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
exports.testConnection = testConnection;
exports.run_query = run_query;
exports.run_insert = run_insert;
exports.run_update = run_update;
exports.run_delete = run_delete;
const sequelize_1 = require("sequelize");
const config_1 = require("../config");
exports.sequelize = new sequelize_1.Sequelize(config_1.config.database, config_1.config.user, config_1.config.password, {
    host: config_1.config.host,
    port: config_1.config.port,
    dialect: 'postgres',
    logging: false,
});
function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.sequelize.authenticate();
            console.log('Database connection established successfully');
        }
        catch (error) {
            console.error('Unable to connect to the database:', error);
            throw error;
        }
    });
}
function run_query(query, values) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const options = {
                replacements: values,
                type: 'SELECT',
            };
            console.log('Executing query:', query, 'with values:', values);
            const [results] = yield exports.sequelize.query(query, options);
            return (results !== null && results !== void 0 ? results : []);
        }
        catch (error) {
            console.error(`Query failed: ${query}`, 'Values:', values, 'Error:', error);
            throw error;
        }
    });
}
function run_insert(query, values) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const options = { replacements: values, type: 'INSERT' };
            console.log('Executing insert:', query, 'with values:', values);
            const [results] = yield exports.sequelize.query(query, options);
            return results[0];
        }
        catch (error) {
            console.error(`Insert failed: ${query}`, 'Values:', values, 'Error:', error);
            throw error;
        }
    });
}
function run_update(query, values) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const options = { replacements: values, type: 'UPDATE' };
            console.log('Executing update:', query, 'with values:', values);
            const [results] = yield exports.sequelize.query(query, options);
            return results;
        }
        catch (error) {
            console.error(`Update failed: ${query}`, 'Values:', values, 'Error:', error);
            throw error;
        }
    });
}
function run_delete(query, values) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const options = { replacements: values, type: 'DELETE' };
            console.log('Executing delete:', query, 'with values:', values);
            const [, metadata] = yield exports.sequelize.query(query, options);
            return { rowCount: metadata.rowCount || 0 };
        }
        catch (error) {
            console.error(`Delete failed: ${query}`, 'Values:', values, 'Error:', error);
            throw error;
        }
    });
}

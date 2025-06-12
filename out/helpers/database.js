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
                type: sequelize_1.QueryTypes.SELECT,
                raw: true,
            };
            console.log('run_query: Executing query:', query, 'with values:', values);
            const results = yield exports.sequelize.query(query, options);
            console.log('run_query: Raw Sequelize results:', results);
            const rows = Array.isArray(results[0]) ? results[0] : results;
            console.log('run_query: Extracted rows:', rows);
            const resultArray = Array.isArray(rows) ? rows : rows ? [rows] : [];
            console.log('run_query: Processed results:', resultArray);
            return resultArray;
        }
        catch (error) {
            console.error('run_query: Failed:', query, 'Values:', values, 'Error:', error);
            throw error;
        }
    });
}
function run_insert(query, values) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const options = { replacements: values, type: sequelize_1.QueryTypes.INSERT };
            console.log('run_insert: Query:', query, 'with values:', values);
            const [results] = yield exports.sequelize.query(query, options);
            console.log('run_insert: Results:', results);
            return results[0];
        }
        catch (error) {
            console.error('run_insert: Failed:', query, 'Values:', values, 'Error:', error);
            throw error;
        }
    });
}
function run_update(query, values) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const options = { replacements: values, type: sequelize_1.QueryTypes.UPDATE };
            console.log('run_update: Query:', query, 'with values:', values);
            const [results] = yield exports.sequelize.query(query, options);
            console.log('run_update: Results:', results);
            return Array.isArray(results) ? results : [];
        }
        catch (error) {
            console.error('run_update: Failed:', query, 'Values:', error);
            throw error;
        }
    });
}
function run_delete(query, values) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const options = { replacements: values, type: sequelize_1.QueryTypes.DELETE };
            console.log('run_delete: Original query:', query, 'with values:', values);
            const modifiedQuery = query.trim() + ' RETURNING id';
            console.log('run_delete: Executing query:', modifiedQuery, 'with values:', values);
            const results = yield exports.sequelize.query(modifiedQuery, options);
            console.log('run_delete: Raw results:', results);
            const rows = Array.isArray(results[0]) ? results[0] : results;
            const rowsAffected = Array.isArray(rows) ? rows.length : 0;
            console.log('run_delete: Rows affected:', rowsAffected);
            return { rowsAffected };
        }
        catch (error) {
            console.error('run_delete: Failed:', query, 'Values:', values, 'Error:', error);
            throw error;
        }
    });
}

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
const redis_1 = require("redis");
const REDIS_URL = process.env.REDIS_URL;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post('/find_match', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = (0, redis_1.createClient)({ url: REDIS_URL });
    client.on('error', (err) => console.log('Redis Client Error', err));
    yield client.connect();
    console.log('Redis client connected succesfully.');
    const walletAddress = req.body.walletAddress;
    const peerID = req.body.peerID;
    const category = req.body.category;
    console.log(req.body);
    // entry={category: number, peerID: string, walletAddress: string}
    // check if there is an entry with category ID = requested category
    const entry = yield client.get(category.toString());
    console.log(entry);
    if (entry) {
        // delete entry
        yield client.del(category);
        return res.status(200).json(entry);
    }
    else {
        // if entry doesn't exist
        // create entry
        yield client.set(category, JSON.stringify({ peerID, walletAddress, category }));
        return res.status(200).json();
    }
}));
app.get('/alive', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('alive request');
    res.send('alive');
}));
console.log('Listening on port 5000');
app.listen(5000);

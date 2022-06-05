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
    // entry={category: number, peerID: string, walletAddress: string}
    // delete entries from old categories of the user
    // go through all entries and delete all entries where walletAddress is the same
    const keys = yield client.sendCommand(["keys", "*"]);
    if (keys) {
        const allCategories = keys.toString().split(",");
        console.log(allCategories);
        // console.log(keys?.toString())
        if (allCategories) {
            let len = allCategories.length;
            for (var i = 0; i < len; i++) {
                const entry = yield client.get(allCategories[i].toString());
                if (entry) {
                    const encodedEntry = JSON.parse(entry);
                    if (encodedEntry.walletAddress == walletAddress) {
                        yield client.del(allCategories[i].toString());
                    }
                }
            }
        }
    }
    // check if there is an entry with category ID = requested category
    const entry = yield client.get(category.toString());
    console.log(entry);
    if (entry) {
        // delete entry
        const encodedEntry = JSON.parse(entry);
        console.log("encoded entry", entry);
        // check if the wallet address of the entry is the same as the request wallet address
        if (encodedEntry.walletAddress == walletAddress) {
            yield client.set(category.toString(), JSON.stringify({ peerID, walletAddress, category }));
            return res.status(200).json();
        }
        else {
            yield client.del(category.toString());
            return res.status(200).json(JSON.parse(entry));
        }
    }
    else {
        // if entry doesn't exist
        // create entry
        yield client.set(category.toString(), JSON.stringify({ peerID, walletAddress, category }));
        return res.status(200).json();
    }
}));
app.post('/delete_entries', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = (0, redis_1.createClient)({ url: REDIS_URL });
    client.on('error', (err) => console.log('Redis Client Error', err));
    yield client.connect();
    console.log('Redis client connected succesfully.');
    const walletAddress = req.body.walletAddress;
    const peerID = req.body.peerID;
    const category = req.body.category;
    // entry={category: number, peerID: string, walletAddress: string}
    // delete entries from old categories of the user
    // go through all entries and delete all entries where walletAddress is the same
    const keys = yield client.sendCommand(["keys", "*"]);
    if (keys) {
        const allCategories = keys.toString().split(",");
        console.log(allCategories);
        // console.log(keys?.toString())
        if (allCategories) {
            let len = allCategories.length;
            for (var i = 0; i < len; i++) {
                const entry = yield client.get(allCategories[i].toString());
                if (entry) {
                    const encodedEntry = JSON.parse(entry);
                    if (encodedEntry.walletAddress == walletAddress) {
                        yield client.del(allCategories[i].toString());
                    }
                }
            }
            res.status(200);
        }
    }
}));
app.get('/alive', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('alive request');
    res.send('alive');
}));
console.log('Listening on port 5000');
app.listen(5000);

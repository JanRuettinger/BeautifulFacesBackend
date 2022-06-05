import express, { Express, Request, Response } from 'express';
import cors from 'cors';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import { createClient } from 'redis'

const REDIS_URL = process.env.REDIS_URL

const app: Express = express();
app.use(cors());
app.use(express.json());

app.post('/find_match', async (req: Request, res: Response) => {

  const client = createClient({ url: REDIS_URL })
    client.on('error', (err) => console.log('Redis Client Error', err))
    await client.connect()
    console.log('Redis client connected succesfully.')


  const walletAddress = req.body.walletAddress;
  const peerID = req.body.peerID;
  const category = req.body.category;

  // entry={category: number, peerID: string, walletAddress: string}


  // delete entries from old categories of the user
    // go through all entries and delete all entries where walletAddress is the same
    const keys = await client.sendCommand(["keys","*"]);
    if(keys){
      const allCategories = keys.toString().split(",")
      console.log(allCategories)
    // console.log(keys?.toString())
    if(allCategories){
      let len = allCategories.length
      for(var i = 0; i < len; i++) {
        const entry = await client.get(allCategories[i].toString())
        if(entry){
          const encodedEntry = JSON.parse(entry)
          if(encodedEntry.walletAddress == walletAddress){
            await client.del(allCategories[i].toString())
        }
        }
      }
    }
  }


  // check if there is an entry with category ID = requested category
  const entry = await client.get(category.toString())
  console.log(entry)

  if(entry){
    // delete entry
    const encodedEntry = JSON.parse(entry)
    console.log("encoded entry", entry)

    // check if the wallet address of the entry is the same as the request wallet address
    if(encodedEntry.walletAddress == walletAddress){
      await client.set(category.toString(), JSON.stringify({peerID, walletAddress, category})) 
      return res.status(200).json()
    } else {
      await client.del(category.toString())
      return res.status(200).json(JSON.parse(entry))
    }
  } else {
  // if entry doesn't exist
    // create entry
    await client.set(category.toString(), JSON.stringify({peerID, walletAddress, category}))
    return res.status(200).json()
  }

});


app.post('/delete_entries', async (req: Request, res: Response) => {
  const client = createClient({ url: REDIS_URL })
  client.on('error', (err) => console.log('Redis Client Error', err))
  await client.connect()
  console.log('Redis client connected succesfully.')


const walletAddress = req.body.walletAddress;
const peerID = req.body.peerID;
const category = req.body.category;

// entry={category: number, peerID: string, walletAddress: string}


// delete entries from old categories of the user
  // go through all entries and delete all entries where walletAddress is the same
  const keys = await client.sendCommand(["keys","*"]);
  if(keys){
    const allCategories = keys.toString().split(",")
    console.log(allCategories)
  // console.log(keys?.toString())
  if(allCategories){
    let len = allCategories.length
    for(var i = 0; i < len; i++) {
      const entry = await client.get(allCategories[i].toString())
      if(entry){
        const encodedEntry = JSON.parse(entry)
        if(encodedEntry.walletAddress == walletAddress){
          await client.del(allCategories[i].toString())
      }
      }
    }

    res.status(200)
}}})

app.get('/alive', async (req: Request, res: Response) => {
  console.log('alive request');
  res.send('alive');
});

console.log('Listening on port 5000');
app.listen(5000);

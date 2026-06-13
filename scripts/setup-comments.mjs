import { Client, Databases, Permission, Role, IndexType } from 'node-appwrite';
import dotenv from "dotenv";
dotenv.config();

const ENDPOINT    = 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID  = process.env.VITE_APPWRITE_PROJECT_ID ||'69a4504700384d63b782';
const API_KEY     = process.env.VITE_APPWRITE_API_KEY || 'standard_5753c1d0cdcd1d8266d844abd92924fa595e29ccdf268eccc22b729d35e1a7b7db7f91a6d557c833e4a9bb2b427280ca866fc9b2f5fadf718361f891601cb0e37f7135f3276f9ed5898172fcfea373a6bd443b09ae13aa9f9c481cc8f67e0bf29100111e11bf0edc79229e6b0f558068e8ef8c301d6d6ebe99dde2c1400ef6c1';

const DATABASE_ID          = 'skill-issue-db';
const COMMENTS_COLLECTION_ID = 'comments';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const db = new Databases(client);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function safeCreate(label, fn) {
    try {
        const result = await fn();
        console.log(`  ${label}`);
        return result;
    } catch (err) {
        if (err?.code === 409) {
            console.log(`   ${label} — already exists, skipping`);
        } else {
            console.error(`   ${label} — ${err.message}`);
            throw err;
        }
    }
}

async function main() {

    await safeCreate('Collection: comments', () =>
        db.createCollection(
            DATABASE_ID,
            COMMENTS_COLLECTION_ID,
            'comments',
            [
                Permission.read(Role.any()),      
                Permission.create(Role.users()),   
                
            ],
            true  
        )
    );
    await sleep(500);


    const attrs = [

        () => db.createStringAttribute(DATABASE_ID, COMMENTS_COLLECTION_ID, 'skill_id',    512,  true),
        
        () => db.createStringAttribute(DATABASE_ID, COMMENTS_COLLECTION_ID, 'skill_type',   16,  true),
        
        () => db.createStringAttribute(DATABASE_ID, COMMENTS_COLLECTION_ID, 'user_id',      36,  true),
        
        () => db.createStringAttribute(DATABASE_ID, COMMENTS_COLLECTION_ID, 'username',     64,  true),
        
        () => db.createUrlAttribute   (DATABASE_ID, COMMENTS_COLLECTION_ID, 'avatar_url',        false),
       
        () => db.createStringAttribute(DATABASE_ID, COMMENTS_COLLECTION_ID, 'body',        2000, true),
    ];

    for (const fn of attrs) {
        await fn()
            .then(() => console.log(' attribute created'))
            .catch(err => {
                if (err?.code === 409) console.log('  attribute exists');
                else throw err;
            });
        await sleep(300);
    }
    await sleep(4000);


    await safeCreate('Index: skill_id (key)', () =>
        db.createIndex(DATABASE_ID, COMMENTS_COLLECTION_ID, 'skill_id_idx', IndexType.Key, ['skill_id'])
    );
    await sleep(500);

    await safeCreate('Index: $createdAt ASC', () =>
        db.createIndex(DATABASE_ID, COMMENTS_COLLECTION_ID, 'created_at_asc', IndexType.Key, ['$createdAt'], ['ASC'])
    );
    await sleep(500);

   
    await safeCreate('Index: user_id (key)', () =>
        db.createIndex(DATABASE_ID, COMMENTS_COLLECTION_ID, 'user_id_idx', IndexType.Key, ['user_id'])
    );

    console.log('\n Comments collection ready!\n');
}

main().catch(err => {
    console.error('\n💥 Setup failed:', err.message);
    process.exit(1);
});

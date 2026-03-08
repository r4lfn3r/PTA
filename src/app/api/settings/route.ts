import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Using AES-256-CBC
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;
const DB_PATH = path.join(process.cwd(), 'data', 'secure-settings.json');

function encrypt(text: string) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/*function decrypt(text: string) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift() as string, 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}*/

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { apiKey, apiSecret, isSimulation } = body;

        if (!apiKey || !apiSecret) {
            return NextResponse.json({ error: 'API Key and Secret are required' }, { status: 400 });
        }

        const encryptedKey = encrypt(apiKey);
        const encryptedSecret = encrypt(apiSecret);

        // Save to simple JSON file database
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(DB_PATH, JSON.stringify({
            apiKey: encryptedKey,
            apiSecret: encryptedSecret,
            isSimulation: !!isSimulation,
            updatedAt: new Date().toISOString()
        }, null, 2));

        return NextResponse.json({ success: true, message: 'API Credentials securely saved' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

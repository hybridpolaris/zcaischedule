import fs from 'node:fs/promises';

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method == "OPTIONS") {
        return res.status(200).end();
    }

    const ua = req.headers["user-agent"] || "";
    if (ua.includes("vercel")) {
        return res.status(204).end();
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', async () => {
        try {
            const parsedData = JSON.parse(body);
            const link = "https://bot-api.zaloplatforms.com/bot3803662042303976181:jvNWpeXEFFBHNYabSXuPTTqvgIxsefLkwUnPpebPxSehOBIkTBlfmfaEsAJVgrzr/sendMessage"
            const requestBody = {
                chat_id: parsedData.data.user, // user's private chat uses same id as user id
                text: `Nhắc nhở: lịch ${parsedData.data.name} đã đến rồi nhé.`
            }

            await fetch(link, {
                method: "POST",
                body: JSON.stringify(requestBody),
            });
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: "Invalid JSON" })
        }
    });
}
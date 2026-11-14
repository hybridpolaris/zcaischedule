import fs from 'node:fs/promises';

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method == "OPTIONS") {
        return res.status(200).end();
    }

    const ua = req.headers["user-agent"] || "";
    if (ua.includes("vercel")) {
        return res.status(204).end();
    }

    const data = await fs.readFile('./../schedule.json');
    const schedule = JSON.parse(data);
    if (req.method == "GET") {
        res.status(200).json(schedule);
    } else {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', async () => {
            try {
                const parsedData = JSON.parse(body);
                if (req.method == "POST") {
                    const apiKey = process.env.POSTHOOK_KEY;
                    const link = "https://api.posthook.io/v1/hooks"
                    const requestBody = {
                        "path": "/api/hook",
                        "postAt": parsedData.time,
                        "data": {
                            "user": parsedData.user_id,
                            "name": parsedData.desc,
                            "repeating": parsedData.repeating,
                            "interval": parsedData.interval
                        }
                    }

                    const response = await fetch(link, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-API-Key": apiKey,
                        },
                        body: JSON.stringify(requestBody),
                    });

                    schedule[parsedData.user_id].push({
                        "at": parsedData.time,
                        "id": parsedData.id,
                        "name": parsedData.desc,
                        "repeating": parsedData.repeating,
                        "interval": parsedData.interval,
                        "hook": (await response.json()).data.id,
                        "active": true
                    });
                    await fs.writeFile('../schedule.json', JSON.stringify(schedule, null, 2), 'utf-8');

                    res.status(200).json(schedule);
                } else { // DELETE
                    const index = schedule[parsedData.user_id].findIndex(item => item.id == parsedData.id)
                    // if (index != -1) 
                    // TODO: do this
                }
            } catch (err) {
                console.log(err);
                res.status(400).json({ error: "Invalid JSON" })
            }
        });
    }

    // const requestBody = {
    //     model: "writingmastergen",
    //     messages: [{
    //         role: "user",
    //         content: decodeURIComponent(prompt)
    //     }]
    // };

}
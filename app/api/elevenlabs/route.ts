import fs from "fs";
import path from "path";
import { HeadObjectCommand, PutObjectCommand, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { env } from "process";

export async function POST(request: Request) {
    const { message, voice } = await request.json();

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
            {
                method: "POST",
                headers: {
                    accept: "audio/mpeg",
                    "Content-Type": "application/json",
                    "xi-api-key": process.env.API_KEY!,
                },
                body: JSON.stringify({
                    text: message,
                    voice_settings: {
                        stability: 0,
                        similarity_boost: 0,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error("Something went wrong");
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const file = Math.random().toString(36).substring(7);

        const s3Config: S3ClientConfig = {
            region: "eu-north-1",
            credentials: {
                accessKeyId: env.S3_ACCESS_KEY!,
                secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
            }
        };
        const s3Client = new S3Client(s3Config);

        await s3Client.send(new PutObjectCommand({
            Bucket: 'text-to-speech-luka',
            Key: file + ".mp3",
            Body: buffer,
            ACL: "public-read",
        }));

        /* write to local storate instead of s3
                 fs.writeFile(path.join("public", "audio", `${file}.mp3`), buffer, () => {
                    console.log("File written successfully");
                }); */

        return new Response(JSON.stringify({ file: `https://text-to-speech-luka.s3.eu-north-1.amazonaws.com/${file}.mp3` }));
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }));
    }
}
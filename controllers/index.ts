import { Request, Response } from "express";
import dotenv from "dotenv";
import { OpenAI, ClientOptions } from "openai";
import {ChatCompletionCreateParams} from "openai/resources/chat";
import ChatCompletionCreateParamsNonStreaming = ChatCompletionCreateParams.ChatCompletionCreateParamsNonStreaming;

dotenv.config();

const options: ClientOptions = {
    apiKey: process.env.API_KEY,
};

const openai = new OpenAI(options);

const conversationContext: any[][] = [];

export const generateResponse = async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        const currentMessages: { role: string; content: any; }[] = [];

        for (const [inputText, responseText] of conversationContext) {
            currentMessages.push({ role: "user", content: inputText });
            currentMessages.push({ role: "assistant", content: responseText });
        }

        currentMessages.push({ role: "user", content: prompt });

        const result = await openai.chat.completions.create(<ChatCompletionCreateParamsNonStreaming>{
            model: "gpt-3.5-turbo",
            messages: currentMessages,
        });


        const responseText = result.choices[0]?.message?.content;

        conversationContext.push([prompt, responseText]);

        res.send({ response: responseText });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

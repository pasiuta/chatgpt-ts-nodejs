import { Request, Response } from "express";
import dotenv from "dotenv";
import { OpenAI, ClientOptions } from "openai";
import { ChatCompletionCreateParams } from "openai/resources/chat";

dotenv.config();

const options: ClientOptions = {
    apiKey: process.env.API_KEY,
};

const openai = new OpenAI(options);

interface Message {
    role: "user" | "assistant";
    content: string;
}

const conversationContext: string[][] = [];

export const generateResponse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { prompt } = req.body;
        const currentMessages: Message[] = [];

        for (const [inputText, responseText] of conversationContext) {
            currentMessages.push({ role: "user", content: inputText });
            if (responseText) {
                currentMessages.push({ role: "assistant", content: responseText });
            }
        }

        currentMessages.push({ role: "user", content: prompt });

        const result = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: currentMessages,
        } as ChatCompletionCreateParams.ChatCompletionCreateParamsNonStreaming);

        const responseText = result.choices[0]?.message?.content;

        if (responseText) {
            conversationContext.push([prompt, responseText]);
            res.send({ response: responseText });
        } else {
            throw new Error("Failed to generate a response from the model");
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

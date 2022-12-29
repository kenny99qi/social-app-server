import {CustomRequest} from "../middleware/auth/AuthMiddleware";
import openai from "../openai-api";
import Error, {Message, StatusCode} from "../util/Error";

require('dotenv').config()
import {Response} from 'express'

export class OpenaiController {
    static basicChat = async (req: CustomRequest, res: Response) => {
        try {
            const prompt = req.body.prompt;

            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `${prompt}`,
                temperature: 0, // Higher values means the model will take more risks.
                max_tokens: 4000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
                top_p: 1, // alternative to sampling with temperature, called nucleus sampling
                frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
                presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
            });
            res.status(200).send({
                bot: response.data.choices[0].text
            });
        } catch (error) {
            console.error(error)
            res.status(500).send(error || 'Something went wrong');
        }
    }

    static codeChat = async (req: CustomRequest, res: Response) => {
        try {
            const prompt = req.body.prompt;

            const response = await openai.createCompletion({
                model: "code-davinci-002",
                prompt: `${prompt}`,
                temperature: 0, // Higher values means the model will take more risks.
                max_tokens: 8000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
                top_p: 1, // alternative to sampling with temperature, called nucleus sampling
                frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
                presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
            });

            res.status(200).send({
                bot: response.data.choices[0].text
            });

        } catch (error) {
            console.error(error)
            res.status(500).send(error || 'Something went wrong');
        }
    }

    static textToImg = async (req: CustomRequest, res: Response) => {
        let image_url = null;
        try {
            const description = req.body.description;
            const response = await openai.createImage({
                prompt: description,
                n: 5,
                size: "256x256",
            });
            image_url = response.data.data;
        } catch (e) {
            return res.status(StatusCode.E500).send(new Error(e, StatusCode.E500, Message.ErrCreate))
        }
        return res.status(200).json(new Error(image_url, StatusCode.E200, Message.OK));
    }
}
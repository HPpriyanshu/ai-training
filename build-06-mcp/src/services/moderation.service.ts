import { config } from "../config.js"
import { logger } from "../utils/logger.js"
import axios from "axios"

export const moderateInput = async (text: string) => {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/moderations",
            {
                model: "omni-moderation-latest",
                input: text
            },
            {
                headers: {
                    "content-type":  "application/json",
                    Authorization: `Bearer ${config.OPENAI_KEY}`
                }
            }
        )

        const result = response.data.results[0]

        return {
            flagged : result.flagged,
            categories : result.categories
        }
    } catch (error) {
        logger.error({error}, "Moderation API error")
    }
}
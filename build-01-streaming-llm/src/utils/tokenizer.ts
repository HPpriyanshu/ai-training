import {encoding_for_model} from "tiktoken"

const enc = encoding_for_model("gpt-4o-mini")

export const countTokens = (text : string): number => {
    return enc.encode(text).length
}
import fs from "fs"
import path from "path"

const cache : Record<string, string> = {}

export const loadPrompt = (fileName:string): string => {
    if(cache[fileName]) return cache[fileName]

    const filePath = path.join(process.cwd(), "src", "prompts", fileName)
    const content = fs.readFileSync(filePath, "utf-8")

    cache[fileName] = content
    return content
}

export const buildPrompt = (template : string, variables: Record<string, string>): string => {
    let result = template

    for (const key in variables){
        const value = variables[key] ?? ""

        result = result.split(`{{${key}}}`).join(value)
    }

    return result
}
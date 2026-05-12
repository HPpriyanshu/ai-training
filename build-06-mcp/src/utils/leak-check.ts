import { config } from "../config.js"

export const containsSensitiveData = (text: string): boolean => {
    //! Dynamic secrets
    const secrets = [
        config.OPENAI_KEY,
        config.DATABASE_URL
    ].filter(Boolean) as string[]

    if(secrets.some(secret => text.includes(secret))){
        return true
    }

    //! common risky pattern
    const patterns = [

        //? API key patttern
        /sk-[a-zA-Z0-9]{10,}/,       
        /api[_-]?key/i,
        /authorization/i,
        /bearer\s+[a-z0-9\-._]+/i,

        //? SQL queries
        /SELECT\s.+FROM/i,          
        /INSERT\s.+INTO/i,
        /DELETE\s.+FROM/i,

        //? internal URLs
        /localhost:\d+/i,            
        /http:\/\/internal/i,

        //? prompt leak
        /system prompt/i
    ]

    return patterns.some(r => r.test(text))
}
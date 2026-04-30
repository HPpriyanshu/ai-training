type maskMap = Record<string, string>

export const maskPII = (text: string) => {
    const map: maskMap = {}

    let emailCount = 1
    let phoneCount = 1
    let cardCount = 1

    //! email
    text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
        (match) => {
            const key = `[Email_${emailCount++}]`
            map[key] = match
            return key
        }
    )

    //! phone
    text = text.replace( /\b(\+91[\-\s]?|0)?[6-9]\d{9}\b/g,
        (match) => {
            const key = `[Phone_${phoneCount++}]`
            map[key] = match
            return key
        }
    )

    //! card
    text = text.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
        (match) => {
            const key = `[Card_${cardCount++}]`
            map[key] = match
            return key
        }
    )

    return {text, map}
}

export const unmaskPII = (text: string, map: maskMap) => {
    let result = text

    for (const key in map){
        result = result.replaceAll(key, map[key] ?? "")
    }

    return result
}
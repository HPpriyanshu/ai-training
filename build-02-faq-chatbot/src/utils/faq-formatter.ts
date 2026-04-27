import { FAQs } from "../data/faq.js"

export const formatFaq = (): string => {
    let result = ""

    for (const [category, faqs] of Object.entries(FAQs)){
        result += `\ncategory: ${category}\n`

        faqs.forEach((faq) => {
            result += `Q: ${faq.questions}\nA: ${faq.answer}\n`
        })
    }

    return result
}
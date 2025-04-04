import type { KitQuestion } from "$types/net";

export async function getKitQuestions(id: string): Promise<KitQuestion[]> {
    if(!id) {
        // return demo questions
        return [
            {
                _id: "demo_question",
                text: "Sample question: select the correct answer.",
                type: "mc",
                answers: [
                    { _id: "correct_answer", text: "Correct Answer", correct: true },
                    { _id: "incorrect_answer_1", text: "Incorrect Answer 1", correct: false },
                    { _id: "incorrect_answer_2", text: "Incorrect Answer 2", correct: false },
                    { _id: "incorrect_answer_3", text: "Incorrect Answer 3", correct: false }
                ] 
            }
        ]
    }

    const url = `https://www.gimkit.com/api/games/fetch/${id}`;
    
    try {
        let res = await fetch(url);
        let json = await res.json();
        
        return json.kit.questions;
    } catch(e) {
        return [];
    }
}
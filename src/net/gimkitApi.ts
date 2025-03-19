import { KitQuestion } from "../types.js";

export async function getKitQuestions(id: string): Promise<KitQuestion[]> {
    const url = `https://www.gimkit.com/api/games/fetch/${id}`;
    
    try {
        let res = await fetch(url);
        let json = await res.json();

        return json.kit.questions;
    } catch {
        return [];
    }
}
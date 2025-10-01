/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const fileToPart = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
};

const dataUrlToParts = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    return { mimeType: mimeMatch[1], data: arr[1] };
}

const handleApiResponse = (response: GenerateContentResponse): string => {
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Yêu cầu đã bị chặn. Lý do: ${blockReason}. ${blockReasonMessage || ''}`;
        throw new Error(errorMessage);
    }

    // Find the first image part in any candidate
    for (const candidate of response.candidates ?? []) {
        const imagePart = candidate.content?.parts?.find(part => part.inlineData);
        if (imagePart?.inlineData) {
            const { mimeType, data } = imagePart.inlineData;
            return `data:${mimeType};base64,${data}`;
        }
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Việc tạo hình ảnh đã dừng đột ngột. Lý do: ${finishReason}. Điều này thường liên quan đến cài đặt an toàn.`;
        throw new Error(errorMessage);
    }
    const textFeedback = response.text?.trim();
    const errorMessage = `Mô hình AI không trả về hình ảnh. ` + (textFeedback ? `Mô hình đã phản hồi bằng văn bản: "${textFeedback}"` : "Điều này có thể xảy ra do bộ lọc an toàn hoặc nếu yêu cầu quá phức tạp. Vui lòng thử một hình ảnh khác.");
    throw new Error(errorMessage);
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash-image-preview';

export const restorePhoto = async (
    imageFile: File,
    options: {
        fixDamage: boolean;
        enhanceColors: boolean;
        sharpenDetails: boolean;
    }
): Promise<string> => {
    const imagePart = await fileToPart(imageFile);
    
    let prompt = "You are an expert in photo restoration. Your task is to restore this old, blurry, or damaged photo. The goal is a realistic restoration that preserves the original character of the photo.";

    const instructions: string[] = [];
    if (options.fixDamage) {
        instructions.push("Fix physical damage such as scratches, tears, dust, and other blemishes.");
    }
    if (options.enhanceColors) {
        instructions.push("Correct color fading and discoloration. Restore natural and vibrant colors, and adjust the white balance if needed.");
    }
    if (options.sharpenDetails) {
        instructions.push("Enhance the sharpness and clarity of blurry details. Pay special attention to faces, ensuring they are clear while remaining natural.");
    }

    if (instructions.length > 0) {
        prompt += "\n\nSpecifically, perform the following actions:\n- " + instructions.join("\n- ");
    } else {
        prompt += "\n\nPerform a general-purpose restoration, improving clarity and quality."
    }

    prompt += "\n\nReturn ONLY the restored image.";
    
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    return handleApiResponse(response);
};

export const generateIdPhoto = async (
    imageFile: File, 
    size: string, 
    background: string, 
    aspectRatio: string, 
    numberOfImages: number
): Promise<string[]> => {
    const imagePart = await fileToPart(imageFile);
    const prompt = `You are an expert in creating professional ID photos. You will be given an image of a person. Your task is to transform it into a standard ID photo with the following specifications:
- Background Color: ${background}
- Attire: The person should be wearing professional business attire (e.g., a dark suit jacket over a light-colored collared shirt). You MUST replace their current clothing.
- Pose & Expression: Maintain the person's head and shoulders view. The expression should be neutral and forward-facing.
- Lighting: Ensure the lighting is even and without harsh shadows, typical of a studio setting.
- Output: The final image must have a ${aspectRatio} aspect ratio. The common size for this photo is ${size}.
- IMPORTANT: You MUST NOT alter, modify, or airbrush the person's face. The facial features, skin texture, marks, and scars must be preserved exactly as they are in the original image.
Return ONLY the final, edited image.`;

    const promises = Array.from({ length: numberOfImages }, () =>
        ai.models.generateContent({
            model,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        })
    );
    const responses = await Promise.all(promises);
    return responses.map(handleApiResponse);
};

export const generateProductShowcase = async (
    characterFile: File,
    productFile: File,
    sceneDescription: string,
    aspectRatio: string,
    numberOfImages: number
): Promise<string[]> => {
    const characterPart = await fileToPart(characterFile);
    const productPart = await fileToPart(productFile);
    const prompt = `You are an expert commercial photographer. Your task is to seamlessly combine a person and a product into a new scene.
- First, isolate the person from their background in the first image.
- Second, isolate the product from its background in the second image.
- Then, place both the isolated person and the product into a new, realistic, high-quality scene described as: "${sceneDescription}".
- Ensure the lighting, shadows, and reflections on both the person and the product look natural and consistent with the new scene.
- The final image should be a professional, appealing advertisement or product shot.
- The final image must have a ${aspectRatio} aspect ratio.
- IMPORTANT: You MUST NOT alter or modify the person or the product themselves. Their appearance, shape, colors, and any text or logos must be preserved exactly as they are in the original images.
Return ONLY the final composite image.`;

    const promises = Array.from({ length: numberOfImages }, () =>
        ai.models.generateContent({
            model,
            contents: { parts: [characterPart, productPart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        })
    );
    const responses = await Promise.all(promises);
    return responses.map(handleApiResponse);
};

export const removeObjectFromPhoto = async (imageFile: File, objectToRemove: string): Promise<string> => {
    const imagePart = await fileToPart(imageFile);
    const prompt = `You are an expert photo editor. Your task is to remove an object from the provided image based on the user's request.
User's request: "Remove ${objectToRemove}".
Carefully identify the object described and remove it seamlessly. Fill in the background intelligently, ensuring the result looks natural and realistic. Do not alter any other part of the image.
Return ONLY the edited image with the object removed.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    return handleApiResponse(response);
};

export const generateOfficeHeadshot = async (
    imageFile: File, 
    background: string,
    aspectRatio: string,
    numberOfImages: number
): Promise<string[]> => {
    const imagePart = await fileToPart(imageFile);
    const prompt = `You are an expert in creating professional corporate headshots. Transform the provided image into a high-quality headshot.
- Background: Change the background to a professional '${background}' setting.
- Attire: The person should be wearing professional business attire (e.g., a suit jacket or blazer). You MUST replace their current clothing.
- Pose & Expression: Maintain the person's head and shoulders view. The expression should be confident and professional.
- Lighting: Ensure the lighting is even, flattering, and studio-quality.
- Output: The final image must have a ${aspectRatio} aspect ratio.
- IMPORTANT: You MUST NOT alter, modify, or airbrush the person's face. The facial features, skin texture, marks, and scars must be preserved exactly as they are in the original image.
Return ONLY the final, edited image.`;

    const promises = Array.from({ length: numberOfImages }, () => 
        ai.models.generateContent({
            model,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        })
    );
    // FIX: Pass the `promises` array to `Promise.all` instead of `responses`.
    const responses = await Promise.all(promises);
    return responses.map(handleApiResponse);
};
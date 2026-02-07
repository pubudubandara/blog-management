import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js'; // Import our Winston logger

// Initialize Gemini Client
let genAI = null;
let model = null;

try {
    // Only initialize if API key is available
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }
} catch (error) {
    logger.warn(`Failed to initialize Gemini AI: ${error.message}`);
}

/**
 * Generates a summary using Gemini API, falling back to TextRank algorithm if it fails
 * @param {string} content - The full blog content
 * @param {number} sentenceCount - Number of sentences for fallback (default: 3)
 * @returns {Promise<string>} - The summary
 */
export const generateSummary = async (content, sentenceCount = 3) => {
    if (!content || typeof content !== 'string') return "";
    const trimmedContent = content.trim();
    if (!trimmedContent) return "";

    // 1. Try Gemini API First (only if properly initialized)
    if (model) {
        try {
            const prompt = `Summarize the following text in 2-3 concise sentences. Capture the main idea clearly. Do not add any introductory phrases like "The text discusses" or "This article is about". Just provide the summary directly.

Text: "${trimmedContent.substring(0, 5000)}"`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const summary = response.text();

            logger.info('Generated summary via Gemini AI');
            return summary.trim();
        } catch (error) {
            // Log the error but don't throw - fallback to TextRank algorithm
            logger.warn(`Gemini API failed. Using TextRank fallback. Error: ${error.message}`);
        }
    } else {
        logger.info('Gemini API not configured, using TextRank summarizer');
    }

    // 2. Fallback to TextRank Algorithm (your original implementation)
    return generateTextRankSummary(trimmedContent, sentenceCount);
};


// Original TextRank summarization algorithm (slightly renamed from generateFallbackSummary)
 
const generateTextRankSummary = (content, sentenceCount = 3) => {
    const trimmedContent = content.trim();
    
    // --- 1. SENTENCE SEGMENTATION ---
    let sentences;
    
    // Use Intl.Segmenter for modern environments (Node.js 16+, modern browsers)
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        try {
            const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
            sentences = Array.from(segmenter.segment(trimmedContent))
                .map(s => s.segment.trim())
                .filter(s => s.length > 0);
        } catch (error) {
            // Fallback if segmenter fails
            sentences = trimmedContent.split(/(?<=[.!?])\s+(?=[A-Z])/g)
                .map(s => s.trim())
                .filter(s => s.length > 0);
        }
    } else {
        // Fallback for older environments
        sentences = trimmedContent.split(/(?<=[.!?])\s+(?=[A-Z])/g)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    // --- 2. HANDLE SHORT CONTENT ---
    if (sentences.length === 0) {
        return trimmedContent.length > 200 
            ? trimmedContent.substring(0, 197) + "..." 
            : trimmedContent;
    }

    if (sentences.length <= sentenceCount) {
        // If already short, return it with proper length limit
        const fullText = sentences.join(' ');
        return fullText.length > 500 
            ? fullText.substring(0, 497) + "..." 
            : fullText;
    }

    // --- 3. STOP WORDS (Common words to ignore) ---
    const stopWords = new Set([
        'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 
        'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 
        'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 
        'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 
        'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
        'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 
        'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 
        'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 
        'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 
        'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 
        'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 
        'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 
        'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 
        'will', 'just', 'should', 'now'
    ]);

    // --- 4. WORD FREQUENCY ANALYSIS ---
    const wordFreq = {};
    const getWords = (text) => text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
    const allWords = getWords(trimmedContent);

    allWords.forEach(word => {
        if (!stopWords.has(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    // --- 5. SCORE SENTENCES (TextRank Algorithm) ---
    const sentenceScores = sentences.map((sentence, index) => {
        const sWords = getWords(sentence);
        let score = 0;

        // Calculate score based on important word frequency
        sWords.forEach(word => {
            if (wordFreq[word]) {
                score += wordFreq[word];
            }
        });

        // Normalize by sentence length (avoid long sentences dominating)
        if (sWords.length > 0) {
            score = score / sWords.length;
        }

        // Bonus for short, impactful sentences
        if (sWords.length > 0 && sWords.length < 5) {
            score *= 1.2;
        }

        // Position bonus - first and last sentences are often important
        if (index === 0 || index === sentences.length - 1) {
            score *= 1.5;
        }

        return {
            sentence,
            score,
            index,
            wordCount: sWords.length,
            length: sentence.length
        };
    });

    // --- 6. SELECT BEST SENTENCES ---
    // Take top sentences by score, then restore original order
    const selected = sentenceScores
        .sort((a, b) => b.score - a.score) // Sort by importance
        .slice(0, sentenceCount + 2) // Take extra as buffer
        .sort((a, b) => a.index - b.index); // Restore original order

    // --- 7. BUILD SUMMARY WITH LENGTH LIMIT ---
    const MAX_SUMMARY_LENGTH = 500;
    let summary = "";
    let charCount = 0;
    let sentencesUsed = 0;

    for (const item of selected) {
        // Stop if we have enough sentences
        if (sentencesUsed >= sentenceCount) break;
        
        // Stop if adding this would exceed length limit (unless we have very little)
        const newLength = charCount + item.length + (summary ? 1 : 0);
        if (newLength > MAX_SUMMARY_LENGTH && charCount > 150) break;
        
        // Add sentence to summary
        if (summary) summary += " ";
        summary += item.sentence;
        charCount = newLength;
        sentencesUsed++;
    }

    // --- 8. FINAL FORMATTING ---
    // If summary is too long, truncate at sentence boundary
    if (summary.length > MAX_SUMMARY_LENGTH) {
        const lastPeriod = summary.lastIndexOf('.', MAX_SUMMARY_LENGTH - 3);
        const lastExcl = summary.lastIndexOf('!', MAX_SUMMARY_LENGTH - 3);
        const lastQuest = summary.lastIndexOf('?', MAX_SUMMARY_LENGTH - 3);
        const lastPunct = Math.max(lastPeriod, lastExcl, lastQuest);
        
        if (lastPunct > MAX_SUMMARY_LENGTH * 0.5) {
            summary = summary.substring(0, lastPunct + 1);
        } else {
            summary = summary.substring(0, MAX_SUMMARY_LENGTH - 3) + "...";
        }
    }

    // Fallback if somehow we got empty summary
    if (!summary || summary.trim().length === 0) {
        return trimmedContent.length > 200 
            ? trimmedContent.substring(0, 197) + "..." 
            : trimmedContent;
    }

    logger.info('Generated summary via TextRank algorithm');
    return summary;
};

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// HTML 파일을 제공하기 위해 public 폴더 대신 루트 디렉토리 허용
app.use(express.static(__dirname));

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Naming API Endpoint
app.post('/api/name', async (req, res) => {
    try {
        const { originalName, originCountry, targetCountry, gender, vibe, mbti } = req.body;
        
        let mbtiText = "";
        if (mbti && mbti.trim() !== "") {
            mbtiText = `- 성격/MBTI: ${mbti} (이 성격적 특성을 이름 추천과 설명에 꼭 반영해줘!)`;
        }
        
        const prompt = `너는 글로벌 언어 및 문화 전문가이자 센스 있는 네이밍(작명) 마스터야.
        사용자가 자신의 원래 이름과 타겟 국가를 입력하면, 그 나라의 문화, 발음, 의미를 고려해서 가장 센스 있고 멋진 이름을 추천해줘.
        
        [사용자 정보]
        - 원래 이름: ${originalName}
        - 원래 국가(언어): ${originCountry}
        - 추천받을 타겟 국가(언어): ${targetCountry}
        - 성별: ${gender}
        - 원하는 분위기/느낌: ${vibe}
        ${mbtiText}
        
        [요구사항]
        1. 타겟 국가에서 실제로 자연스럽게 쓰이는 이름 3가지를 추천해줘.
        2. 각 이름이 왜 이 사용자에게 어울리는지(발음이 비슷한지, 뜻이 통하는지, 분위기가 맞는지 등) 이유를 짧고 재미있게 설명해줘.
        3. 속도 최적화를 위해 의미(meaning), 추천 이유(reason), 인사말(greeting)은 모두 1~2문장 내외로 극도로 짧고 간결하게 작성해줘. 불필요하게 서술형 설명이 길어지면 절대 안 돼!
        4. 반환은 반드시 아래 JSON 형식으로만 해줘. 마크다운(\`\`\`) 없이 순수 JSON만 반환할 것.
        
        [JSON 형식]
        {
            "names": [
                {
                    "recommendedName": "추천 이름 1",
                    "meaning": "이름의 뜻",
                    "reason": "추천 이유 (재미있게)"
                },
                {
                    "recommendedName": "추천 이름 2",
                    "meaning": "이름의 뜻",
                    "reason": "추천 이유 (재미있게)"
                },
                {
                    "recommendedName": "추천 이름 3",
                    "meaning": "이름의 뜻",
                    "reason": "추천 이유 (재미있게)"
                }
            ],
            "greeting": "타겟 국가의 언어로 하는 짧은 인사말 (예: Bonjour! 좋은 이름이네요!)"
        }`;

        // generationConfig를 통해 JSON 모드를 강제하여 응답 속도를 극대화하고 형식을 보장합니다.
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Clean up markdown block if present
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        // Extract strictly from { to }
        const startIndex = text.indexOf('{');
        const endIndex = text.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1) {
            text = text.substring(startIndex, endIndex + 1);
        }

        const jsonResult = JSON.parse(text);
        res.json(jsonResult);
        
    } catch (error) {
        console.error('Naming API Error:', error);
        res.status(500).json({ error: error.message || "이름 생성 중 오류가 발생했습니다." });
    }
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Global Naming Server is running at http://localhost:${port}`);
});

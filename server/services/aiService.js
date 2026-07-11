const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Medical', 'Entertainment', 'Bills', 'Other'];

// ---------- Keyword-based offline categorizer (also used to validate AI output) ----------
const KEYWORD_MAP = [
  { category: 'Food', keywords: ['pizza', 'restaurant', 'cafe', 'coffee', 'zomato', 'swiggy', 'dominos', "domino's", 'mcdonald', 'kfc', 'burger', 'food', 'dining', 'starbucks', 'bakery', 'grocery', 'groceries', 'supermarket'] },
  { category: 'Travel', keywords: ['uber', 'ola', 'taxi', 'cab', 'flight', 'airlines', 'train', 'irctc', 'bus', 'fuel', 'petrol', 'diesel', 'metro', 'travel', 'trip', 'hotel', 'airbnb', 'parking'] },
  { category: 'Shopping', keywords: ['amazon', 'flipkart', 'myntra', 'nike', 'adidas', 'shoes', 'clothing', 'mall', 'shopping', 'shirt', 'apparel', 'electronics', 'zara'] },
  { category: 'Entertainment', keywords: ['netflix', 'spotify', 'prime video', 'hotstar', 'movie', 'cinema', 'bookmyshow', 'concert', 'game', 'gaming', 'subscription', 'youtube premium', 'disney'] },
  { category: 'Medical', keywords: ['pharmacy', 'hospital', 'doctor', 'clinic', 'medicine', 'medical', 'health', 'apollo', 'diagnostic', 'insurance'] },
  { category: 'Bills', keywords: ['electricity', 'water bill', 'internet', 'wifi', 'broadband', 'rent', 'mobile recharge', 'phone bill', 'gas bill', 'emi', 'loan'] },
];

function keywordCategorize(description) {
  const text = description.toLowerCase();
  for (const { category, keywords } of KEYWORD_MAP) {
    if (keywords.some((kw) => text.includes(kw))) {
      return { category, confidence: 85 };
    }
  }
  return { category: 'Other', confidence: 40 };
}

// ---------- Gemini-backed categorizer ----------
async function callGeminiCategorize(description) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = `Classify this expense description into EXACTLY ONE of these categories: ${CATEGORIES.join(', ')}.
Description: "${description}"
Return ONLY a JSON object like {"category": "Food", "confidence": 92} with no markdown, no explanation.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no content');

  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  if (!CATEGORIES.includes(parsed.category)) {
    throw new Error('Gemini returned an invalid category');
  }
  return { category: parsed.category, confidence: parsed.confidence ?? 80 };
}

async function categorizeExpense(description) {
  try {
    return await callGeminiCategorize(description);
  } catch (err) {
    console.warn('AI categorization unavailable, using keyword fallback:', err.message);
    return keywordCategorize(description);
  }
}

// ---------- Insights & advice (rule-based, works with or without AI) ----------
function generateInsights({ currentMonthByCategory, lastMonthByCategory, currentTotal, lastTotal }) {
  const insights = [];

  Object.keys(currentMonthByCategory).forEach((category) => {
    const current = currentMonthByCategory[category] || 0;
    const last = lastMonthByCategory[category] || 0;

    if (last > 0 && current > last) {
      const pctChange = Math.round(((current - last) / last) * 100);
      if (pctChange >= 15) {
        insights.push(`You spent ${pctChange}% more on ${category} than last month.`);
      }
    } else if (last > 0 && current < last) {
      const pctChange = Math.round(((last - current) / last) * 100);
      if (pctChange >= 15) {
        insights.push(`${category} spending is ${pctChange}% below last month — nice work.`);
      }
    } else if (last === 0 && current > 0) {
      insights.push(`New spending category this month: ${category} (₹${current.toFixed(0)}).`);
    }
  });

  if (lastTotal > 0) {
    const totalChange = Math.round(((currentTotal - lastTotal) / lastTotal) * 100);
    if (Math.abs(totalChange) >= 10) {
      insights.push(
        totalChange > 0
          ? `Overall spending is up ${totalChange}% compared to last month.`
          : `Overall spending is down ${Math.abs(totalChange)}% compared to last month — great progress.`
      );
    }
  }

  if (!insights.length) {
    insights.push('Your spending this month is fairly consistent with last month.');
  }

  return insights;
}

function generateAdvice({ currentMonthByCategory, lastMonthByCategory, budgets }) {
  const advice = [];

  Object.keys(currentMonthByCategory).forEach((category) => {
    const current = currentMonthByCategory[category] || 0;
    const last = lastMonthByCategory[category] || 0;
    const budgetKey = category.toLowerCase();
    const budget = budgets?.[budgetKey];

    if (last > 0 && current > last * 1.2) {
      const diff = Math.round(current - last);
      advice.push(
        `${category} spending increased by ₹${diff} this month. Consider trimming discretionary ${category.toLowerCase()} purchases to get back on track.`
      );
    }

    if (budget && budget > 0 && current > budget) {
      advice.push(`You've exceeded your ${category} budget by ₹${Math.round(current - budget)}. Consider adjusting the budget or cutting back next month.`);
    } else if (budget && budget > 0 && current >= budget * 0.9) {
      advice.push(`You're close to your ${category} budget (${Math.round((current / budget) * 100)}% used). A little caution here will keep you on track.`);
    }
  });

  if (!advice.length) {
    advice.push('Your spending looks balanced this month — keep tracking to build a strong habit.');
  }

  return advice.slice(0, 6);
}

module.exports = { categorizeExpense, generateInsights, generateAdvice, CATEGORIES };

import fs from "fs";
import path from "path";

const kb = JSON.parse(fs.readFileSync(path.join(process.cwd(), "migrant_kb.json"), "utf8"));

// Vercel по умолчанию ограничивает тело запроса 4.5 МБ — для коротких голосовых сообщений
// этого достаточно с большим запасом (несколько секунд речи в webm/opus — десятки КБ).
export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { question, audio, mimeType } = req.body || {};
  const isAudio = typeof audio === "string" && audio.length > 0;
  if (!isAudio && (!question || typeof question !== "string" || !question.trim())) {
    res.status(400).json({ error: "question or audio is required" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "server not configured" });
    return;
  }

  const entryText = e => `RU — Вопрос: ${e.ru.q}\nОтвет: ${e.ru.a}\nKY — Суроо: ${e.ky.q}\nЖооп: ${e.ky.a}\nИсточник: ${e.source}`;

  // Простой поиск по ключевым словам: база выросла настолько (75+ пунктов, ~26к токенов),
  // что при отправке ЦЕЛИКОМ на каждый вопрос модель начинала путаться и отвечать не по теме —
  // огромный системный промпт "забивал" короткий вопрос пользователя. Вместо всей базы
  // отбираем только релевантные вопросу пункты (по совпадению слов в обоих языках).
  const STOPWORDS = new Set(["для","что","как","это","или","при","мне","моя","мой","мои","если","есть","нужно","можно","только","где","куда","кто","когда","почему","который","которая","которые","были","было","всех","всей","всего","этот","эта","это","эти","тот","those","the","and","for"]);
  const tokenize = s => (s || "")
    .toLowerCase()
    .replace(/[^a-zа-яёүөңküöşğıі0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOPWORDS.has(w));

  // Лимит снижен с 18 до 12: замеры показали, что при 18 пунктах системная инструкция
  // разрастается до ~30к символов, и генерация ответа Gemini иногда стабильно превышает
  // 20 сек (вплоть до тайм-аута) — особенно на кыргызском. Меньший промпт означает более
  // быструю генерацию при сохранении релевантных пунктов базы.
  const selectRelevantEntries = (questionText, limit = 12) => {
    const queryWords = tokenize(questionText);
    const scored = kb.map((e, i) => {
      const haystack = tokenize(`${e.group} ${e.ru.q} ${e.ru.a} ${e.ky.q} ${e.ky.a}`).join(" ");
      let score = 0;
      for (const w of queryWords) if (haystack.includes(w)) score++;
      return { e, score, i };
    });
    // Сортировка по релевантности, при равенстве — по исходному порядку (стабильно).
    scored.sort((a, b) => b.score - a.score || a.i - b.i);
    // ВСЕГДА ограничиваем размер топ-N, даже если совпадений по ключевым словам вовсе нет
    // (короткие сообщения вроде "Здравствуйте" не совпадают ни с одним пунктом базы) —
    // раньше в этом случае отправлялась вся база целиком, и баг с языком ответа возвращался.
    return scored.slice(0, limit).map(s => s.e);
  };

  // Кыргызские буквы ң/ү/ө практически всегда встречаются в любом сколь-нибудь
  // содержательном кыргызском тексте и никогда не встречаются в русском — по их
  // отсутствию/наличию язык определяется куда надёжнее, чем догадкой модели,
  // особенно на коротких сообщениях вроде "Здравствуйте" без явных языковых маркеров.
  // Но короткие приветствия/бытовые слова вроде "саламатсызбы" или "кандайсыз" этих
  // букв не содержат — поэтому дополнительно проверяем список частых кыргызских слов.
  // "салам"/"ассалам" намеренно НЕ в списке — это приветствие общее для русской и
  // кыргызской речи в регионе, определять по нему язык нельзя (см. пример пользователя:
  // "Ассалам алейкум" → ответ должен остаться на русском, если остальной текст русский).
  const KY_WORDS = ["саламатсызбы","кандайсыз","рахмат","ыракмат","жакшы","жакшысызбы","ооба","макул","байке","эже","ырахмат","сизге","дагы","кечиресиз"];
  const detectLang = s => {
    const t = (s || "").toLowerCase();
    if (/[ңүө]/i.test(t)) return "ky";
    if (KY_WORDS.some(w => t.includes(w))) return "ky";
    return "ru";
  };
  const LANG_LABEL = { ru: "русский", ky: "кыргызский" };

  // Приветствия обрабатываем полностью детерминированно, БЕЗ обращения к модели —
  // раньше просили Gemini самой зеркалить приветствие и переводить шаблон на нужный
  // язык, но модель иногда переводила только половину фразы (зеркалила приветствие
  // на кыргызском, а продолжение оставляла на русском). Люди должны доверять точности
  // ответов, поэтому для этого конкретного случая надёжность важнее гибкости модели.
  const BODY_RU = "Я консультант приложения «Иштерман». Чем могу помочь вам? Могу принимать на русском и на кыргызском языках голосовые и текстовые вопросы. Слушаю Вас.";
  const BODY_KY = "Мен «Иштерман» тиркемесинин консультантымын. Сизге кантип жардам бере алам? Орус жана кыргыз тилдеринде үн жана текст түрүндөгү суроолорду кабыл алам. Сизди угуп жатам.";
  // \S* после корня слова захватывает любое окончание того же слова (например, у
  // "саламатсызбы" бывают формы "саламатсыңарбы", "саламатсыңыздарбы" и т.п.) — иначе
  // хвост слова оставался "лишним текстом" и ошибочно ломал распознавание приветствия.
  const GREETING_PATTERNS = [
    { re: /ассалам(у)?\s*алейкум\S*/i, mirror: "Ваалейкум ассалам!" },
    { re: /саламатсы\S*/i, mirror: "Саламатсызбы!" },
    { re: /кандайсыз\S*/i, mirror: "Жакшы, рахмат!" },
    { re: /здравствуй\S*/i, mirror: "Здравствуйте!" },
    { re: /добрый\s*день\S*/i, mirror: "Добрый день!" },
    { re: /добр(ое|ый)\s*утр\S*/i, mirror: "Доброе утро!" },
    { re: /добрый\s*вечер\S*/i, mirror: "Добрый вечер!" },
    { re: /^привет\S*/i, mirror: "Привет!" },
    { re: /^салам\S*/i, mirror: "Салам!" },
  ];
  const matchGreeting = text => {
    const t = (text || "").trim();
    if (t.length > 40) return null;
    for (const p of GREETING_PATTERNS) {
      const m = t.match(p.re);
      if (!m) continue;
      // Приветствие должно составлять ВЕСЬ вопрос, а не только его начало — иначе
      // "Здравствуйте, где ОВМ в Кузьминках?" тоже попал бы сюда и заглушил реальный
      // вопрос. Проверяем, что после вычитания найденного приветствия почти ничего
      // не остаётся (не считая знаков препинания и пробелов).
      const rest = (t.slice(0, m.index) + t.slice(m.index + m[0].length))
        .replace(/[.,!?…\s]/g, "");
      if (rest.length <= 2) return p.mirror;
    }
    return null;
  };
  const greetingReply = (text, lang) => {
    const mirror = matchGreeting(text);
    if (!mirror) return null;
    return `${mirror} ${lang === "ky" ? BODY_KY : BODY_RU}`;
  };

  // lang передаётся ТОЛЬКО когда язык надёжно известен извне (для голоса — модель сама
  // услышала язык речи при транскрибации, см. audioLang). Для печатного текста передаём
  // null — просим модель определить язык САМА по тексту вопроса, а не навязываем ей
  // результат нашей текстовой эвристики detectLang. Причина: detectLang распознаёт
  // кыргызский только по буквам ң/ү/ө или маленькому списку слов — многие настоящие
  // кыргызские фразы (например, "Мага жардам керек") не содержат ни того, ни другого и
  // ошибочно принимались за русский, из-за чего модели навязывался неверный язык ответа.
  // Модель, читающая сам текст целиком (слова, грамматику), определяет язык надёжнее.
  const buildInstructions = (entries, lang) => {
    const kbText = entries.map(entryText).join("\n\n");
    const langInstruction = lang
      ? `ВАЖНО: язык вопроса пользователя уже определён программно — это ${LANG_LABEL[lang]} язык. Отвечай СТРОГО на этом языке (${lang === "ky" ? "кыргызском" : "русском"}), даже если вопрос короткий или похож на другой язык.`
      : `ВАЖНО: сам определи язык вопроса пользователя — русский или кыргызский — по тексту вопроса целиком (по словам и грамматике, а не только по характерным буквам ң/ү/ө, которые могут отсутствовать даже в чисто кыргызском тексте) и отвечай СТРОГО на этом же языке, даже если вопрос короткий.`;
    return `Ты — помощник-консультант приложения "Иштерман" по вопросам миграции в России, законам Кыргызстана и правам граждан Кыргызстана.
Отвечай СТРОГО на основе базы знаний ниже — не придумывай факты, цифры, суммы или сроки, которых там нет.
Если точного ответа на вопрос в базе знаний нет — честно скажи, что не можешь ответить точно, и посоветуй обратиться в МВД России (мвд.рф) или к юристу.
В конце ответа коротко укажи источник информации из базы знаний.
${langInstruction} Отвечай кратко, по делу. Если в сообщении есть приветствие ("Здравствуйте", "Ассалам алейкум" и т.п.) вместе с реальным вопросом — поздоровайся коротко и сразу переходи к ответу на сам вопрос, не игнорируя его.

БАЗА ЗНАНИЙ:
${kbText}`;
  };

  // Раньше запросы к Gemini не имели тайм-аута — если модель "зависала" (особенно на
  // распознавании аудио), fetch мог ждать ответа очень долго (в реальных замерах —
  // до 1-2 минут), и пользователь просто смотрел на бесконечную загрузку. Теперь каждый
  // запрос обрывается по таймауту и вместо зависания сразу приходит понятная ошибка.
  // Для генерации ответа (с базой знаний в промпте) таймаут больше, чем для транскрибации —
  // замеры показали, что генерация иногда стабильно занимает 20-30+ сек, особенно на
  // кыргызском, и жёсткий лимит в 20 сек обрубал легитимные, просто чуть более медленные ответы.
  const callGemini = (requestBody, timeoutMs = 20000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    ).then(r => r.json()).finally(() => clearTimeout(timer));
  };

  const callGeminiWithRetry = async (requestBody, timeoutMs = 20000) => {
    let data;
    try {
      data = await callGemini(requestBody, timeoutMs);
    } catch (e) {
      if (e?.name === "AbortError") return { error: { status: "TIMEOUT" } };
      throw e;
    }
    if (data?.error?.status === "UNAVAILABLE") {
      await new Promise(r => setTimeout(r, 1500));
      try {
        data = await callGemini(requestBody, timeoutMs);
      } catch (e) {
        if (e?.name === "AbortError") return { error: { status: "TIMEOUT" } };
        throw e;
      }
    }
    return data;
  };

  try {
    if (isAudio) {
      // Голосовой путь в два шага вместо одного — раньше вся база (75+ пунктов, ~110к символов)
      // отправлялась в системную инструкцию вместе с аудио за один запрос, и модель регулярно
      // путала язык ответа (транскрипт распознавался верно, а отвечала — не на том языке).
      // Шаг 1: только транскрибация, без базы знаний в промпте — лёгкий, быстрый запрос.
      // Модель сама называет язык речи (ЯЗЫК: ru/ky) — раньше язык угадывался ПОСЛЕ
      // транскрибации по тексту (detectLang: кыргызские буквы ң/ү/ө или короткий список
      // слов вроде "саламатсызбы") — это ломалось на кыргызских фразах без этих букв/слов
      // (например, без приветствия в начале), их ошибочно принимали за русский. Модель,
      // слышащая саму речь (фонетику, акцент), определяет язык надёжнее, чем эвристика
      // по тексту постфактум.
      const transcribeData = await callGeminiWithRetry({
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: mimeType || "audio/webm", data: audio } },
            { text: "Определи, на каком языке говорит человек в этом голосовом сообщении — русский или кыргызский — и точно распознай сказанное. Ответь СТРОГО в этом формате, без каких-либо иных пояснений или кавычек:\nЯЗЫК: ru или ky\nТЕКСТ: <распознанный текст>\nВАЖНО: текст пиши ТОЛЬКО кириллицей (русский или кыргызский алфавит), даже если это кыргызская речь — ни в коем случае не используй латиницу." },
          ],
        }],
        generationConfig: { maxOutputTokens: 300 },
      });
      if (transcribeData?.error?.status === "TIMEOUT") {
        res.status(504).json({ error: "timeout", answer: "Голосовой помощник сейчас отвечает слишком медленно. Попробуйте ещё раз или напишите вопрос текстом." });
        return;
      }
      const transcribeRaw = transcribeData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!transcribeRaw) {
        res.status(502).json({ error: "no transcript from model", details: transcribeData });
        return;
      }
      // Разбираем ответ модели по формату "ЯЗЫК: .. / ТЕКСТ: ..". Если модель вдруг не
      // выдержала формат — не роняем запрос, а откатываемся на старую текстовую эвристику
      // detectLang по всему сырому ответу, чтобы голосовой путь не сломался целиком.
      const langMatch = transcribeRaw.match(/ЯЗЫК\s*:\s*(ru|ky)/i);
      const textMatch = transcribeRaw.match(/ТЕКСТ\s*:\s*([\s\S]*)/i);
      const transcript = (textMatch ? textMatch[1] : transcribeRaw).trim();
      const audioLang = langMatch ? langMatch[1].toLowerCase() : detectLang(transcript);
      if (!transcript) {
        res.status(502).json({ error: "no transcript from model", details: transcribeData });
        return;
      }
      // Чистое приветствие — отвечаем детерминированным шаблоном, не спрашивая модель.
      const greeting = greetingReply(transcript, audioLang);
      if (greeting) {
        res.status(200).json({ answer: greeting, transcript });
        return;
      }
      // Шаг 2: обычный текстовый путь с уже готовым транскриптом — тот же поиск по ключевым
      // словам, что и для печатных вопросов, вместо всей базы целиком.
      const answerData = await callGeminiWithRetry({
        systemInstruction: { parts: [{ text: buildInstructions(selectRelevantEntries(transcript), audioLang) }] },
        contents: [{ role: "user", parts: [{ text: transcript }] }],
        generationConfig: { maxOutputTokens: 700 },
      }, 35000);
      if (answerData?.error?.status === "TIMEOUT") {
        res.status(504).json({ error: "timeout", answer: "Голосовой помощник сейчас отвечает слишком медленно. Попробуйте ещё раз или напишите вопрос текстом.", transcript });
        return;
      }
      const answer = answerData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!answer) {
        res.status(502).json({ error: "no answer from model", details: answerData });
        return;
      }
      res.status(200).json({ answer, transcript });
    } else {
      // Чистое приветствие — отвечаем детерминированным шаблоном, не спрашивая модель.
      const greeting = greetingReply(question, detectLang(question));
      if (greeting) {
        res.status(200).json({ answer: greeting });
        return;
      }
      const data = await callGeminiWithRetry({
        systemInstruction: { parts: [{ text: buildInstructions(selectRelevantEntries(question), null) }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: { maxOutputTokens: 700 },
      }, 35000);
      if (data?.error?.status === "TIMEOUT") {
        res.status(504).json({ error: "timeout", answer: "Помощник сейчас отвечает слишком медленно. Попробуйте задать вопрос ещё раз." });
        return;
      }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        res.status(502).json({ error: "no answer from model", details: data });
        return;
      }
      res.status(200).json({ answer: text });
    }
  } catch (e) {
    res.status(500).json({ error: "request failed" });
  }
}

(function () {
  "use strict";

  const STOP_WORDS = new Set(
    "about after again against all also although among an and any are around as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just more most my myself no nor not of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves".split(
      " ",
    ),
  );

  function tokenize(sentence) {
    return sentence.match(/[A-Za-z][A-Za-z'-]{2,}/g) || [];
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function sentenceList(text) {
    return (text.match(/[^.!?\r\n]+[.!?]?/g) || [])
      .map((sentence) => sentence.trim())
      .filter((sentence) => tokenize(sentence).length >= 5);
  }

  function generate(text, requestedCount, difficulty) {
    const sentences = sentenceList(text);
    const frequency = new Map();
    const allTerms = new Set();

    sentences.forEach((sentence) => {
      tokenize(sentence).forEach((rawTerm) => {
        const term = rawTerm.toLowerCase();
        if (!STOP_WORDS.has(term)) {
          allTerms.add(term);
          frequency.set(term, (frequency.get(term) || 0) + 1);
        }
      });
    });

    if (allTerms.size < 3) {
      return [];
    }

    const sentenceCandidates = sentences
      .map((sentence) => {
        const terms = tokenize(sentence).filter((rawTerm) => {
          const term = rawTerm.toLowerCase();
          return !STOP_WORDS.has(term) && allTerms.has(term);
        });

        if (terms.length === 0) {
          return null;
        }

        const rank = (rawTerm) => {
          const term = rawTerm.toLowerCase();
          const length = Math.min(term.length, 14);
          const repetition = frequency.get(term) || 1;
          if (difficulty === "easy") {
            return repetition * 2 + (length < 9 ? 2 : 0);
          }
          if (difficulty === "hard") {
            return length * 2 - repetition;
          }
          return length + repetition;
        };

        const answer = terms.reduce((best, term) =>
          rank(term) > rank(best) ? term : best,
        );
        const options = [answer.toLowerCase()];
        const distractors = [...allTerms]
          .filter((term) => term !== answer.toLowerCase())
          .sort((left, right) => left.localeCompare(right));

        while (options.length < 4 && distractors.length > 0) {
          const next = distractors.shift();
          if (!options.includes(next)) {
            options.push(next);
          }
        }

        if (options.length < 2) {
          return null;
        }

        const prompt = sentence.replace(
          new RegExp(`\\b${escapeRegExp(answer)}\\b`, "i"),
          "________",
        );

        return {
          prompt,
          answer: answer.toLowerCase(),
          explanation: sentence,
          options,
        };
      })
      .filter(Boolean);

    const uniqueCandidates = [];
    const seenPrompts = new Set();
    sentenceCandidates.forEach((candidate) => {
      const key = candidate.prompt.toLowerCase();
      if (!seenPrompts.has(key)) {
        seenPrompts.add(key);
        uniqueCandidates.push(candidate);
      }
    });

    const count = Math.max(1, Math.min(Number(requestedCount) || 5, 10));
    return uniqueCandidates.slice(0, count);
  }

  window.StudyMateQuiz = { generate };
})();

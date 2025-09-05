export function validateChallenges(challenges: Challenge[]): [Challenge[], ChallengeErrors[]] {
  const validChallenges: Challenge[] = [];
  const challengeErrors: ChallengeErrors[] = [];
  const mainPhrasesSeen = new Set<string>();
  for (let i = 0; i < challenges!.length; ++i) {
    const challenge = challenges![i];
    let isThisChallengeValid = true;
    // validate the main phrase
    if (!challenge.Main) {
      challengeErrors.push({ index: i, message: 'The "Main" property is missing.' });
      isThisChallengeValid = false;
    }
    if (typeof challenge.Main !== "string") {
      challengeErrors.push({ index: i, message: `The "Main" property is not a string, but is ${typeof challenge.Main}.` });
      isThisChallengeValid = false;
    }
    // although guidance is that Main phrase should be no more than 2 words long, only hard-enforce a 4 word limit
    if (challenge.Main.split(" ").length > 4) {
      challengeErrors.push({ index: i, message: `The "Main" property "${challenge.Main}" is more than 2 words long.` });
      isThisChallengeValid = false;
    }
    if (mainPhrasesSeen.has(challenge.Main)) {
      challengeErrors.push({ index: i, message: `The "Main" property must be unique, but "${challenge.Main}" is duplicated.` });
      isThisChallengeValid = false;
    } else {
      mainPhrasesSeen.add(challenge.Main);
    }
    // validate the related phrases
    if (!challenge.Related) {
      challengeErrors.push({ index: i, message: 'The "Related" property is missing.' });
      isThisChallengeValid = false;
    }
    if (!Array.isArray(challenge.Related)) {
      challengeErrors.push({ index: i, message: `The "Related" property is not an array, but is ${typeof challenge.Related}.` });
      isThisChallengeValid = false;
    }
    if (challenge.Related.length !== 4) {
      challengeErrors.push({ index: i, message: `The "Related" property must be an array of exactly 4 strings, but has ${challenge.Related.length}.` });
      isThisChallengeValid = false;
    }
    if (challenge.Related.some(c => typeof c !== "string")) {
      challengeErrors.push({ index: i, message: `The "Related" property must be an array of strings, but one or more elements are not strings.` });
      isThisChallengeValid = false;
    }
    const overlongRelatedPhrases = challenge.Related.filter(c => c.split(" ").length > 2);
    if (overlongRelatedPhrases.length > 0) {
      challengeErrors.push({ index: i, message: `The "Related" property must be an array of strings, each 1-2 words long, but the following are too long: ${overlongRelatedPhrases.join(", ")}.` });
      isThisChallengeValid = false;
    }

    if (isThisChallengeValid) {
      validChallenges.push(challenge);
    }
  }
  return [validChallenges, challengeErrors];
}

export default validateChallenges
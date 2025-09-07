const finalOutputGuidance = `Output a JSON document that is a list of objects
where each object contains a string property "Main" and a list of strings property "Related".
Example: For the theme of "Animals", the output may start with the following phrase challenges...
[
  {
    "Main": "Lion",
    "Related": ["Big Cat", "Jungle", "Pride", "Roar"]
  },
  {
    "Main": "Elephant",
    "Related": ["Trunk", "Tusks", "Safari", "Africa"]
  },
  {
    "Main": "Eagle",
    "Related": ["Bird", "American", "Bald", "Freedom"]
  },
  {
    "Main": "Dolphin",
    "Related": ["Intelligent", "Ocean", "Mammal", "Playful"]
  },
  ...
]

DO:
- Ensure that the output is valid JSON.
- Ensure that each challenge has a Main string property that is a noun phrase of 1-2 words.
- Ensure that each challenge has a Related array property that contains exactly 4 strings, each 1-2 words long.
- Ensure that each Related phrase is unique within its challenge.
- Ensure that each Related phrase is not a subset of the Main phrase.
- Ensure that each Related phrase does not contain articles or short prepositions.

Include only the JSON as output.
Do not include additional text, even to explain or apologize for mistakes.
`;

export default finalOutputGuidance;
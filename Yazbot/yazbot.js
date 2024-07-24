const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

// Parse JSON bodies
app.use(bodyParser.json());
app.use(cors());

const text = `Ziri is your dedicated tech partner, bringing innovative solutions to localized servers in Algeria and beyond. Our mission is to empower your projects with robust, localized technology tailored to your unique needs.

Services of Ziri:

1-/ Localized Server Solutions:
We provide server rigs tailored to your needs, ensuring your infrastructure is robust, secure, and scalable.\n

2-/ Customizable Git and Docker Solutions:
Enhance your development processes with our localized versions of Git and Docker, designed for seamless integration and high performance.\n

3-/ Flexible API Key Licensing:
Access our technology functionalities with API keys, acting as license keys, ensuring secure and personalized access to our solutions.\n

The Employees:
IT Manager and builder of Ziri, Boujelouah Massinissa.
The Assistant Younes, whom Massinissa is grateful to have.

Contacts for Ziri:
ziri.support@gmail.com`;

const nameRegex = /([A-Z][a-z]+(?:-[A-Z][a-z]+)*)\s+([A-Z][a-z]+(?:-[A-Z][a-z]+)*)/;

function extractInformation(inputText) {
  const lines = inputText.split('\n');
  let namesAndTitles = [];

  for (let line of lines) {
    const match = line.match(nameRegex);
    if (match) {
      const nameAndTitle = `${match[0]} - ${line.split(':')[0].trim()}`;
      namesAndTitles.push(nameAndTitle);
    }
  }

  return namesAndTitles;
}

function answerQuestion(question, extractedInfo) {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("why") && lowerQuestion.includes("company")) {
    return "Ziri is dedicated to turning visions into reality, blending innovation with skill to craft digital solutions that exceed expectations.";
  } else if (lowerQuestion.includes("who works") || lowerQuestion.includes("employees") || lowerQuestion.includes("workers") || lowerQuestion.includes("team")) {
    const employees = text.match(/The Employees:([\s\S]+)Contacts/)[1].trim();
    return employees;
  } else if (lowerQuestion.includes("name") || lowerQuestion.includes("company name")) {
    return `The name of the company is Ziri.`;
  } else if (lowerQuestion.includes("description") || lowerQuestion.includes("more information") || lowerQuestion.includes("about")) {
    return text.split("\n\n")[0];
  } else if (lowerQuestion.includes("services") || lowerQuestion.includes("they do") || lowerQuestion.includes("offer")) {
    return text.split("Services of Ziri:")[1].split("The Employees")[0].trim();
  } else if (lowerQuestion.includes("contact") || lowerQuestion.includes("contacts") || lowerQuestion.includes("reach")) {
    return text.split("Contacts for Ziri:")[1].trim();
  } else if (lowerQuestion.includes("titles") || lowerQuestion.includes("roles")) {
    return extractedInfo.join('\n');
  } else {
    return null; // Return null if no match found
  }
}

function extractKeywords(phrase) {
  const stopwords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'of', 'is', 'are', 'was', 'were', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'have', 'has', 'had', 'do', 'does', 'did', 'give', 'me', 'all', 'similar', 'to'];

  const words = phrase.split(/\W+/);

  const keywords = words.filter(word => {
    return word && word[0] === word[0].toUpperCase() && !stopwords.includes(word.toLowerCase());
  });

  return keywords;
}

async function searchWikipedia(query) {
  try {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&titles=${query}`;
    const response = await axios.get(apiUrl);
    const pages = response.data.query.pages;

    if (!pages || Object.keys(pages).length === 0) {
      throw new Error('No pages found');
    }

    const pageId = Object.keys(pages)[0];
    const extract = pages[pageId].extract;

    if (extract) {
      return extract;
    } else {
      const data = await getWikipediaData(pageId);
      if (data) {
        const { title, url, extract } = data;
        return { title, url, extract };
      } else {
        return "I'm sorry, I couldn't find any information on that topic.";
      }
    }
  } catch (error) {
    console.error("Error searching Wikipedia:", error);
    return "I'm sorry, I couldn't find any information on that topic.";
  }
}

async function getWikipediaData(pageId) {
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info|extracts&inprop=url&explaintext=true&pageids=${pageId}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data.query.pages[pageId];
    const title = data.title;
    const url = data.fullurl;
    const extract = data.extract;
    return { title, url, extract };
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

function collectFeedback(feedback, context) {
  console.log("Thank you for your feedback! It will help improve Ziri's responses in the future.");
  const feedbackData = { context, feedback };

  let existingFeedback = [];
  try {
    existingFeedback = JSON.parse(fs.readFileSync('feedback.json'));
  } catch (error) {
    console.error("Error reading existing feedback data:", error);
  }

  existingFeedback.push(feedbackData);

  fs.writeFileSync('feedback.json', JSON.stringify(existingFeedback, null, 2));
}

async function handleInput(req, res, next) {
  const input = req.body && req.body.question;
  if (!input) {
    return res.status(400).json({ error: "Question is missing in the request body" });
  }

  const processedInput = input.trim();
  const extractedInfo = extractInformation(text);
  const answer = answerQuestion(processedInput, extractedInfo);

  if (answer) {
    res.json({ answer });
  } else {
    next();
  }
}

async function searchHandler(req, res) {
  const input = req.body && req.body.question;
  const query = extractKeywords(input).join(' ');

  try {
    const response = await searchWikipedia(query);
    collectFeedback(input, response);
    res.json({ answer: response });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

app.post('/ask', handleInput, searchHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

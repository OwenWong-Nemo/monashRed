const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Route short cut
const root = path.join(__dirname, 'public');
const branch1 = path.join(__dirname, 'branch1');
const branch2 = path.join(__dirname, 'branch2');
const branch3 = path.join(__dirname, 'branch3');

app.use(express.static(root));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

/**
 * Routes
 */

/**
 * Root
 */

// Landing Page
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

// About Us
app.get('/aboutUs', (req, res) => {
  res.sendFile(path.join(root, 'aboutUs.html'));
});

// Research Topic
app.get('/researchTopic', (req, res) => {
  res.sendFile(path.join(root, 'researchTopic.html'));
});

// Our Mission
app.get('/ourMission', (req, res) => {
  res.sendFile(path.join(root, 'ourMission.html'));
});

// Challenges
app.get('/challenges', (req, res) => {
  res.sendFile(path.join(root, 'challenges.html'));
});

// Contact Us
app.get('/contactUs', (req, res) => {
  res.sendFile(path.join(root, 'contactUs.html'));
});

// Q&A
app.get('/qAndA', (req, res) => {
  res.sendFile(path.join(root, 'qAndA.html'));
});

// Branch1 
app.get('/ParentsLandingPage', (req, res) => {
  res.sendFile(path.join(root, 'branch1', 'parentsLandingPage.html'));
});

// Branch2
app.get('/genInfoLandingPage', (req, res) => {
  res.sendFile(path.join(root, 'branch2', 'genInfoLandingPage.html'));
});

// Branch3
app.get('/ourSoluLandingPage', (req, res) => {
  res.sendFile(path.join(root, 'branch3', 'ourSoluLandingPage.html'));
});

// Testing
app.get('/prototype3d', (req, res) => {
  res.sendFile(path.join(root, 'prototype3d.html'))
})

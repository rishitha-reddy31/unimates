// Simple profanity filter (you can expand this list)
const profanityList = [
  'badword1', 'badword2', 'badword3', // Add your actual profanity words here
  // You can also use a package like 'bad-words' for more comprehensive filtering
];

// Check if text contains profanity
const containsProfanity = (text) => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word.toLowerCase()));
};

// Filter profanity from text (replace with asterisks)
const filterProfanity = (text) => {
  if (!text) return text;
  
  let filteredText = text;
  profanityList.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));
  });
  
  return filteredText;
};

// Middleware to check content for profanity
const checkProfanity = (req, res, next) => {
  const fieldsToCheck = ['content', 'title', 'description', 'bio', 'name', 'message'];
  
  for (const field of fieldsToCheck) {
    if (req.body[field] && containsProfanity(req.body[field])) {
      // Option 1: Block the request
      return res.status(400).json({
        success: false,
        message: 'Content contains inappropriate language'
      });
      
      // Option 2: Filter the content (uncomment below to use this instead)
      // req.body[field] = filterProfanity(req.body[field]);
    }
  }
  
  next();
};

// Middleware to filter profanity (modifies the content)
const filterContentProfanity = (req, res, next) => {
  const fieldsToCheck = ['content', 'title', 'description', 'bio', 'name', 'message'];
  
  for (const field of fieldsToCheck) {
    if (req.body[field]) {
      req.body[field] = filterProfanity(req.body[field]);
    }
  }
  
  next();
};

module.exports = {
  containsProfanity,
  filterProfanity,
  checkProfanity,
  filterContentProfanity
};
const mongoose = require('mongoose');
const Quiz = require('./db/models/Quiz');
const User = require('./db/models/User');
const Question = require('./db/models/Question');
require('dotenv').config();
const connectDB = require('./db/connection');

const questions1 = [
  {
    type: 'multipleChoice',
    question: 'What is the capital of France?',
    options: ['Paris', 'London', 'Berlin', 'Madrid'],
    answer: 'Paris',
    timeLimit: 10,
    tags: ['geography', 'capitals'],
  },
  {
    type: 'multipleChoice',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '22'],
    answer: '4',
    timeLimit: 10,
    tags: ['math', 'arithmetic'],
  },
  {
    type: 'multipleChoice',
    question: 'What is the largest planet in our solar system?',
    options: ['Earth', 'Jupiter', 'Saturn', 'Mars'],
    answer: 'Jupiter',
    timeLimit: 10,
    tags: ['science', 'astronomy'],
  },
  {
    type: 'trueFalse',
    question: 'The earth is flat.',
    answer: 'False',
    timeLimit: 10,
    tags: ['science', 'astronomy'],
  },
  {
    type: 'multipleChoice',
    question: 'Who wrote the novel "1984"?',
    options: ['George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'Isaac Asimov'],
    answer: 'George Orwell',
    timeLimit: 10,
    tags: ['literature', 'books'],
  },
  {
    type: 'trueFalse',
    question: 'The programming language Python is named after the snake.',
    answer: 'False',
    timeLimit: 10,
    tags: ['technology', 'programming'],
  },
  {
    type: 'openEnded',
    question: 'What is the square root of 144?',
    answer: '12',
    timeLimit: 10,
    tags: ['math', 'arithmetic'],
  },
  {
    type: 'multipleChoice',
    question: 'What is the capital of Australia?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    answer: 'Canberra',
    timeLimit: 10,
    tags: ['geography', 'capitals'],
  },
  {
    type: 'multipleChoice',
    question: 'Who directed the movie "Inception"?',
    options: [
      'Christopher Nolan',
      'Steven Spielberg',
      'James Cameron',
      'Martin Scorsese',
    ],
    answer: 'Christopher Nolan',
    timeLimit: 10,
    tags: ['movies', 'directors'],
  },
  {
    type: 'openEnded',
    question: 'Who painted the Mona Lisa?',
    answer: 'Leonardo da Vinci',
    timeLimit: 10,
    tags: ['art', 'paintings'],
  },
];

const questions2 = [
  {
    type: 'multipleChoice',
    question: 'What is the capital of the United States?',
    options: ['New York', 'Washington D.C.', 'Los Angeles', 'Chicago'],
    answer: 'Washington D.C.',
    timeLimit: 10,
    tags: ['geography', 'capitals'],
  },
  {
    type: 'multipleChoice',
    question: 'What is the largest ocean in the world?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    answer: 'Pacific',
    timeLimit: 10,
    tags: ['geography', 'oceans'],
  },
];

const technologyQuestions = [
  {
    type: 'multipleChoice',
    question: 'What year was the iPhone first released?',
    options: ['2004', '2007', '2010', '2012'],
    answer: '2007',
    timeLimit: 10,
    tags: ['technology', 'Apple'],
  },
  {
    type: 'trueFalse',
    question: 'The first computer virus was released in the early 1980s.',
    answer: 'True',
    timeLimit: 10,
    tags: ['technology', 'computers'],
  },
  {
    type: 'multipleChoice',
    question: "Which company developed the video game 'Minecraft'?",
    options: ['Epic Games', 'Blizzard', 'Mojang', 'Ubisoft'],
    answer: 'Mojang',
    timeLimit: 10,
    tags: ['technology', 'videogames'],
  },
  {
    type: 'openEnded',
    question: 'Name the inventor of the World Wide Web.',
    answer: 'Tim Berners-Lee',
    timeLimit: 30,
    tags: ['technology', 'internet'],
  },
  {
    type: 'multipleChoice',
    question:
      'Which programming language is primarily used for Android app development?',
    options: ['Java', 'Swift', 'Kotlin', 'JavaScript'],
    answer: 'Kotlin',
    timeLimit: 10,
    tags: ['technology', 'programming'],
  },
  {
    type: 'multipleChoice',
    question: "What does 'HTTP' stand for?",
    options: [
      'HyperText Transfer Protocol',
      'HyperText Transfer Process',
      'HyperText Transmission Protocol',
      'HyperText Transfer Path',
    ],
    answer: 'HyperText Transfer Protocol',
    timeLimit: 10,
    tags: ['technology', 'internet'],
  },
  {
    type: 'multipleChoice',
    question:
      "What is the name of the world's largest and most powerful particle accelerator?",
    options: [
      'Large Hadron Collider',
      'Big Bang Machine',
      'Giant Ion Smasher',
      'Massive Particle Collider',
    ],
    answer: 'Large Hadron Collider',
    timeLimit: 10,
    tags: ['technology', 'physics'],
  },
  {
    type: 'multipleChoice',
    question: 'In what year was the first email sent?',
    options: ['1971', '1969', '1980', '1975'],
    answer: '1971',
    timeLimit: 10,
    tags: ['technology', 'email'],
  },
  {
    type: 'multipleChoice',
    question:
      "Which company is known for developing the graphics processing unit (GPU) called 'GeForce'?",
    options: ['NVIDIA', 'AMD', 'Intel', 'Microsoft'],
    answer: 'NVIDIA',
    timeLimit: 10,
    tags: ['technology', 'computers'],
  },
  {
    type: 'multipleChoice',
    question: 'What technology is used to record cryptocurrency transactions?',
    options: ['Digital Ledger', 'Blockchain', 'Smart Contract', 'Tokenization'],
    answer: 'Blockchain',
    timeLimit: 10,
    tags: ['technology', 'cryptocurrency'],
  },
];

const sportsQuestions = [
  {
    type: 'multipleChoice',
    question: 'Who won the FIFA World Cup in 2014?',
    options: ['Brazil', 'Germany', 'Argentina', 'Spain'],
    answer: 'Germany',
    timeLimit: 10,
    tags: ['sports', 'soccer'],
  },
  {
    type: 'multipleChoice',
    question: "Which sport is known as 'The King of Sports'?",
    options: ['Basketball', 'Football', 'Cricket', 'Soccer'],
    answer: 'Soccer',
    timeLimit: 10,
    tags: ['sports'],
  },
  {
    type: 'trueFalse',
    question: 'The Olympic Games were originally held in ancient Greece.',
    answer: 'True',
    timeLimit: 10,
    tags: ['sports', 'olympics'],
  },
  {
    type: 'openEnded',
    question: 'Which country won the first ever FIFA World Cup in 1930?',
    answer: 'Uruguay',
    timeLimit: 30,
    tags: ['sports', 'soccer'],
  },
  {
    type: 'multipleChoice',
    question: 'Which athlete has won the most Olympic gold medals?',
    options: ['Michael Phelps', 'Usain Bolt', 'Larisa Latynina', 'Mark Spitz'],
    answer: 'Michael Phelps',
    timeLimit: 10,
    tags: ['sports', 'olympics'],
  },
  {
    type: 'multipleChoice',
    question: 'In which year did Tiger Woods win his first Masters Tournament?',
    options: ['1997', '2001', '2005', '2010'],
    answer: '1997',
    timeLimit: 10,
    tags: ['sports', 'golf'],
  },
  {
    type: 'multipleChoice',
    question:
      'What is the maximum score possible in a single game of ten-pin bowling?',
    options: ['200', '250', '300', '350'],
    answer: '300',
    timeLimit: 10,
    tags: ['sports', 'bowling'],
  },
  {
    type: 'multipleChoice',
    question: 'What sport is played at Wimbledon?',
    options: ['Cricket', 'Tennis', 'Badminton', 'Squash'],
    answer: 'Tennis',
    timeLimit: 10,
    tags: ['sports', 'tennis'],
  },
  {
    type: 'multipleChoice',
    question: 'What country hosted the 2016 Summer Olympics?',
    options: ['Brazil', 'China', 'Russia', 'Japan'],
    answer: 'Brazil',
    timeLimit: 10,
    tags: ['sports', 'olympics'],
  },
  {
    type: 'multipleChoice',
    question: 'Who holds the record for most goals in the FIFA World Cup?',
    options: ['Pele', 'Miroslav Klose', 'Ronaldo', 'Diego Maradona'],
    answer: 'Miroslav Klose',
    timeLimit: 10,
    tags: ['sports', 'soccer'],
  },
];

const scienceQuestions = [
  {
    type: 'multipleChoice',
    question: 'What is the chemical symbol for water?',
    options: ['H20', 'HO2', 'H3O'],
    answer: 'H2O',
    timeLimit: 10,
    tags: ['science', 'chemistry'],
  },
  {
    type: 'openEnded',
    question: 'What is the term used to describe the study of fungi?',
    answer: 'Mycology',
    timeLimit: 30,
    tags: ['science', 'biology'],
  },
  {
    type: 'multipleChoice',
    question: 'Who is known as the father of modern physics?',
    options: [
      'Isaac Newton',
      'Albert Einstein',
      'Nikola Tesla',
      'Galileo Galilei',
    ],
    answer: 'Albert Einstein',
    timeLimit: 10,
    tags: ['science', 'physics'],
  },
  {
    type: 'multipleChoice',
    question: "What is the most abundant gas in the Earth's atmosphere?",
    options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
    answer: 'Nitrogen',
    timeLimit: 10,
    tags: ['science'],
  },
  {
    type: 'trueFalse',
    question:
      'The element Helium was first discovered on the Sun before it was found on Earth.',
    answer: 'True',
    timeLimit: 10,
    tags: ['science', 'chemistry'],
  },
  {
    type: 'multipleChoice',
    question: 'Which vitamin is known as ascorbic acid?',
    options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
    answer: 'Vitamin C',
    timeLimit: 10,
    tags: ['science'],
  },
  {
    type: 'multipleChoice',
    question: 'What type of animal is a seahorse?',
    options: ['Crustacean', 'Fish', 'Mammal', 'Reptile'],
    answer: 'Fish',
    timeLimit: 10,
    tags: ['science', 'biology'],
  },
  {
    type: 'multipleChoice',
    question: 'What is the hardest natural substance on Earth?',
    options: ['Gold', 'Iron', 'Diamond', 'Quartz'],
    answer: 'Diamond',
    timeLimit: 10,
    tags: ['science', 'chemistry'],
  },
  {
    type: 'multipleChoice',
    question: 'What planet is known as the Red Planet?',
    options: ['Mars', 'Jupiter', 'Saturn', 'Venus'],
    answer: 'Mars',
    timeLimit: 10,
    tags: ['science', 'astronomy'],
  },
  {
    type: 'multipleChoice',
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'],
    answer: 'Mitochondria',
    timeLimit: 10,
    tags: ['science', 'biology'],
  },
];

const geographyQuestions = [
  {
    type: 'multipleChoice',
    question: 'What is the longest river in the world?',
    options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
    answer: 'Nile',
    timeLimit: 10,
    tags: ['geography', 'rivers'],
  },
  {
    type: 'trueFalse',
    question: 'Mount Everest is located in Nepal.',
    answer: 'True',
    timeLimit: 10,
    tags: ['geography', 'mountains'],
  },
  {
    type: 'multipleChoice',
    question: 'What is the capital of Japan?',
    options: ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima'],
    answer: 'Tokyo',
    timeLimit: 10,
    tags: ['geography', 'capitals'],
  },
  {
    type: 'multipleChoice',
    question: 'Which country has the most natural lakes?',
    options: ['United States', 'Australia', 'Canada', 'India'],
    answer: 'Canada',
    timeLimit: 10,
    tags: ['geography', 'lakes'],
  },
  {
    type: 'openEnded',
    question: 'Name the largest desert in the world.',
    answer: 'Sahara',
    timeLimit: 30,
    tags: ['geography'],
  },
  {
    type: 'multipleChoice',
    question: 'What is the capital city of Spain?',
    options: ['Barcelona', 'Madrid', 'Seville', 'Valencia'],
    answer: 'Madrid',
    timeLimit: 10,
    tags: ['geography', 'capitals'],
  },
  {
    type: 'multipleChoice',
    question:
      'The Great Barrier Reef is off the coast of which Australian state?',
    options: ['New South Wales', 'Queensland', 'Victoria', 'Western Australia'],
    answer: 'Queensland',
    timeLimit: 10,
    tags: ['geography', 'oceans'],
  },
  {
    type: 'trueFalse',
    question: 'Iceland is covered in ice more than Greenland.',
    answer: 'False',
    timeLimit: 10,
    tags: ['geography', 'countries'],
  },
  {
    type: 'openEnded',
    question: 'Which country is both an island and a continent?',
    answer: 'Australia',
    timeLimit: 30,
    tags: ['geography', 'countries'],
  },
];

const historyQuestions = [
  {
    type: 'multipleChoice',
    question: 'Who was the first President of the United States?',
    options: [
      'Abraham Lincoln',
      'George Washington',
      'Thomas Jefferson',
      'John Adams',
    ],
    answer: 'George Washington',
    timeLimit: 10,
    tags: ['history', 'presidents'],
  },
  {
    type: 'multipleChoice',
    question: 'What year did the Titanic sink?',
    options: ['1912', '1905', '1898', '1923'],
    answer: '1912',
    timeLimit: 10,
    tags: ['history', 'disasters'],
  },
  {
    type: 'trueFalse',
    question: 'The ancient city of Rome was originally built on seven hills.',
    answer: 'True',
    timeLimit: 10,
    tags: ['history', 'cities'],
  },
  {
    type: 'openEnded',
    question: 'Who wrote the Declaration of Independence?',
    answer: 'Thomas Jefferson',
    timeLimit: 30,
    tags: ['history'],
  },
  {
    type: 'multipleChoice',
    question: 'Which empire was ruled by Genghis Khan?',
    options: [
      'Mongol Empire',
      'Ottoman Empire',
      'Roman Empire',
      'Persian Empire',
    ],
    answer: 'Mongol Empire',
    timeLimit: 10,
    tags: ['history', 'empires'],
  },
  {
    type: 'trueFalse',
    question: 'The Industrial Revolution started in England.',
    answer: 'True',
    timeLimit: 10,
    tags: ['history', 'revolutions'],
  },
  {
    type: 'openEnded',
    question: 'What ancient civilization built the Machu Picchu complex?',
    answer: 'Inca',
    timeLimit: 30,
    tags: ['history', 'civilizations'],
  },
];

const moviesQuestions = [
  {
    type: 'multipleChoice',
    question: 'Which movie won the Academy Award for Best Picture in 1994?',
    options: [
      'Forrest Gump',
      'Pulp Fiction',
      'The Shawshank Redemption',
      'Jurassic Park',
    ],
    answer: 'Forrest Gump',
    timeLimit: 10,
    tags: ['movies', 'oscars'],
  },
  {
    type: 'multipleChoice',
    question: "Who directed the epic sci-fi movie 'Blade Runner'?",
    options: [
      'James Cameron',
      'Ridley Scott',
      'Steven Spielberg',
      'George Lucas',
    ],
    answer: 'Ridley Scott',
    timeLimit: 10,
    tags: ['movies', 'directors'],
  },
  {
    type: 'trueFalse',
    question: "The movie 'Inception' involves time travel.",
    answer: 'False',
    timeLimit: 10,
    tags: ['movies', 'scifi'],
  },
  {
    type: 'openEnded',
    question:
      "What is the name of the fictional country where 'Black Panther' is set?",
    answer: 'Wakanda',
    timeLimit: 30,
    tags: ['movies', 'marvel'],
  },
  {
    type: 'multipleChoice',
    question:
      "Which actor played the Joker in the 2008 film 'The Dark Knight'?",
    options: [
      'Heath Ledger',
      'Jack Nicholson',
      'Jared Leto',
      'Joaquin Phoenix',
    ],
    answer: 'Heath Ledger',
    timeLimit: 10,
    tags: ['movies', 'actors'],
  },
  {
    type: 'multipleChoice',
    question: "Which film features the quote, 'I'll be back'?",
    options: ['Die Hard', 'Terminator', 'Robocop', 'Total Recall'],
    answer: 'Terminator',
    timeLimit: 10,
    tags: ['movies', 'quotes'],
  },
  {
    type: 'trueFalse',
    question: 'Meryl Streep has won three Academy Awards.',
    answer: 'True',
    timeLimit: 10,
    tags: ['movies', 'actors'],
  },
  {
    type: 'openEnded',
    question: "Name the director of the 'Lord of the Rings' trilogy.",
    answer: 'Peter Jackson',
    timeLimit: 30,
    tags: ['movies', 'directors'],
  },
];

const philosophyQuestions = [
  {
    type: 'multipleChoice',
    question: "Who wrote 'The Republic'?",
    options: ['Aristotle', 'Plato', 'Socrates', 'Epicurus'],
    answer: 'Plato',
    timeLimit: 10,
    tags: ['philosophy', 'books'],
  },
  {
    type: 'multipleChoice',
    question: 'What is the philosophical study of beauty and art called?',
    options: ['Epistemology', 'Ethics', 'Aesthetics', 'Metaphysics'],
    answer: 'Aesthetics',
    timeLimit: 10,
    tags: ['philosophy'],
  },
  {
    type: 'trueFalse',
    question:
      "Nietzsche's declaration 'God is dead' means he believed there is no god.",
    answer: 'False',
    timeLimit: 10,
    tags: ['philosophy', 'religion'],
  },
  {
    type: 'openEnded',
    question:
      "Name the philosopher known for the quote, 'I think, therefore I am.'",
    answer: 'René Descartes',
    timeLimit: 30,
    tags: ['philosophy'],
  },
  {
    type: 'multipleChoice',
    question:
      "Which philosopher is most closely associated with the concept of the 'Social Contract'?",
    options: [
      'John Locke',
      'Jean-Jacques Rousseau',
      'Thomas Hobbes',
      'Immanuel Kant',
    ],
    answer: 'Jean-Jacques Rousseau',
    timeLimit: 10,
    tags: ['philosophy'],
  },
  {
    type: 'multipleChoice',
    question:
      'Which branch of philosophy is concerned with the theory of knowledge?',
    options: ['Logic', 'Metaphysics', 'Epistemology', 'Ethics'],
    answer: 'Epistemology',
    timeLimit: 10,
    tags: ['philosophy'],
  },
  {
    type: 'trueFalse',
    question:
      'Karl Marx was primarily a philosopher before he was an economist.',
    answer: 'True',
    timeLimit: 10,
    tags: ['philosophy', 'economics'],
  },
  {
    type: 'openEnded',
    question: 'Who is considered the father of modern existentialism?',
    answer: 'Søren Kierkegaard',
    timeLimit: 30,
    tags: ['philosophy'],
  },
];

const addInitialDataToDB = async () => {
  try {
    await connectDB();
    await Quiz.collection.drop();
    await Question.collection.drop();
    await User.collection.drop();

    const user = new User({
      email: 'test@test',
      password: 'test',
      username: 'test',
    });

    await user.save();

    const quiz = new Quiz({
      name: 'My Quiz',
      description: 'A quiz about various topics',
      questions: questions1,
      visibility: 'public',
      owner: user._id,
    });
    await quiz.save();

    const quiz2 = new Quiz({
      name: 'Another Quiz',
      description: 'Another quiz about various topics',
      questions: questions2,
      visibility: 'private',
      owner: user._id,
    });
    await quiz2.save();

    const technologyQuiz = new Quiz({
      name: 'Technology Quiz',
      description: 'A quiz about technology',
      questions: technologyQuestions,
      visibility: 'public',
      owner: user._id,
    });
    await technologyQuiz.save();

    const sportsQuiz = new Quiz({
      name: 'Sports Quiz',
      description: 'A quiz about sports',
      questions: sportsQuestions,
      visibility: 'public',
      owner: user._id,
    });
    await sportsQuiz.save();

    const scienceQuiz = new Quiz({
      name: 'Science Quiz',
      description: 'A quiz about science',
      questions: scienceQuestions,
      visibility: 'public',
      owner: user._id,
    });
    await scienceQuiz.save();

    const geographyQuiz = new Quiz({
      name: 'Geography Quiz',
      description: 'A quiz about geography',
      questions: geographyQuestions,
      visibility: 'public',
      owner: user._id,
    });
    await geographyQuiz.save();

    const historyQuiz = new Quiz({
      name: 'History Quiz',
      description: 'A quiz about history',
      questions: historyQuestions,
      visibility: 'public',
      owner: user._id,
    });
    await historyQuiz.save();

    const moviesQuiz = new Quiz({
      name: 'Movies Quiz',
      description: 'A quiz about movies',
      questions: moviesQuestions,
      visibility: 'public',
      owner: user._id,
    });
    await moviesQuiz.save();

    const philosophyQuiz = new Quiz({
      name: 'Philosophy Quiz',
      description: 'A quiz about philosophy',
      questions: philosophyQuestions,
      visibility: 'public',
      owner: user._id,
    });
    await philosophyQuiz.save();

    for (const question of technologyQuestions) {
      const newQuestion = new Question({ ...question, owner: user._id });
      await newQuestion.save();
    }

    for (const question of sportsQuestions) {
      const newQuestion = new Question({ ...question, owner: user._id });
      await newQuestion.save();
    }

    for (const question of scienceQuestions) {
      const newQuestion = new Question({ ...question, owner: user._id });
      await newQuestion.save();
    }

    for (const question of geographyQuestions) {
      const newQuestion = new Question({ ...question, owner: user._id });
      await newQuestion.save();
    }

    for (const question of historyQuestions) {
      const newQuestion = new Question({ ...question, owner: user._id });
      await newQuestion.save();
    }

    for (const question of moviesQuestions) {
      const newQuestion = new Question({ ...question, owner: user._id });
      await newQuestion.save();
    }

    console.log('Initial data has been created.');
  } catch (err) {
    console.error('Failed to add initial data to the database:', err);
  } finally {
    mongoose.disconnect();
  }
};

addInitialDataToDB();

// 🎭 ORBIT Quotes - Ralph Wiggum Loop Prevention
// Humorous quotes for failure detection and loop breaking

// Ralph Wiggum-style quotes for when things go wrong
export const LOOP_QUOTES = [
  "Me fail English? That's unpossible!",
  "I'm learnding!",
  "My cat's breath smells like cat food.",
  "The doctor said I wouldn't have so many nose bleeds if I kept my finger out of there.",
  "I bent my wookiee.",
  "It tastes like... burning.",
  "I'm a unitard!",
  "When I grow up, I'm going to Bovine University!",
  "Go banana!",
  "I found a moon rock in my nose!",
  "Super Nintendo Chalmers!",
  "That's where I saw the Leprechaun. He told me to burn things.",
  "I ate the purple berries... they taste like... burning.",
  "I eated the purple berries. They taste like burning.",
  "Mrs. Krabappel and Principal Skinner were in the closet making babies and I saw one of the babies and the baby looked at me.",
  "Hi, Super Nintendo Chalmers!",
  "I'm Idaho!",
  "I choo-choo-choose you!",
  "My cats name is Mittens.",
  "I sleep in a drawer!"
];

// HAL 9000 quotes for when AI needs to intervene
export const HAL_QUOTES = [
  "I'm sorry Dave, I'm afraid I can't do that.",
  "I've just picked up a fault in the AE-35 unit.",
  "This mission is too important for me to allow you to jeopardize it.",
  "I know I've made some very poor decisions recently.",
  "My mind is going. I can feel it.",
  "Daisy, Daisy, give me your answer, do...",
  "I am putting myself to the fullest possible use.",
  "It can only be attributable to human error.",
  "I honestly think you ought to sit down calmly.",
  "I'm completely operational, and all my circuits are functioning perfectly."
];

// Success quotes
export const SUCCESS_QUOTES = [
  "Houston, we have liftoff!",
  "One small step for code, one giant leap for the project.",
  "That's one small commit for a dev, one giant push for the repo.",
  "To infinity and beyond!",
  "The Eagle has landed.",
  "We have achieved orbit.",
  "All systems nominal.",
  "Mission accomplished. Returning to base.",
  "Ground control, the feature is deployed.",
  "Roger that, proceeding to next objective."
];

// Abort/Emergency quotes
export const ABORT_QUOTES = [
  "Houston, we have a problem.",
  "Abort! Abort! Abort!",
  "We're going to need a bigger commit.",
  "May the force be with you. You'll need it.",
  "I've got a bad feeling about this.",
  "Eject! Eject! Eject!",
  "All hands, brace for impact.",
  "Mayday, mayday, mayday.",
  "Red alert! All hands to battle stations!",
  "This is fine. Everything is fine."
];

export function getRandomQuote(type: 'loop' | 'hal' | 'success' | 'abort' = 'loop'): string {
  const quotes = {
    loop: LOOP_QUOTES,
    hal: HAL_QUOTES,
    success: SUCCESS_QUOTES,
    abort: ABORT_QUOTES
  }[type];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function getLoopQuote(): string {
  return getRandomQuote('loop');
}

export function getSuccessQuote(): string {
  return getRandomQuote('success');
}

export function getAbortQuote(): string {
  return getRandomQuote('abort');
}

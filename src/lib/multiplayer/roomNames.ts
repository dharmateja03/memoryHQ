// Funny adjectives
const adjectives = [
  'Chonky', 'Sneaky', 'Spicy', 'Crispy', 'Chunky', 'Wobbly', 'Giggly', 'Squishy',
  'Zesty', 'Funky', 'Wacky', 'Quirky', 'Groovy', 'Snazzy', 'Zippy', 'Perky',
  'Dizzy', 'Fuzzy', 'Goofy', 'Loopy', 'Nutty', 'Peppy', 'Silly', 'Witty',
  'Bouncy', 'Cheesy', 'Dorky', 'Freaky', 'Grumpy', 'Jumpy', 'Kooky', 'Lanky',
  'Moody', 'Nerdy', 'Puffy', 'Rusty', 'Sleepy', 'Toasty', 'Yappy', 'Zonky',
  'Beefy', 'Crusty', 'Dusty', 'Fluffy', 'Gnarly', 'Huffy', 'Icky', 'Janky',
  'Kinky', 'Lumpy', 'Murky', 'Nasty', 'Oozy', 'Punky', 'Raspy', 'Salty',
  'Tacky', 'Uppity', 'Vivid', 'Wonky', 'Yucky', 'Zealous', 'Bonkers', 'Clumsy',
];

// Funny nouns (brain/animal themed)
const nouns = [
  'Brain', 'Neuron', 'Synapse', 'Cortex', 'Genius', 'Noodle', 'Thinker', 'Noggin',
  'Unicorn', 'Penguin', 'Potato', 'Pickle', 'Waffle', 'Nugget', 'Muffin', 'Taco',
  'Llama', 'Alpaca', 'Panda', 'Sloth', 'Otter', 'Narwhal', 'Platypus', 'Walrus',
  'Burrito', 'Noodles', 'Biscuit', 'Pancake', 'Dumpling', 'Pretzel', 'Crumpet',
  'Wombat', 'Capybara', 'Axolotl', 'Quokka', 'Chinchilla', 'Hamster', 'Ferret',
  'Goblin', 'Wizard', 'Ninja', 'Pirate', 'Robot', 'Zombie', 'Viking', 'Yeti',
  'Banana', 'Coconut', 'Avocado', 'Mango', 'Papaya', 'Kumquat', 'Dragonfruit',
  'Donut', 'Cupcake', 'Cookie', 'Brownie', 'Cheesecake', 'Pudding', 'Jellybean',
];

/**
 * Generate a funny room name with a random 4-digit number
 * e.g., "ChonkyBrain-4521", "SneakyPenguin-1337"
 */
export function generateRoomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(1000 + Math.random() * 9000); // 4-digit number

  return `${adjective}${noun}-${number}`;
}

/**
 * Generate a room code (shorter, for easy sharing)
 * e.g., "BRAIN-4521"
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // No I, O to avoid confusion
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${code}-${number}`;
}

/**
 * Validate room code format
 */
export function isValidRoomCode(code: string): boolean {
  return /^[A-Z]{4}-\d{4}$/.test(code);
}

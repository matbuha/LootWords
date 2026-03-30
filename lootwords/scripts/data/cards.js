import { getRarityFromPoints } from "../core/rarity.js";

export const CARD_LIBRARY = [
  { id: "dog", word: "dog", category: "animals", icon: "🐶", image: "assets/images/cards/dog.png" },
  { id: "cat", word: "cat", category: "animals", icon: "🐱", image: "assets/images/cards/cat.png" },
  { id: "lion", word: "lion", category: "animals", icon: "🦁", image: "assets/images/cards/lion.png" },
  { id: "rabbit", word: "rabbit", category: "animals", icon: "🐰", image: "assets/images/cards/rabbit.png" },
  { id: "monkey", word: "monkey", category: "animals", icon: "🐵", image: "assets/images/cards/monkey.png" },
  { id: "elephant", word: "elephant", category: "animals", icon: "🐘", image: "assets/images/cards/elephant.png" },
  { id: "turtle", word: "turtle", category: "animals", icon: "🐢", image: "assets/images/cards/turtle.png" },
  { id: "banana", word: "banana", category: "food", icon: "🍌", image: "assets/images/cards/banana.png" },
  { id: "pizza", word: "pizza", category: "food", icon: "🍕", image: "assets/images/cards/pizza.png" },
  { id: "apple", word: "apple", category: "food", icon: "🍎", image: "assets/images/cards/apple.png" },
  { id: "burger", word: "burger", category: "food", icon: "🍔", image: "assets/images/cards/burger.png" },
  { id: "carrot", word: "carrot", category: "food", icon: "🥕", image: "assets/images/cards/carrot.png" },
  { id: "donut", word: "donut", category: "food", icon: "🍩", image: "assets/images/cards/donut.png" },
  { id: "cake", word: "cake", category: "food", icon: "🎂", image: "assets/images/cards/cake.png" },
  { id: "car", word: "car", category: "vehicles", icon: "🚗", image: "assets/images/cards/car.png" },
  { id: "bus", word: "bus", category: "vehicles", icon: "🚌", image: "assets/images/cards/bus.png" },
  { id: "train", word: "train", category: "vehicles", icon: "🚆", image: "assets/images/cards/train.png" },
  { id: "rocket", word: "rocket", category: "vehicles", icon: "🚀", image: "assets/images/cards/rocket.png" },
  { id: "bicycle", word: "bicycle", category: "vehicles", icon: "🚲", image: "assets/images/cards/bicycle.png" },
  { id: "airplane", word: "airplane", category: "vehicles", icon: "✈️", image: "assets/images/cards/airplane.png" },
  { id: "boat", word: "boat", category: "vehicles", icon: "🚤", image: "assets/images/cards/boat.png" },
  { id: "chair", word: "chair", category: "home-objects", icon: "🪑", image: "assets/images/cards/chair.png" },
  { id: "lamp", word: "lamp", category: "home-objects", icon: "💡", image: "assets/images/cards/lamp.png" },
  { id: "bed", word: "bed", category: "home-objects", icon: "🛏️", image: "assets/images/cards/bed.png" },
  { id: "clock", word: "clock", category: "home-objects", icon: "⏰", image: "assets/images/cards/clock.png" },
  { id: "sofa", word: "sofa", category: "home-objects", icon: "🛋️", image: "assets/images/cards/sofa.png" },
  { id: "mirror", word: "mirror", category: "home-objects", icon: "🪞", image: "assets/images/cards/mirror.png" },
  { id: "door", word: "door", category: "home-objects", icon: "🚪", image: "assets/images/cards/door.png" },
  { id: "hat", word: "hat", category: "clothes", icon: "👒", image: "assets/images/cards/hat.png" },
  { id: "shirt", word: "shirt", category: "clothes", icon: "👕", image: "assets/images/cards/shirt.png" },
  { id: "pants", word: "pants", category: "clothes", icon: "👖", image: "assets/images/cards/pants.png" },
  { id: "shoe", word: "shoe", category: "clothes", icon: "👟", image: "assets/images/cards/shoe.png" },
  { id: "dress", word: "dress", category: "clothes", icon: "👗", image: "assets/images/cards/dress.png" },
  { id: "sock", word: "sock", category: "clothes", icon: "🧦", image: "assets/images/cards/sock.png" },
  { id: "scarf", word: "scarf", category: "clothes", icon: "🧣", image: "assets/images/cards/scarf.png" },
  { id: "tree", word: "tree", category: "nature", icon: "🌳", image: "assets/images/cards/tree.png" },
  { id: "flower", word: "flower", category: "nature", icon: "🌸", image: "assets/images/cards/flower.png" },
  { id: "cloud", word: "cloud", category: "nature", icon: "☁️", image: "assets/images/cards/cloud.png" },
  { id: "sun", word: "sun", category: "nature", icon: "☀️", image: "assets/images/cards/sun.png" },
  { id: "moon", word: "moon", category: "nature", icon: "🌙", image: "assets/images/cards/moon.png" },
  { id: "star", word: "star", category: "nature", icon: "⭐", image: "assets/images/cards/star.png" },
  { id: "rainbow", word: "rainbow", category: "nature", icon: "🌈", image: "assets/images/cards/rainbow.png" },
  { id: "robot", word: "robot", category: "toys", icon: "🤖", image: "assets/images/cards/robot.png" },
  { id: "teddy", word: "teddy", category: "toys", icon: "🧸", image: "assets/images/cards/teddy.png" },
  { id: "ball", word: "ball", category: "toys", icon: "⚽", image: "assets/images/cards/ball.png" },
  { id: "kite", word: "kite", category: "toys", icon: "🪁", image: "assets/images/cards/kite.png" },
  { id: "puzzle", word: "puzzle", category: "toys", icon: "🧩", image: "assets/images/cards/puzzle.png" },
  { id: "yo-yo", word: "yo-yo", category: "toys", icon: "🪀", image: "assets/images/cards/yo-yo.png" },
  { id: "drum", word: "drum", category: "toys", icon: "🥁", image: "assets/images/cards/drum.png" },
  { id: "book", word: "book", category: "school-objects", icon: "📘", image: "assets/images/cards/book.png" },
  { id: "pencil", word: "pencil", category: "school-objects", icon: "✏️", image: "assets/images/cards/pencil.png" },
  { id: "crayon", word: "crayon", category: "school-objects", icon: "🖍️", image: "assets/images/cards/crayon.png" },
  { id: "ruler", word: "ruler", category: "school-objects", icon: "📏", image: "assets/images/cards/ruler.png" },
  { id: "backpack", word: "backpack", category: "school-objects", icon: "🎒", image: "assets/images/cards/backpack.png" },
  { id: "notebook", word: "notebook", category: "school-objects", icon: "📒", image: "assets/images/cards/notebook.png" },
  { id: "scissors", word: "scissors", category: "school-objects", icon: "✂️", image: "assets/images/cards/scissors.png" },
  { id: "spoon", word: "spoon", category: "kitchen-objects", icon: "🥄", image: "assets/images/cards/spoon.png" },
  { id: "cup", word: "cup", category: "kitchen-objects", icon: "🥤", image: "assets/images/cards/cup.png" },
  { id: "plate", word: "plate", category: "kitchen-objects", icon: "🍽️", image: "assets/images/cards/plate.png" },
  { id: "pan", word: "pan", category: "kitchen-objects", icon: "🍳", image: "assets/images/cards/pan.png" },
  { id: "kettle", word: "kettle", category: "kitchen-objects", icon: "🫖", image: "assets/images/cards/kettle.png" },
  { id: "bowl", word: "bowl", category: "kitchen-objects", icon: "🥣", image: "assets/images/cards/bowl.png" },
  { id: "bottle", word: "bottle", category: "kitchen-objects", icon: "🍼", image: "assets/images/cards/bottle.png" },
  { id: "dragon", word: "dragon", category: "fantasy", icon: "🐉", image: "assets/images/cards/dragon.png" },
  { id: "castle", word: "castle", category: "fantasy", icon: "🏰", image: "assets/images/cards/castle.png" },
  { id: "wand", word: "wand", category: "fantasy", icon: "🪄", image: "assets/images/cards/wand.png" },
  { id: "shield", word: "shield", category: "fantasy", icon: "🛡️", image: "assets/images/cards/shield.png" },
  { id: "gem", word: "gem", category: "fantasy", icon: "💎", image: "assets/images/cards/gem.png" },
  { id: "potion", word: "potion", category: "fantasy", icon: "🧪", image: "assets/images/cards/potion.png" },
  { id: "map", word: "map", category: "fantasy", icon: "🗺️", image: "assets/images/cards/map.png" },
];

export function hydrateCards(profile) {
  const unlockedSet = new Set(profile.unlockedCardIds);

  return CARD_LIBRARY.map((card) => {
    const points = profile.pointsByCardId[card.id];
    return {
      ...card,
      points,
      rarity: getRarityFromPoints(points),
      unlocked: unlockedSet.has(card.id),
      discoveredAt: profile.discoveredAtByCardId[card.id] ?? null,
    };
  });
}

export function getCardById(cards, cardId) {
  return cards.find((card) => card.id === cardId) ?? null;
}

import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Settings, Clock, ChefHat, Heart, ArrowLeft, Send, Loader, Play, Star, Users } from 'lucide-react';

const CookingApp = () => {
  const [currentPage, setCurrentPage] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    cuisines: [],
    dietaryRestrictions: [],
    spiceLevel: 'medium',
    cookingSkill: 'intermediate'
  });
  const [savedRecipes, setSavedRecipes] = useState([]);

  const cuisineOptions = [
    'Indian', 'Italian', 'Chinese', 'Mexican', 'Thai', 'Japanese', 'Mediterranean', 
    'French', 'American', 'Korean', 'Vietnamese', 'Spanish', 'Greek', 'Middle Eastern'
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb', 'Keto', 'Paleo'
  ];

  const quickIngredients = [
    'Chicken', 'Rice', 'Pasta', 'Eggs', 'Tomatoes', 'Onions', 
    'Potatoes', 'Garlic', 'Spinach', 'Lentils', 'Bread', 'Cheese'
  ];

  // Enhanced recipe database with multiple options and video links
  const getMultipleRecipeOptions = useCallback((userInput, userPreferences) => {
    const input = userInput.toLowerCase();
    
    const recipeDatabase = {
      chicken: [
        {
          name: "Quick Chicken Stir-Fry",
          time: "20 minutes",
          difficulty: "Easy",
          serves: "4",
          rating: "4.5",
          videoUrl: "https://www.youtube.com/watch?v=znIflQppW-I",
          ingredients: ["1 lb chicken breast", "2 tbsp soy sauce", "1 bell pepper", "1 onion", "2 cloves garlic"],
          instructions: [
            "Heat oil in a large pan over high heat",
            "Add chicken, cook until golden (5-6 minutes)", 
            "Add vegetables and aromatics",
            "Stir-fry for 3-4 minutes until crisp-tender",
            "Add soy sauce, toss to combine"
          ],
          tip: "Keep the heat high for the best stir-fry texture!"
        },
        {
          name: "Creamy Chicken & Mushroom",
          time: "25 minutes", 
          difficulty: "Medium",
          serves: "4",
          rating: "4.7",
          videoUrl: "https://www.youtube.com/watch?v=DuWCJTr_wWY",
          ingredients: ["1 lb chicken thighs", "8 oz mushrooms", "1 cup heavy cream", "2 tbsp butter", "Fresh thyme"],
          instructions: [
            "Season chicken with salt and pepper",
            "Sear chicken in butter until golden, remove",
            "Sauté mushrooms until browned",
            "Add cream and thyme, simmer 5 minutes",
            "Return chicken, cook until heated through"
          ],
          tip: "Use chicken thighs for extra juiciness!"
        },
        {
          name: "Honey Garlic Chicken",
          time: "18 minutes",
          difficulty: "Easy", 
          serves: "4",
          rating: "4.6",
          videoUrl: "https://www.youtube.com/watch?v=5g7zlMqNkWs",
          ingredients: ["1 lb chicken pieces", "3 tbsp honey", "4 cloves garlic", "2 tbsp soy sauce", "1 tbsp vinegar"],
          instructions: [
            "Mix honey, soy sauce, and vinegar for glaze",
            "Cook chicken in oil until golden",
            "Add garlic, cook for 1 minute",
            "Pour in glaze, cook until sticky",
            "Garnish with sesame seeds"
          ],
          tip: "Don't burn the garlic - add it after the chicken is nearly done!"
        }
      ],
      pasta: [
        {
          name: "Classic Aglio e Olio",
          time: "15 minutes",
          difficulty: "Easy",
          serves: "4",
          rating: "4.3",
          videoUrl: "https://www.youtube.com/watch?v=bJUiWdM__Qw",
          ingredients: ["8 oz spaghetti", "6 cloves garlic", "1/3 cup olive oil", "Red pepper flakes", "Parmesan cheese"],
          instructions: [
            "Cook pasta according to package directions",
            "Heat olive oil, add sliced garlic until golden",
            "Add red pepper flakes if using",
            "Toss with drained pasta and pasta water",
            "Add parmesan and fresh parsley"
          ],
          tip: "Save some pasta water to help bind the sauce!"
        },
        {
          name: "Creamy Mushroom Pasta",
          time: "20 minutes",
          difficulty: "Medium",
          serves: "4", 
          rating: "4.6",
          videoUrl: "https://www.youtube.com/watch?v=qnfT8vTz4Q0",
          ingredients: ["8 oz pasta", "12 oz mixed mushrooms", "3/4 cup heavy cream", "2 tbsp butter", "Fresh herbs"],
          instructions: [
            "Cook pasta until al dente",
            "Sauté mushrooms until golden and liquid evaporates",
            "Add garlic, cook 1 minute",
            "Pour in cream, simmer until thickened",
            "Toss with pasta, herbs, and parmesan"
          ],
          tip: "Don't crowd the mushrooms - cook in batches for best browning!"
        },
        {
          name: "Lemon Herb Pasta",
          time: "12 minutes",
          difficulty: "Easy",
          serves: "4",
          rating: "4.4", 
          videoUrl: "https://www.youtube.com/watch?v=zE-3I2x3uqE",
          ingredients: ["8 oz pasta", "2 lemons (zest & juice)", "1/4 cup olive oil", "Fresh basil", "Pine nuts"],
          instructions: [
            "Cook pasta, reserve 1 cup pasta water",
            "Whisk lemon juice, zest, and olive oil",
            "Toss hot pasta with lemon mixture",
            "Add pasta water as needed for silky texture",
            "Top with basil, pine nuts, and parmesan"
          ],
          tip: "Use fresh lemon zest for the brightest flavor!"
        }
      ],
      rice: [
        {
          name: "Vegetable Fried Rice",
          time: "15 minutes",
          difficulty: "Easy", 
          serves: "4",
          rating: "4.4",
          videoUrl: "https://www.youtube.com/watch?v=qH__o17xHls",
          ingredients: ["3 cups cooked rice", "2 eggs", "1 cup mixed vegetables", "3 tbsp soy sauce", "2 green onions"],
          instructions: [
            "Heat oil in a large pan or wok",
            "Scramble eggs, remove and set aside", 
            "Add vegetables, stir-fry for 2-3 minutes",
            "Add rice, breaking up clumps",
            "Add soy sauce and scrambled eggs back in"
          ],
          tip: "Use day-old rice for the best texture!"
        },
        {
          name: "Coconut Rice Pilaf",
          time: "25 minutes",
          difficulty: "Medium",
          serves: "6",
          rating: "4.5",
          videoUrl: "https://www.youtube.com/watch?v=VqOAD8t7Jws",
          ingredients: ["2 cups jasmine rice", "1 can coconut milk", "2 cups chicken broth", "1 onion", "Curry powder"],
          instructions: [
            "Sauté onion until translucent",
            "Add rice, toast for 2 minutes",
            "Add coconut milk, broth, and spices",
            "Bring to boil, then simmer covered 18 minutes",
            "Let stand 5 minutes, then fluff with fork"
          ],
          tip: "Toast the rice for extra nutty flavor!"
        },
        {
          name: "Spanish Rice (Arroz Rojo)",
          time: "30 minutes",
          difficulty: "Medium",
          serves: "6", 
          rating: "4.6",
          videoUrl: "https://www.youtube.com/watch?v=f2nss2m8reg",
          ingredients: ["2 cups long-grain rice", "3 tomatoes", "1/4 cup oil", "2 cups chicken broth", "Garlic & onion"],
          instructions: [
            "Blend tomatoes with garlic and onion",
            "Heat oil, fry rice until golden",
            "Add tomato mixture, cook 5 minutes",
            "Add hot broth, bring to boil",
            "Simmer covered 20 minutes until tender"
          ],
          tip: "Frying the rice first prevents it from getting mushy!"
        }
      ],
      egg: [
        {
          name: "Perfect Scrambled Eggs", 
          time: "8 minutes",
          difficulty: "Easy",
          serves: "2",
          rating: "4.2",
          videoUrl: "https://www.youtube.com/watch?v=PUP7U5vTMM0",
          ingredients: ["6 large eggs", "2 tbsp butter", "2 tbsp cream", "Chives", "Salt & pepper"],
          instructions: [
            "Whisk eggs with cream, salt, and pepper",
            "Melt butter in non-stick pan over low heat",
            "Add eggs, stir constantly with rubber spatula", 
            "Remove from heat while slightly underdone",
            "Garnish with chives"
          ],
          tip: "Low heat and constant stirring create the creamiest eggs!"
        },
        {
          name: "Veggie Frittata",
          time: "20 minutes", 
          difficulty: "Medium",
          serves: "6",
          rating: "4.5",
          videoUrl: "https://www.youtube.com/watch?v=rnlYe9m-1xI",
          ingredients: ["8 eggs", "1/2 cup milk", "1 bell pepper", "1 onion", "2 oz cheese", "Fresh herbs"],
          instructions: [
            "Whisk eggs with milk, salt, and pepper",
            "Sauté vegetables until tender",
            "Pour eggs over vegetables in oven-safe pan",
            "Add cheese and herbs on top", 
            "Bake at 375°F for 12-15 minutes until set"
          ],
          tip: "Use an oven-safe skillet to go from stovetop to oven!"
        },
        {
          name: "Fluffy Pancakes",
          time: "15 minutes",
          difficulty: "Easy",
          serves: "4",
          rating: "4.7",
          videoUrl: "https://www.youtube.com/watch?v=mAHLGF7pCOg", 
          ingredients: ["2 cups flour", "2 eggs", "1 3/4 cups milk", "2 tbsp sugar", "2 tsp baking powder"],
          instructions: [
            "Mix dry ingredients in large bowl",
            "Whisk eggs, milk, and melted butter separately",
            "Combine wet and dry ingredients until just mixed",
            "Cook on griddle until bubbles form on surface",
            "Flip once and cook until golden"
          ],
          tip: "Don't overmix - lumpy batter makes fluffier pancakes!"
        }
      ]
    };

    // Find matching ingredients
    const foundIngredients = Object.keys(recipeDatabase).filter(ingredient => 
      input.includes(ingredient)
    );

    if (foundIngredients.length > 0) {
      return recipeDatabase[foundIngredients[0]];
    }

    // Default quick recipes
    if (input.includes('quick') || input.includes('fast') || input.includes('easy')) {
      return [
        {
          name: "5-Minute Egg Toast",
          time: "5 minutes",
          difficulty: "Easy",
          serves: "1",
          rating: "4.0",
          videoUrl: "https://www.youtube.com/watch?v=rnlYe9m-1xI",
          ingredients: ["2 slices bread", "2 eggs", "Butter", "Salt & pepper"],
          instructions: ["Toast bread", "Fry eggs sunny side up", "Season and serve on toast"],
          tip: "Perfect for busy mornings!"
        },
        {
          name: "Quick Pasta Aglio",
          time: "10 minutes", 
          difficulty: "Easy",
          serves: "2",
          rating: "4.3",
          videoUrl: "https://www.youtube.com/watch?v=bJUiWdM__Qw",
          ingredients: ["Pasta", "Garlic", "Olive oil", "Red pepper flakes"],
          instructions: ["Boil pasta", "Sauté garlic in oil", "Toss together"],
          tip: "Italian simplicity at its best!"
        },
        {
          name: "Microwave Rice Bowl",
          time: "8 minutes",
          difficulty: "Easy", 
          serves: "1",
          rating: "3.9",
          videoUrl: "https://www.youtube.com/watch?v=qH__o17xHls",
          ingredients: ["Instant rice", "Frozen vegetables", "Soy sauce"],
          instructions: ["Microwave rice", "Steam vegetables", "Mix with sauce"],
          tip: "Great for dorm cooking!"
        }
      ];
    }

    return null;
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const recipeOptions = getMultipleRecipeOptions(currentInput, preferences);
      
      const assistantMessage = {
        role: 'assistant',
        content: recipeOptions || "I'd love to help you cook! Try telling me what ingredients you have, like 'I have chicken' or 'I have pasta and tomatoes'.",
        timestamp: Date.now(),
        isRecipeList: !!recipeOptions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting recipe suggestions:', error);
      const errorMessage = {
        role: 'assistant',
        content: "Sorry, I'm having trouble right now. Try asking about your ingredients again!",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  }, [inputText, isLoading, preferences, getMultipleRecipeOptions]);

  const handleInputChange = useCallback((e) => {
    setInputText(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const saveRecipe = useCallback((recipe) => {
    const savedRecipe = {
      id: Date.now(),
      name: recipe.name,
      content: recipe,
      timestamp: Date.now()
    };
    setSavedRecipes(prev => [...prev, savedRecipe]);
  }, []);

  const addQuickIngredient = useCallback((ingredient) => {
    setInputText(prev => {
      const newText = prev.length === 0 ? `I have ${ingredient.toLowerCase()}` : 
                      prev.includes(ingredient.toLowerCase()) ? prev : 
                      prev + `, ${ingredient.toLowerCase()}`;
      
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]');
        if (input) {
          input.focus();
          input.setSelectionRange(newText.length, newText.length);
        }
      }, 0);
      
      return newText;
    });
  }, []);

  const RecipeCard = ({ recipe, index }) => (
    <div className="bg-white rounded-lg shadow-md border border-orange-200 overflow-hidden mb-4">
      {/* Recipe Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold">{recipe.name}</h3>
          <div className="flex items-center space-x-1 text-orange-200">
            <Star size={14} fill="currentColor" />
            <span className="text-sm">{recipe.rating}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-orange-100">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{recipe.time}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={14} />
            <span>Serves {recipe.serves}</span>
          </div>
          <span className="px-2 py-1 bg-orange-400 rounded-full text-xs font-medium">
            {recipe.difficulty}
          </span>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-4">
        <div className="mb-3">
          <h4 className="font-semibold text-gray-800 mb-2">Ingredients:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {recipe.ingredients.map((ingredient, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-3">
          <h4 className="font-semibold text-gray-800 mb-2">Instructions:</h4>
          <ol className="text-sm text-gray-600 space-y-1">
            {recipe.instructions.map((step, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-orange-500 mr-2 font-medium">{idx + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {recipe.tip && (
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 mb-3">
            <p className="text-sm text-orange-700">
              <span className="font-semibold">💡 Tip:</span> {recipe.tip}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2 border-t border-gray-200">
          {recipe.videoUrl && (
            <a
              href={recipe.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors flex-1 justify-center"
            >
              <Play size={14} />
              <span>Watch Video</span>
            </a>
          )}
          <button
            onClick={() => saveRecipe(recipe)}
            className="flex items-center space-x-1 px-3 py-2 bg-orange-100 text-orange-700 text-sm rounded-md hover:bg-orange-200 transition-colors flex-1 justify-center border border-orange-300"
          >
            <Heart size={14} />
            <span>Save Recipe</span>
          </button>
        </div>
      </div>
    </div>
  );

  const ChatPage = () => {
    useEffect(() => {
      const focusInput = () => {
        const input = document.querySelector('input[type="text"]');
        if (input && !isLoading) {
          input.focus();
        }
      };
      
      focusInput();
      const timeoutId = setTimeout(focusInput, 100);
      return () => clearTimeout(timeoutId);
    }, [currentPage, isLoading]);

    return (
      <div className="flex flex-col h-screen bg-orange-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChefHat size={24} />
              <h1 className="text-xl font-bold">QuickCook</h1>
              <span className="text-xs bg-orange-400 px-2 py-1 rounded-full">Enhanced</span>
            </div>
            <button
              onClick={() => setCurrentPage('settings')}
              className="p-2 hover:bg-orange-600 rounded-full transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <ChefHat size={48} className="mx-auto text-orange-300 mb-4" />
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Welcome to QuickCook Enhanced! 🍳
              </h2>
              <p className="text-gray-600 mb-4">
                Tell me what ingredients you have, and I'll give you <strong>3 different recipes</strong> with cooking videos!
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
                <p className="text-sm text-gray-600 mb-2">Try saying:</p>
                <div className="space-y-1 text-sm text-orange-600 mb-4">
                  <p>• "I have chicken" - Get 3 different chicken recipes!</p>
                  <p>• "I have pasta and tomatoes"</p>
                  <p>• "Quick dinner ideas with eggs"</p>
                </div>
                <div className="border-t border-orange-100 pt-3">
                  <p className="text-xs text-gray-500 mb-2">Or tap to add common ingredients:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickIngredients.map(ingredient => (
                      <button
                        key={ingredient}
                        onClick={() => addQuickIngredient(ingredient)}
                        className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full hover:bg-orange-200 transition-colors border border-orange-200"
                      >
                        + {ingredient}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'user' ? (
                <div className="max-w-[85%] p-3 bg-orange-500 text-white rounded-lg rounded-br-none">
                  {message.content}
                </div>
              ) : message.isRecipeList && Array.isArray(message.content) ? (
                <div className="max-w-full w-full">
                  <div className="mb-4 text-center">
                    <h2 className="text-lg font-bold text-gray-800">Here are 3 recipe options for you!</h2>
                    <p className="text-sm text-gray-600">Each with cooking videos and detailed instructions</p>
                  </div>
                  {message.content.map((recipe, idx) => (
                    <RecipeCard key={idx} recipe={recipe} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="max-w-[85%] p-3 bg-white text-gray-800 rounded-lg rounded-bl-none shadow-sm border border-orange-100">
                  {message.content}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-sm border border-orange-100 flex items-center space-x-2">
                <Loader size={16} className="animate-spin text-orange-500" />
                <span className="text-gray-600">Cooking up 3 delicious options...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-orange-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Tell me what ingredients you have at home..."
              className="flex-1 p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SettingsPage = () => (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentPage('chat')}
            className="p-1 hover:bg-orange-600 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Preferences</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Cuisine Preferences */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Favorite Cuisines</h3>
          <div className="grid grid-cols-2 gap-2">
            {cuisineOptions.map(cuisine => (
              <button
                key={cuisine}
                onClick={() => {
                  setPreferences(prev => ({
                    ...prev,
                    cuisines: prev.cuisines.includes(cuisine)
                      ? prev.cuisines.filter(c => c !== cuisine)
                      : [...prev.cuisines, cuisine]
                  }));
                }}
                className={`p-2 text-sm rounded-md border transition-colors ${
                  preferences.cuisines.includes(cuisine)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Dietary Preferences</h3>
          <div className="grid grid-cols-2 gap-2">
            {dietaryOptions.map(diet => (
              <button
                key={diet}
                onClick={() => {
                  setPreferences(prev => ({
                    ...prev,
                    dietaryRestrictions: prev.dietaryRestrictions.includes(diet)
                      ? prev.dietaryRestrictions.filter(d => d !== diet)
                      : [...prev.dietaryRestrictions, diet]
                  }));
                }}
                className={`p-2 text-sm rounded-md border transition-colors ${
                  preferences.dietaryRestrictions.includes(diet)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                }`}
              >
                {diet}
              </button>
            ))}
          </div>
        </div>

        {/* Spice Level */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Spice Level</h3>
          <div className="flex space-x-2">
            {['mild', 'medium', 'spicy'].map(level => (
              <button
                key={level}
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  spiceLevel: level
                }))}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  preferences.spiceLevel === level
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Cooking Skill */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Cooking Skill Level</h3>
          <div className="flex space-x-2">
            {['beginner', 'intermediate', 'advanced'].map(skill => (
              <button
                key={skill}
                onClick={() => setPreferences(prev => ({
                  ...prev,
                  cookingSkill: skill
                }))}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  preferences.cookingSkill === skill
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                }`}
              >
                {skill.charAt(0).toUpperCase() + skill.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Saved Recipes */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Saved Recipes ({savedRecipes.length})</h3>
          {savedRecipes.length === 0 ? (
            <p className="text-gray-500 text-sm">No saved recipes yet. Save some recipes from the chat!</p>
          ) : (
            <div className="space-y-2">
              {savedRecipes.slice(-5).map(savedRecipe => (
                <div key={savedRecipe.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-md">
                  <span className="text-sm font-medium text-gray-700">{savedRecipe.name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(savedRecipe.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {savedRecipes.length > 5 && (
                <p className="text-xs text-gray-500 text-center">
                  Showing latest 5 of {savedRecipes.length} saved recipes
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {currentPage === 'chat' ? <ChatPage /> : <SettingsPage />}
    </div>
  );
};

export default CookingApp;
import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Settings, Clock, ChefHat, Heart, ArrowLeft, Send, Loader, Play, Star, Users, ExternalLink } from 'lucide-react';

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

  // Spoonacular API configuration
  const SPOONACULAR_API_KEY = 'YOUR_API_KEY_HERE'; // You'll need to get this from spoonacular.com
  const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

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

  // Extract ingredients from user input
  const extractIngredients = useCallback((input) => {
    const text = input.toLowerCase();
    const commonWords = ['i', 'have', 'got', 'with', 'using', 'want', 'need', 'make', 'cook', 'recipe', 'for', 'some', 'and', 'or', 'the', 'a', 'an'];
    
    // Remove common words and split by common delimiters
    const words = text
      .replace(/[^\w\s]/g, ' ')
      .split(/[\s,]+/)
      .filter(word => word.length > 2 && !commonWords.includes(word));
    
    return words.join(',');
  }, []);

  // Build diet parameter for API
  const buildDietParams = useCallback(() => {
    const dietMap = {
      'Vegetarian': 'vegetarian',
      'Vegan': 'vegan',
      'Gluten-Free': 'gluten free',
      'Dairy-Free': 'dairy free',
      'Keto': 'ketogenic',
      'Paleo': 'paleo'
    };

    return preferences.dietaryRestrictions
      .map(diet => dietMap[diet])
      .filter(Boolean)
      .join(',');
  }, [preferences.dietaryRestrictions]);

  // Fetch recipes from Spoonacular API
  const fetchRecipesFromAPI = useCallback(async (ingredients) => {
    try {
      const diet = buildDietParams();
      const cuisine = preferences.cuisines.length > 0 ? preferences.cuisines[0].toLowerCase() : '';
      
      // Build API URL
      const params = new URLSearchParams({
        apiKey: SPOONACULAR_API_KEY,
        ingredients: ingredients,
        number: 3,
        ranking: 2, // Maximize used ingredients
        ignorePantry: true,
        ...(diet && { diet }),
        ...(cuisine && { cuisine })
      });

      const response = await fetch(`${SPOONACULAR_BASE_URL}/findByIngredients?${params}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const recipes = await response.json();
      
      // Get detailed information for each recipe
      const detailedRecipes = await Promise.all(
        recipes.slice(0, 3).map(async (recipe) => {
          try {
            const detailResponse = await fetch(
              `${SPOONACULAR_BASE_URL}/${recipe.id}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=false`
            );
            
            if (!detailResponse.ok) {
              throw new Error(`Detail API Error: ${detailResponse.status}`);
            }
            
            const detail = await detailResponse.json();
            
            // Get analyzed instructions
            const instructionsResponse = await fetch(
              `${SPOONACULAR_BASE_URL}/${recipe.id}/analyzedInstructions?apiKey=${SPOONACULAR_API_KEY}`
            );
            
            let instructions = [];
            if (instructionsResponse.ok) {
              const instructionsData = await instructionsResponse.json();
              if (instructionsData.length > 0) {
                instructions = instructionsData[0].steps.map(step => step.step);
              }
            }

            return {
              id: recipe.id,
              name: detail.title,
              time: `${detail.readyInMinutes || 30} minutes`,
              difficulty: detail.veryPopular ? "Popular" : "Medium",
              serves: detail.servings || 4,
              rating: ((detail.spoonacularScore || 50) / 20).toFixed(1),
              image: detail.image,
              sourceUrl: detail.sourceUrl,
              ingredients: detail.extendedIngredients?.map(ing => 
                `${ing.amount} ${ing.unit} ${ing.name}`
              ) || recipe.usedIngredients?.map(ing => ing.original) || [],
              instructions: instructions.length > 0 ? instructions : [
                "Visit the source link for detailed cooking instructions",
                "Prepare all ingredients as listed",
                "Follow the original recipe steps carefully"
              ],
              tip: detail.summary ? 
                detail.summary.replace(/<[^>]*>/g, '').substring(0, 100) + "..." : 
                "Check the source link for cooking tips and variations!",
              nutrition: {
                calories: detail.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || null,
                protein: detail.nutrition?.nutrients?.find(n => n.name === "Protein")?.amount || null
              },
              usedIngredients: recipe.usedIngredients?.length || 0,
              missedIngredients: recipe.missedIngredients?.length || 0
            };
          } catch (error) {
            console.error(`Error fetching recipe ${recipe.id}:`, error);
            return null;
          }
        })
      );

      return detailedRecipes.filter(recipe => recipe !== null);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  }, [SPOONACULAR_API_KEY, buildDietParams, preferences.cuisines]);

  // Fallback recipes when API fails
  const getFallbackRecipes = useCallback((input) => {
    const fallbackRecipes = [
      {
        name: "Simple Pasta Aglio e Olio",
        time: "15 minutes",
        difficulty: "Easy",
        serves: "4",
        rating: "4.3",
        ingredients: ["8 oz spaghetti", "6 cloves garlic", "1/3 cup olive oil", "Red pepper flakes", "Parmesan cheese"],
        instructions: [
          "Cook pasta according to package directions",
          "Heat olive oil, add sliced garlic until golden",
          "Add red pepper flakes if using",
          "Toss with drained pasta and pasta water",
          "Add parmesan and fresh parsley"
        ],
        tip: "Save some pasta water to help bind the sauce!",
        sourceUrl: "https://www.example.com/recipe"
      },
      {
        name: "Quick Scrambled Eggs",
        time: "8 minutes",
        difficulty: "Easy",
        serves: "2",
        rating: "4.2",
        ingredients: ["6 large eggs", "2 tbsp butter", "2 tbsp cream", "Chives", "Salt & pepper"],
        instructions: [
          "Whisk eggs with cream, salt, and pepper",
          "Melt butter in non-stick pan over low heat",
          "Add eggs, stir constantly with rubber spatula",
          "Remove from heat while slightly underdone",
          "Garnish with chives"
        ],
        tip: "Low heat and constant stirring create the creamiest eggs!",
        sourceUrl: "https://www.example.com/recipe"
      },
      {
        name: "Basic Fried Rice",
        time: "15 minutes",
        difficulty: "Easy",
        serves: "4",
        rating: "4.4",
        ingredients: ["3 cups cooked rice", "2 eggs", "1 cup mixed vegetables", "3 tbsp soy sauce", "2 green onions"],
        instructions: [
          "Heat oil in a large pan or wok",
          "Scramble eggs, remove and set aside",
          "Add vegetables, stir-fry for 2-3 minutes",
          "Add rice, breaking up clumps",
          "Add soy sauce and scrambled eggs back in"
        ],
        tip: "Use day-old rice for the best texture!",
        sourceUrl: "https://www.example.com/recipe"
      }
    ];

    return fallbackRecipes;
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // Extract ingredients from user input
      const ingredients = extractIngredients(currentInput);
      
      if (!ingredients) {
        const errorMessage = {
          role: 'assistant',
          content: "I couldn't identify any ingredients in your message. Try saying something like 'I have chicken and rice' or 'pasta and tomatoes'.",
          timestamp: Date.now(),
          isRecipeList: false
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      let recipes;
      
      // Check if API key is configured
      if (SPOONACULAR_API_KEY === 'YOUR_API_KEY_HERE') {
        // Use fallback recipes if no API key
        console.log('Using fallback recipes - API key not configured');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        recipes = getFallbackRecipes(currentInput);
      } else {
        // Try to fetch from API
        try {
          recipes = await fetchRecipesFromAPI(ingredients);
          
          if (!recipes || recipes.length === 0) {
            throw new Error('No recipes found');
          }
        } catch (apiError) {
          console.error('API call failed, using fallback:', apiError);
          recipes = getFallbackRecipes(currentInput);
        }
      }

      const assistantMessage = {
        role: 'assistant',
        content: recipes,
        timestamp: Date.now(),
        isRecipeList: true,
        searchedIngredients: ingredients
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = {
        role: 'assistant',
        content: "Sorry, I'm having trouble finding recipes right now. Please try again with different ingredients!",
        timestamp: Date.now(),
        isRecipeList: false
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  }, [inputText, isLoading, extractIngredients, fetchRecipesFromAPI, getFallbackRecipes, SPOONACULAR_API_KEY]);

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
      id: recipe.id || Date.now(),
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
      {/* Recipe Image */}
      {recipe.image && (
        <div className="h-48 overflow-hidden">
          <img 
            src={recipe.image} 
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

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
        
        {/* Ingredient Match Info */}
        {(recipe.usedIngredients || recipe.missedIngredients) && (
          <div className="mt-2 text-xs text-orange-100">
            {recipe.usedIngredients > 0 && (
              <span className="mr-3">✓ Uses {recipe.usedIngredients} of your ingredients</span>
            )}
            {recipe.missedIngredients > 0 && (
              <span>+ {recipe.missedIngredients} additional ingredients needed</span>
            )}
          </div>
        )}
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

        {/* Nutrition Info */}
        {recipe.nutrition && (recipe.nutrition.calories || recipe.nutrition.protein) && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-3">
            <p className="text-sm text-green-700">
              <span className="font-semibold">🥗 Nutrition:</span>
              {recipe.nutrition.calories && ` ${Math.round(recipe.nutrition.calories)} calories`}
              {recipe.nutrition.protein && ` • ${Math.round(recipe.nutrition.protein)}g protein`}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2 border-t border-gray-200">
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors flex-1 justify-center"
            >
              <ExternalLink size={14} />
              <span>Full Recipe</span>
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
              <h1 className="text-xl font-bold">QuickCook AI</h1>
              <span className="text-xs bg-orange-400 px-2 py-1 rounded-full">
                {SPOONACULAR_API_KEY === 'YOUR_API_KEY_HERE' ? 'Demo' : 'Live'}
              </span>
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
                Welcome to QuickCook AI! 🍳
              </h2>
              <p className="text-gray-600 mb-4">
                Tell me what ingredients you have, and I'll find <strong>real recipes</strong> from global recipe databases!
              </p>
              
              {SPOONACULAR_API_KEY === 'YOUR_API_KEY_HERE' && (
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Demo Mode:</strong> Using sample recipes. Get a free API key from 
                    <a href="https://spoonacular.com/food-api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"> spoonacular.com </a>
                    for real recipe searches!
                  </p>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
                <p className="text-sm text-gray-600 mb-2">Try saying:</p>
                <div className="space-y-1 text-sm text-orange-600 mb-4">
                  <p>• "I have chicken and rice"</p>
                  <p>• "pasta, tomatoes, and garlic"</p>
                  <p>• "eggs, cheese, and spinach"</p>
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
                    <h2 className="text-lg font-bold text-gray-800">Found {message.content.length} recipes for you!</h2>
                    {message.searchedIngredients && (
                      <p className="text-sm text-gray-600">
                        Searched for: <span className="font-medium">{message.searchedIngredients.split(',').join(', ')}</span>
                      </p>
                    )}
                  </div>
                  {message.content.map((recipe, idx) => (
                    <RecipeCard key={recipe.id || idx} recipe={recipe} index={idx} />
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
                <span className="text-gray-600">
                  {SPOONACULAR_API_KEY === 'YOUR_API_KEY_HERE' 
                    ? 'Finding demo recipes...' 
                    : 'Searching global recipe database...'
                  }
                </span>
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
              placeholder="What ingredients do you have? (e.g., chicken, rice, onions)"
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
        {/* API Status */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">API Status</h3>
          <div className={`p-3 rounded-lg border ${
            SPOONACULAR_API_KEY === 'YOUR_API_KEY_HERE' 
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            <p className="text-sm">
              {SPOONACULAR_API_KEY === 'YOUR_API_KEY_HERE' 
                ? '⚠️ Demo Mode: Using sample recipes. Add your Spoonacular API key for real recipes.'
                : '✅ Live Mode: Connected to Spoonacular recipe database.'
              }
            </p>
            {SPOONACULAR_API_KEY === 'YOUR_API_KEY_HERE' && (
              <p className="text-xs mt-1">
                Get a free API key at <a href="https://spoonacular.com/food-api" target="_blank" rel="noopener noreferrer" className="underline">spoonacular.com</a>
              </p>
            )}
          </div>
        </div>

        {/* Cuisine Preferences */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Favorite Cuisines</h3>
          <p className="text-sm text-gray-600 mb-3">Select cuisines to prioritize in search results</p>
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
          <p className="text-sm text-gray-600 mb-3">Filter recipes based on your dietary needs</p>
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
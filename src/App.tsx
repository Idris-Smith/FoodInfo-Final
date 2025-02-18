import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Camera, 
  Search, 
  Loader2, 
  Leaf, 
  Fish, 
  Wheat,
  Scan,
  Info,
  AlertTriangle,
  CheckCircle2,
  Factory,
  Utensils,
  Scale,
  Heart,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface FoodProduct {
  product_name: string;
  ingredients_text: string;
  ingredients_analysis_tags?: string[];
  labels_tags?: string[];
  nova_group?: number;
  image_url?: string;
  nutriments?: {
    energy_100g?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sodium_100g?: number;
    sugars_100g?: number;
  };
}

interface DietaryInfo {
  vegan: boolean;
  vegetarian: boolean;
  halal: boolean;
  reason?: string;
}

function App() {
  const [scanResult, setScanResult] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<FoodProduct | null>(null);
  const [error, setError] = useState('');

  const nonHalalIngredients = [
    'alcohol', 'wine', 'beer', 'pork', 'bacon', 'ham', 'gelatin', 'lard',
    'pepsin', 'carmine', 'cochineal', 'shellac', 'vanilla extract'
  ];

  const nonVeganIngredients = [
    'milk', 'egg', 'honey', 'gelatin', 'whey', 'casein', 'lactose', 'meat',
    'fish', 'shellfish', 'royal jelly', 'carmine', 'isinglass', 'lanolin'
  ];

  const nonVegetarianIngredients = [
    'meat', 'fish', 'shellfish', 'gelatin', 'rennet', 'carmine', 'lard'
  ];

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        'reader',
        {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 5,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          if (/^\d+$/.test(decodedText)) {
            setScanResult(decodedText);
            fetchProduct(decodedText);
            scanner.clear();
            setIsScanning(false);
          }
        },
        (error) => {
          console.warn(error);
        }
      );

      return () => {
        scanner.clear();
      };
    }
  }, [isScanning]);

  const fetchProduct = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      if (response.data.status === 1) {
        setProduct(response.data.product);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Error fetching product information');
    }
    setLoading(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) {
      fetchProduct(manualCode);
    }
  };

  const checkIngredients = (ingredients: string, restrictedIngredients: string[]): { found: boolean; ingredients: string[] } => {
    const foundIngredients = restrictedIngredients.filter(ingredient =>
      ingredients.toLowerCase().includes(ingredient.toLowerCase())
    );
    return {
      found: foundIngredients.length > 0,
      ingredients: foundIngredients
    };
  };

  const getDietaryInfo = (product: FoodProduct): DietaryInfo => {
    const ingredients = product.ingredients_text?.toLowerCase() || '';
    
    const halalCheck = checkIngredients(ingredients, nonHalalIngredients);
    const veganCheck = checkIngredients(ingredients, nonVeganIngredients);
    const vegetarianCheck = checkIngredients(ingredients, nonVegetarianIngredients);

    return {
      halal: !halalCheck.found,
      vegan: !veganCheck.found,
      vegetarian: !vegetarianCheck.found,
      reason: halalCheck.found ? `Contains: ${halalCheck.ingredients.join(', ')}` :
             veganCheck.found ? `Contains: ${veganCheck.ingredients.join(', ')}` :
             vegetarianCheck.found ? `Contains: ${vegetarianCheck.ingredients.join(', ')}` : undefined
    };
  };

  const getNovaGroup = (group?: number) => {
    switch (group) {
      case 1: return 'Unprocessed or minimally processed';
      case 2: return 'Processed culinary ingredients';
      case 3: return 'Processed foods';
      case 4: return 'Ultra-processed foods';
      default: return 'Unknown processing level';
    }
  };

  const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-[#FFB347] rounded-full">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-[#FF4500]">{title}</h3>
      </div>
      <p className="text-[#FF6F3C] text-sm">{description}</p>
    </div>
  );

  const showWelcomeSection = !isScanning && !loading && !product && !error;

  return (
    <div className="min-h-screen bg-[#FFDAB9]">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-[#FF4500] text-center mb-12"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          foodinfo.co.za
        </motion.h1>

        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <form onSubmit={handleManualSubmit} className="flex flex-col md:flex-row gap-3 mb-8">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter barcode number"
              className="flex-1 px-4 py-3 rounded-lg border border-[#FFB347] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
            />
            <button
              type="submit"
              className="bg-[#FF8C42] text-white px-6 py-3 rounded-lg hover:bg-[#FF6F3C] transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setIsScanning(true)}
              className="bg-[#FF4500] text-white px-6 py-3 rounded-lg hover:bg-[#FF6F3C] transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Scan
            </button>
          </form>

          {isScanning ? (
            <div className="w-full max-w-md mx-auto">
              <div id="reader" className="mb-4"></div>
              <button
                onClick={() => setIsScanning(false)}
                className="w-full bg-[#FF4500] text-white px-6 py-3 rounded-lg hover:bg-[#FF6F3C] transition-colors"
              >
                Stop Scanning
              </button>
            </div>
          ) : showWelcomeSection && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#FFDAB9]/30 rounded-xl p-6"
            >
              <h2 className="text-xl font-semibold text-[#FF4500] text-center mb-4">
                Welcome to foodinfo.co.za
              </h2>
              <p className="text-[#FF6F3C] text-center mb-8">
                Your comprehensive food information companion! Simply scan a product's barcode or enter it manually to discover:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <FeatureCard
                  icon={Info}
                  title="Detailed Information"
                  description="Complete ingredients list and nutritional facts"
                />
                <FeatureCard
                  icon={Heart}
                  title="Dietary Status"
                  description="Vegan, vegetarian, and halal verification"
                />
                <FeatureCard
                  icon={Gauge}
                  title="Processing Level"
                  description="Food processing and additives analysis"
                />
                <FeatureCard
                  icon={Scale}
                  title="Nutritional Facts"
                  description="Detailed breakdown of nutrients per 100g"
                />
                <FeatureCard
                  icon={Fish}
                  title="Halal Check"
                  description="Thorough halal status verification"
                />
                <FeatureCard
                  icon={Leaf}
                  title="Dietary Preferences"
                  description="Vegan and vegetarian compatibility check"
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        {loading && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF4500]" />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {product && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#FF4500] mb-6">{product.product_name}</h2>
              
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="w-full max-w-md mx-auto rounded-lg mb-6"
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(getDietaryInfo(product)).map(([key, value]) => {
                  if (key === 'reason') return null;
                  return (
                    <div
                      key={key}
                      className="bg-[#FFDAB9] p-4 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        {key === 'vegan' && <Leaf className="w-5 h-5 text-[#FF4500]" />}
                        {key === 'vegetarian' && <Wheat className="w-5 h-5 text-[#FF4500]" />}
                        {key === 'halal' && <Fish className="w-5 h-5 text-[#FF4500]" />}
                        <span className="capitalize font-semibold text-[#FF4500]">{key}</span>
                        {value ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-500 ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-[#FF6F3C] mt-2">
                        {value ? `Suitable for ${key} diet` : `Not ${key} - ${getDietaryInfo(product).reason}`}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#FFDAB9] p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-[#FF4500] mb-4">
                    <Scale className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">Nutritional Facts</h3>
                  </div>
                  <table className="w-full">
                    <tbody className="divide-y divide-[#FFB347]">
                      {product.nutriments && Object.entries(product.nutriments).map(([key, value]) => (
                        <tr key={key} className="text-[#FF6F3C]">
                          <td className="py-2 capitalize">{key.replace(/_100g$/, '')}</td>
                          <td className="py-2 text-right">{value || 0}{key.includes('energy') ? ' kcal' : 'g'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#FFDAB9] p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-[#FF4500] mb-2">
                      <Factory className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">Processing Level</h3>
                    </div>
                    <p className="text-[#FF6F3C]">{getNovaGroup(product.nova_group)}</p>
                  </div>

                  <div className="bg-[#FFDAB9] p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-[#FF4500] mb-2">
                      <Utensils className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">Ingredients</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[#FF6F3C]">
                      {product.ingredients_text?.split(',').map((ingredient, index) => (
                        <li key={index}>
                          {ingredient.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

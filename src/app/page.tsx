// pages/index.js
'use client';
import { useState } from 'react';
import Head from 'next/head';
import OpenAI from "openai";

// Move interfaces outside the function
interface FormData {
  brand: string;
  category: string;
  originalPrice: string;
  clothingUse: 'Not Worn' | 'Light Wear' | 'Medium Wear' | 'Heavy Wear';
  yearsOld: 'Less than 1 year' | '1-2 years' | '2-4 years' | '4+ years';
}

interface Result {
  estimatedPrice: string;
  data: FormData;
}

export default function Home() {
  const api_key = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  // Initialize OpenAI client with API key from environment variables
  const client = new OpenAI({
    apiKey: api_key, // Access API key from .env file
    dangerouslyAllowBrowser: true // Needed for client-side usage
  });

  // Form state
  const [formData, setFormData] = useState<FormData>({
    brand: '',
    category: '',
    originalPrice: '',
    clothingUse: 'Not Worn',
    yearsOld: 'Less than 1 year'
  });
  
  // Result state
  const [result, setResult] = useState<Result | null>(null);
  
  // Form errors
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand name is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.originalPrice.trim()) {
      newErrors.originalPrice = 'Original price is required';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.originalPrice)) {
      newErrors.originalPrice = 'Please enter a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    // Show loading state
    setIsLoading(true);
  
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini-2024-07-18",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: `Estimate the resale value of a ${formData.category} from ${formData.brand} that is ${formData.clothingUse} and ${formData.yearsOld} old. The original price was $${formData.originalPrice}. Output only the number amount you think it would cost.`
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
        n: 1,
      });
      
      // Extract just the number from the response
      const rawContent = response.choices[0].message.content || '';
      
      // Clean the response to extract just the numeric value
      // This removes any currency symbols and keeps just the number
      const numericPrice = rawContent.replace(/[^0-9.]/g, '');
      
      // Set result
      setResult({
        estimatedPrice: numericPrice || '0',  // Ensure a fallback to '0'
        data: {...formData}
      });
    } catch (error) {
      console.error("Error calling GPT API:", error);
      // Handle error - perhaps set an error state
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      brand: '',
      category: '',
      originalPrice: '',
      clothingUse: 'Not Worn',
      yearsOld: 'Less than 1 year'
    });
    setResult(null);
    setErrors({});
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50">
      <Head>
        <title>Cache Resell Estimator</title>
        <meta name="description" content="Estimate the resell value of your clothing items" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="w-full py-4 px-6 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-black tracking-tight">CACHE RESELL ESTIMATOR</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://www.cacheinyourcloset.com/" target="_blank" rel="noopener noreferrer">
              <button className="bg-green-500 hover:bg-green-600 transition-colors text-white rounded-full px-6 py-2 font-medium">
                Cache's Website
              </button>
            </a>
          </div>
        </div>
      </header>
      
      <main className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Your resell price<br />
            in your hands in seconds
          </h1>
          <p className="text-gray-600">Get an instant estimate of your clothing's resale value</p>
        </div>
        
        {result ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-green-500">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Estimated Resell Price: ${result.estimatedPrice}</h2>
            
            <div className="space-y-3 mt-4">
              <h3 className="font-semibold text-gray-700">Item Details:</h3>
              <p><span className="font-medium">Brand:</span> {result.data.brand}</p>
              <p><span className="font-medium">Category:</span> {result.data.category}</p>
              <p><span className="font-medium">Original Price:</span> ${result.data.originalPrice}</p>
              <p><span className="font-medium">Condition:</span> {result.data.clothingUse}</p>
              <p><span className="font-medium">Age:</span> {result.data.yearsOld}</p>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 transition-colors rounded-md font-medium text-gray-800"
              >
                Price Another Item
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span>1</span>
                  </div>
                  <label htmlFor="brand" className="text-lg font-medium">Brand Name</label>
                </div>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  className={`w-full border ${errors.brand ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="e.g. Nike, Artizia, Lululemon, Ralph Lauren, etc."
                  value={formData.brand}
                  onChange={handleChange}
                />
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span>2</span>
                  </div>
                  <label htmlFor="category" className="text-lg font-medium">
                    Category <span className="text-gray-500 text-sm font-normal">(specific type of clothing)</span>
                  </label>
                </div>
                <input
                  id="category"
                  name="category"
                  type="text"
                  className={`w-full border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="e.g. Pants, Shoes, Sweaters, Hoodies, etc."
                  value={formData.category}
                  onChange={handleChange}
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span>3</span>
                  </div>
                  <label htmlFor="originalPrice" className="text-lg font-medium">
                    Original Price <span className="text-gray-500 text-sm font-normal">(numbers only please)</span>
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    id="originalPrice"
                    name="originalPrice"
                    type="text"
                    className={`w-full border ${errors.originalPrice ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 pl-7 focus:outline-none focus:ring-2 focus:ring-green-500`}
                    placeholder="e.g. 10, 25, 200, etc."
                    value={formData.originalPrice}
                    onChange={handleChange}
                  />
                </div>
                {errors.originalPrice && <p className="text-red-500 text-sm mt-1">{errors.originalPrice}</p>}
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span>4</span>
                  </div>
                  <label htmlFor="clothingUse" className="text-lg font-medium">Clothing Condition</label>
                </div>
                <div className="relative">
                  <select
                    id="clothingUse"
                    name="clothingUse"
                    className="w-full border border-gray-300 rounded-lg p-3 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.clothingUse}
                    onChange={handleChange}
                  >
                    <option value="Not Worn">Not Worn (New with tags)</option>
                    <option value="Light Wear">Light Wear (Excellent condition)</option>
                    <option value="Medium Wear">Medium Wear (Good condition)</option>
                    <option value="Heavy Wear">Heavy Wear (Fair condition)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <span>5</span>
                  </div>
                  <label htmlFor="yearsOld" className="text-lg font-medium">Item Age</label>
                </div>
                <div className="relative">
                  <select
                    id="yearsOld"
                    name="yearsOld"
                    className="w-full border border-gray-300 rounded-lg p-3 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.yearsOld}
                    onChange={handleChange}
                  >
                    <option value="Less than 1 year">Less than 1 year</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="2-4 years">2-4 years</option>
                    <option value="4+ years">4+ years</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 transition-colors text-white rounded-lg py-3 font-medium flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating...
                  </>
                ) : (
                  <>
                    Generate your price
                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
      
      <footer className="w-full py-6 px-4 mt-auto bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} Cache. All rights reserved. This is a demo for the technical assignment.</p>
        </div>
      </footer>
    </div>
  );
}
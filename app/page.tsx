'use client';
import { useState } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('submissions')
        .insert([
          {
            user_id: user.id,
            content: inputValue
          }
        ]);

      if (error) throw error;
      
      // Clear input on successful submission
      setInputValue("");
      alert("Successfully submitted!");
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">
          clerk is cool
        </h1>
        
        <SignedIn>
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter something..."
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </SignedIn>

        <SignedOut>
          <div className="text-center p-4 bg-gray-100 rounded-md">
            Please sign in to access the form
          </div>
        </SignedOut>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        footer 
      </footer>
    </div>
  );
}

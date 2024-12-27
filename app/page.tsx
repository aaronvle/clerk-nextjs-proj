'use client';
import { useState, useEffect } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase";

type Submission = {
  id: string;
  content: string;
  created_at: string;
};

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
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
      
      // Clear input and refresh submissions if they're being shown
      setInputValue("");
      if (showSubmissions) {
        fetchSubmissions();
      }
      alert("Successfully submitted!");
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('id, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      alert("Failed to fetch submissions. Please try again.");
    }
  };

  const handleEdit = async (id: string) => {
    try {
      console.log('Attempting to edit submission:', id, editValue);
      const { error, data } = await supabase
        .from('submissions')
        .update({ content: editValue })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select();

      console.log('Edit response:', { error, data });

      if (error) throw error;
      
      setEditingId(null);
      fetchSubmissions();
      alert('Successfully updated submission!');
    } catch (error) {
      console.error("Error updating submission:", error);
      alert("Failed to update submission. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;

    try {
      console.log('Attempting to delete submission:', id);
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      console.log('Successfully deleted submission:', id);
      fetchSubmissions();
      alert('Successfully deleted submission!');
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Failed to delete submission. Please try again.");
    }
  };

  // Fetch submissions when showSubmissions becomes true
  useEffect(() => {
    if (showSubmissions) {
      fetchSubmissions();
    }
  }, [showSubmissions]);

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
                placeholder="Enter something:"
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
              <button 
                type="button"
                onClick={() => setShowSubmissions(!showSubmissions)}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                {showSubmissions ? "Hide Submissions" : "View Submissions"}
              </button>
            </div>
          </form>

          {showSubmissions && submissions.length > 0 && (
            <div className="w-full max-w-md mt-8 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission, index) => (
                    <tr key={submission.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingId === submission.id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                            autoFocus
                          />
                        ) : (
                          submission.content
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                        {editingId === submission.id ? (
                          <>
                            <button
                              onClick={() => handleEdit(submission.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(submission.id);
                                setEditValue(submission.content);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(submission.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showSubmissions && submissions.length === 0 && (
            <p className="mt-4 text-gray-500">No submissions yet.</p>
          )}
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

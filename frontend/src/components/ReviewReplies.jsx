import React, { useState, useEffect } from "react";
import API from "../Api";
import { formatDistanceToNow } from "date-fns";

const ReviewReplies = ({ reviewId }) => {
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const fetchReplies = async () => {
    try {
      const res = await API.get(`/reviews/replies/${reviewId}`);
      setReplies(res.data);
    } catch (err) {
      console.error("Failed to fetch replies", err);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, [reviewId]);

  const handleSubmitReply = async () => {
    if (!newReply.trim()) return;

    try {
      setLoading(true);
      await API.post("/reviews/replies", {
        reviewId,
        commentText: newReply,
      });
      setNewReply("");
      setShowReplyForm(false);
      fetchReplies();
    } catch (err) {
      console.error("Failed to submit reply", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {/* Replies Section */}
      {replies.length > 0 && (
        <div className="space-y-3 mb-4">
          <h5 className="text-sm font-semibold text-gray-700 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Replies ({replies.length})
          </h5>
          
          <div className="ml-6 space-y-3">
            {replies.map((reply) => (
              <div
                key={reply.REPLYID}
                className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border-l-4 border-blue-200 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(reply.NAME || `User ${reply.USERID}`)?.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">
                      {reply.NAME || `User ${reply.USERID}`}
                    </span>
                    {reply.USERID === 'seller' && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                        Seller
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {reply.CREATEDAT
                      ? formatDistanceToNow(new Date(reply.CREATEDAT), {
                          addSuffix: true,
                        })
                      : ""}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed pl-8">
                  {reply.COMMENTTEXT}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply Button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Reply
        </button>
        
        {replies.length > 0 && (
          <span className="text-xs text-gray-400">
            • {replies.length} repl{replies.length === 1 ? 'y' : 'ies'}
          </span>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 animate-fadeIn">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Your Reply
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
              rows={3}
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Write a thoughtful reply..."
            />
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSubmitReply}
                disabled={loading || !newReply.trim()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  </>
                ) : (
                  "Post Reply"
                )}
              </button>
              <button
                onClick={() => {
                  setShowReplyForm(false);
                  setNewReply("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReviewReplies;
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../Api";
import { CategoryContext } from "../context/CategoryContext";
import { useContext } from "react";
import ReviewReplies from "../components/ReviewReplies";
import { formatDistanceToNow } from "date-fns";
import Navbar from "../components/Navbar";

const ProductPage = () => {
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState({});
  const [reviews, setReviews] = useState([]);
  const [path, setPath] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { id } = useParams();
  const { categoryMap } = useContext(CategoryContext);

  

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to fetch product", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await API.get(`/reviews/${id}`);
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    let result = [];
    let current = categoryMap[product.CATEGORYID];
    while (current) {
      result.unshift(current.name);
      current = categoryMap[current.parentid];
    }
    setPath(result.join(" → "));
  }, [product]);

  const handleSubmitReview = async () => {
    if (!newComment.trim()) {
      alert("Please write a comment.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await API.post("/reviews", {
        productId: Number(id),
        ratingValue: newRating,
        commentText: newComment,
        imageId: null,
      });

      alert("✅ Review submitted!");
      setNewComment("");
      setNewRating(5);
      setShowReviewForm(false);

      const refreshed = await API.get(`/reviews/${id}`);
      setReviews(refreshed.data);

      const refreshedProduct = await API.get(`/products/${id}`);
      setProduct(refreshedProduct.data);
    } catch (err) {
      console.error("Failed to submit review", err);
      alert("❌ Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const res = await API.post("/customer/addcart", {
        productId,
        quantity,
      });

      if (res.status === 200) {
        // Success animation
        const button = document.querySelector('.add-to-cart-btn');
        button.classList.add('animate-pulse');
        setTimeout(() => button.classList.remove('animate-pulse'), 600);
        alert("✅ Added to cart!");
      } else {
        alert("❌ Failed to add to cart.");
      }
    } catch (err) {
      console.error("Error adding to cart", err);
      alert("❌ Error adding to cart.");
    }
  };

  const renderStars = (rating, size = "text-lg") => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`${size} ${
          i < Math.floor(rating)
            ? "text-yellow-400"
            : i < rating
            ? "text-yellow-300"
            : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  const productImages = [
    product.IMAGEURL || "/images/photo.png",
    "/images/photo.png", 
    "/images/photo.png",
  ];

  return (
    <><Navbar userType="customer">  </Navbar>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Image Gallery Section */}
          <div className="xl:col-span-5">
            <div className="sticky top-8">
              {/* Main Image */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4 group">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                  <img
                    src={productImages[activeImageIndex]}
                    alt={product.NAME}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/photo.png";
                    }}
                  />
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex space-x-3">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      activeImageIndex === index
                        ? "border-indigo-500 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.NAME} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="xl:col-span-4 space-y-6">
            {/* Product Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full mb-3">
                  {path || "Uncategorized"}
                </span>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.NAME}
                </h1>
              </div>

              {/* Rating Section */}
              {product.AVERAGERATING && (
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex items-center">
                    {renderStars(product.AVERAGERATING)}
                    <span className="ml-2 text-xl font-bold text-gray-800">
                      {product.AVERAGERATING.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <span className="text-gray-600">
                    {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Description */}
              <div className="prose prose-gray max-w-none">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.DESCRIPTION || "No description available."}
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
                >
                  Write Review
                </button>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Share Your Experience</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewRating(star)}
                            className={`text-2xl transition-colors duration-200 ${
                              star <= newRating ? "text-yellow-400" : "text-gray-300"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                        <span className="ml-3 text-sm text-gray-600">
                          {newRating} star{newRating !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Share your thoughts about this product..."
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handleSubmitReview}
                        disabled={submitting}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 font-medium"
                      >
                        {submitting ? "Submitting..." : "Submit Review"}
                      </button>
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {review.CUSTOMERNAME?.charAt(0) || "U"}
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">{review.CUSTOMERNAME}</h5>
                            <div className="flex items-center space-x-2">
                              {renderStars(review.RATINGVALUE, "text-sm")}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.CREATEDAT
                            ? formatDistanceToNow(new Date(review.CREATEDAT), { addSuffix: true })
                            : ""}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">{review.COMMENTTEXT}</p>
                      <ReviewReplies reviewId={review.REVIEWID} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V18a2 2 0 01-2 2H9a2 2 0 01-2-2V8m8 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m8 0L13 4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">No reviews yet</p>
                  <p className="text-gray-400 text-sm">Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>

          {/* Purchase Section */}
          <div className="xl:col-span-3">
            <div className="sticky top-8">
              {/* Price & Purchase Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-indigo-600 mb-2">৳{product.PRICE}</p>
                  <div className="flex items-center justify-center space-x-2">
                    {product.QUANTITY > 0 ? (
                      <>
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-600 font-medium">In Stock</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="text-red-500 font-medium">Out of Stock</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    disabled={product.QUANTITY === 0}
                    className={`add-to-cart-btn w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      product.QUANTITY > 0
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={() => handleAddToCart(id)}
                  >
                    🛒 Add to Cart
                  </button>

                  <Link
                    to={`/order/${product.PRODUCTID}`}
                    className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 text-center block transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    🚀 Buy Now
                  </Link>
                </div>
              </div>

              {/* Store Information */}
              <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-lg p-8 border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    🏪
                  </div>
                  Store Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Store Name</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {product.STORENAME || "DeshiCart Store"}
                    </p>
                  </div>

                  {product.STOREDESCRIPTION && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">About Store</label>
                      <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200 shadow-inner">
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {product.STOREDESCRIPTION}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-indigo-200">
                    <div className="flex items-center text-green-700">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Delivered by DeshiCart</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div></>
  );
};

export default ProductPage;
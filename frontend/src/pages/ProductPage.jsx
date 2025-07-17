import React, { useState, useEffect } from "react";
import {useNavigate, useParams, Link } from "react-router-dom";
import API from "../Api";
import { CategoryContext } from "../context/CategoryContext"; // adjust path if needed
import { useContext } from "react";

const ProductPage = () => {
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState({});
  const [reviews, setReviews] = useState([]);
  const [path , setPath] = useState("");
  const { id } = useParams();
  const { categoryMap, loading } = useContext(CategoryContext);
  
  

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

  useEffect(()=>{
    let result = [];
    let current = categoryMap[product.CATEGORYID];
    while (current) {
      result.unshift(current.name); // insert at the beginning
      current = categoryMap[current.parentid];
    }
    setPath(result.join("->"));
  },[product]);

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
    
    // Refresh reviews
    const refreshed = await API.get(`/reviews/${id}`);
    setReviews(refreshed.data);

    //Refresh product to update the product rating
    const refreshedProduct = await API.get(`/products/${id}`);
    setProduct(refreshedProduct.data);
  } catch (err) {
    console.error("Failed to submit review", err);
    alert("❌ Failed to submit review.");
  } finally {
    setSubmitting(false);
  }
};


  const handleOrder = async () =>{
    try {
      const req = {
        productId: id,
        quantity: 1,
        price: product.PRICE
      };
      await API.post("/orders/add",req);
      alert("Order done successfully");
    } catch (err) {
      alert("Order failed");
    }
  }

  const handleAddToCart = async (productId) => {
    try {
      const quantity = 1;
      const res = await API.post("/customer/addcart", {
        productId,
        quantity
      });

      if (res.status === 200) {
        alert("✅ Added to cart!");
      } else {
        alert("❌ Failed to add to cart.");
      }
    } catch (err) {
      console.error("Error adding to cart", err);
      alert("❌ Error adding to cart.");
    }
  };

  return (
    <>
      <section className="bg-white">
        <div className="container mx-auto py-4 px-6">
          <Link to="/customer/products" className="text-sm text-indigo-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 px-6 py-10">
          {/* Image Column */}
          <div className="lg:col-span-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <img
                src={product.IMAGEURL || "/images/photo.png"}
                alt={product.NAME}
                className="w-full h-auto object-contain rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/photo.png";
                }}
              />
            </div>
          </div>

          {/* Middle Column: Details + Reviews */}
          <div className="lg:col-span-5 space-y-8">
            {/* Product Details Card */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                {product.NAME}
              </h1>

              <p className="text-sm text-gray-500 mb-2">
                Category:{" "}
                <span className="text-indigo-700 font-medium">
                  {path || "Uncategorized"}
                </span>
              </p>

              {product.AVERAGERATING && (
                <p className="text-yellow-600 font-medium text-sm mb-4">
                  ⭐ {product.AVERAGERATING.toFixed(1)} / 5 ({reviews.length} reviews)
                </p>
              )}

              <h3 className="text-lg font-semibold text-indigo-800 mt-6 mb-2">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.DESCRIPTION || "No description available."}
              </p>
            </div>

            
            <div className="bg-white p-6 rounded-lg shadow">
  <h3 className="text-xl font-semibold text-indigo-800 mb-4 border-b pb-2">
    Customer Reviews
  </h3>

  {reviews.length > 0 ? (
    <div
      className="space-y-4 max-h-[350px] overflow-y-auto overflow-x-hidden pr-2"
      style={{
        overflowWrap: "break-word",
        wordBreak: "break-word",
        wordWrap: "break-word",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {reviews.map((review, idx) => (
        <div
          key={idx}
          className="border-b pb-3"
          style={{
            overflowWrap: "break-word",
            wordBreak: "break-word",
            wordWrap: "break-word",
            maxWidth: "100%",
          }}
        >
          <p className="text-sm text-gray-800 font-medium">
  ⭐ {review.RATINGVALUE} — {review.CUSTOMERNAME}
</p>
<p
  className="text-gray-600 text-sm break-words whitespace-pre-wrap break-all"
  style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
>
  {review.COMMENTTEXT}
</p>
  </div>
      ))}
    </div>
  ) : (
    <p
  className="text-gray-500 italic break-words whitespace-pre-wrap break-all"
  style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
>
  No review yet 
</p>
  )}

  <hr className="my-4" />
<h4 className="text-md font-semibold text-gray-800 mb-2">Submit a Review</h4>

<div className="space-y-3">
  <select
    value={newRating}
    onChange={(e) => setNewRating(Number(e.target.value))}
    className="w-full border border-indigo-300 p-2 rounded-lg focus:ring-indigo-500"
  >
    {[5, 4, 3, 2, 1].map((val) => (
      <option key={val} value={val}>
        {val} Star{val > 1 && "s"}
      </option>
    ))}
  </select>

  <textarea
    value={newComment}
    onChange={(e) => setNewComment(e.target.value)}
    rows={4}
    className="w-full border border-gray-300 p-3 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500"
    placeholder="Write your review..."
  />

  <button
    onClick={handleSubmitReview}
    disabled={submitting}
    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
  >
    {submitting ? "Submitting..." : "Submit Review"}
  </button>
</div>
</div>


          </div>

         
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-lg shadow sticky top-20">
              <p className="text-2xl font-bold text-orange-600 mb-2">
                ৳{product.PRICE}
              </p>

              <p className="text-sm text-gray-700 mb-4">
                {product.QUANTITY > 0 ? (
                  <span className="text-green-600">In Stock</span>
                ) : (
                  <span className="text-red-500">Out of Stock</span>
                )}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  disabled={product.QUANTITY === 0}
                  className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                    product.QUANTITY > 0
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  onClick = {() => handleAddToCart(id)}
                >
                  Add to Cart
                </button>

                <Link
                  to={`/order/${product.PRODUCTID}`}
                    className="w-full py-2 rounded-lg text-white font-semibold bg-orange-500 hover:bg-orange-600 text-center block"
                >
                Place Order
                </Link>

              </div>

              <hr className="my-4" />

<div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 p-6 rounded-xl shadow mt-6">
  <h3 className="text-lg font-bold text-indigo-800 mb-3 flex items-center gap-2">
    🏬 Store Information
  </h3>

  <p className="text-sm text-gray-800 mb-1">
    <span className="font-semibold">Store Name:</span>{" "}
    {product.STORENAME || "N/A"}
  </p>
  <p className="text-sm text-gray-800 mb-1">
    <span className="font-semibold">Store Description:</span>{" "}
  </p>

  {product.STOREDESCRIPTION ? (
    <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-inner">
      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
        {product.STOREDESCRIPTION}
      </p>
    </div>
  ) : (
    <p className="text-sm text-gray-400 italic mt-1">No store description available.</p>
  )}

  <p className="text-green-700 text-xs mt-4 font-medium">
    Delivered by DeshiCart
  </p>
</div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductPage;

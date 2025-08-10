import React, { useEffect, useState } from "react";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"))?.user;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/history/user/${user._id}`);
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchHistory();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/history/delete/${id}`, {
        method: "DELETE",
      });
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete entry.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Analysis History</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : history.length === 0 ? (
        <p className="text-gray-600">No history found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {history.map((entry, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4 relative group">
              <img
                src={entry.imageUrl}
                alt="Analyzed"
                className="w-full h-48 object-cover rounded mb-4"
              />
              <p className="text-sm text-gray-600 mb-2">
                <strong>Date:</strong> {new Date(entry.date).toLocaleString()}
              </p>
              <ul className="list-disc text-sm text-gray-800 pl-5 mb-2">
                {Object.entries({ ...entry.summary.animal_counts, ...entry.summary.behaviors }).map(
                  ([key, value]) => (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  )
                )}
              </ul>
              <button
                onClick={() => handleDelete(entry._id)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm bg-white px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition"
              >
                ✕ Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;

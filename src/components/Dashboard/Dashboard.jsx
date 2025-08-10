// Dashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { Bar } from "react-chartjs-2";
import html2canvas from "html2canvas";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser.user);
    }
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.warn("Location access denied or unavailable:", err.message);
        }
      );
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const getAddress = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const data = await res.json();
      return data.city || data.locality || data.principalSubdivision || "Unknown";
    } catch {
      return "Unknown";
    }
  };

  const handleAnalyze = async () => {
    if (!imageFiles.length) {
      setError("Please select at least one image.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("images", file));

    if (location?.latitude && location?.longitude) {
      formData.append("latitude", location.latitude);
      formData.append("longitude", location.longitude);
    }
    formData.append("timestamp", Date.now().toString());

    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      const updatedResults = await Promise.all(
        (data.detected || []).map(async (result) => {
          const { location } = result;
          let address = null;
          let google_map_url = null;

          if (location?.latitude && location?.longitude) {
            address = await getAddress(location.latitude, location.longitude);
            google_map_url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
          }

          return {
            ...result,
            location: location ? { ...location, address, google_map_url } : null,
          };
        })
      );

      setResults(updatedResults);
      setSkipped(data.skipped || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const imageEl = document.getElementById(`img-${i}`);
      const chartEl = document.getElementById(`chart-${i}`);
      let y = 10;

      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text(`Animal Behavior Report - Image ${i + 1}`, 10, y);
      y += 10;

      if (imageEl && imageEl.src) {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = imageEl.src;

        await new Promise((resolve) => {
          image.onload = () => {
            const imgWidth = 180;
            const imgHeight = (image.height / image.width) * imgWidth;
            doc.addImage(image, "JPEG", 10, y, imgWidth, imgHeight);
            y += imgHeight + 10;
            resolve();
          };
          image.onerror = () => resolve();
        });
      }

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Summary:", 10, y);
      y += 6;

      const summary = [];

      if (result.location?.address) summary.push(`Located at: ${result.location.address}`);
      if (result.location?.latitude) summary.push(`Latitude: ${result.location.latitude}`);
      if (result.location?.longitude) summary.push(`Longitude: ${result.location.longitude}`);
      if (result.location?.google_map_url) summary.push(`Map: ${result.location.google_map_url}`);
      if (result.timestamp) {
        summary.push(`Date: ${new Date(Number(result.timestamp)).toLocaleDateString()}`);
        summary.push(`Time: ${new Date(Number(result.timestamp)).toLocaleTimeString()}`);
      }

      summary.push(
        ...Object.entries(result.summary.animal_counts).map(([k, v]) => `• ${k}: ${v}`),
        ...Object.entries(result.summary.behaviors).map(([k, v]) => `• ${k}: ${v}`)
      );

      summary.forEach((line) => {
        if (y > 270) {
          doc.addPage();
          y = 10;
        }
        doc.text(line, 12, y);
        y += 6;
      });

      if (chartEl) {
        const chartCanvas = await html2canvas(chartEl);
        const chartImg = chartCanvas.toDataURL("image/png");
        if (y > 190) {
          doc.addPage();
          y = 10;
        }
        doc.addImage(chartImg, "PNG", 10, y + 5, 180, 70);
      }

      if (i !== results.length - 1) doc.addPage();
    }

    doc.save("animal_analysis_report.pdf");
  };

  const getUserName = () => user?.name || user?.username || "User";

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/wildlife-1.jpg')" }}>
      <div className="flex justify-between items-center bg-white/70 backdrop-blur-md shadow p-4 rounded-md mx-4 mt-4">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {getUserName()}</h1>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">Logout</button>
      </div>

      <div className="flex items-center justify-center mt-10">
        <div className="bg-white/50 backdrop-blur-lg p-6 rounded shadow-md w-full max-w-2xl">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Upload Images for Analysis</h2>
          <div
            className="border-2 border-dashed border-gray-400 rounded-md p-6 bg-white/40 text-center hover:bg-white/60 transition cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setImageFiles(Array.from(e.dataTransfer.files));
            }}
          >
            <p className="text-gray-600 mb-2">Drag & drop images here</p>
            <p className="text-gray-500 text-sm">or</p>
            <label className="inline-block mt-2 cursor-pointer text-blue-700 font-semibold hover:underline">
              Choose files
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>
          </div>
          <button onClick={handleAnalyze} disabled={isLoading} className="mt-6 bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded">
            {isLoading ? "Analyzing..." : "Submit"}
          </button>
          {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-8 max-w-6xl mx-auto mt-12 px-4">
          {results.map((result, index) => (
            <div key={index} className="bg-white rounded shadow-md p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <img id={`img-${index}`} src={result.imageUrl} alt={`result-${index}`} className="w-full rounded object-contain max-h-96" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Summary for Image {index + 1}</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4">
                  {result.location?.address && <li>Located at: {result.location.address}</li>}
                  {result.location?.latitude && <li>Latitude: {result.location.latitude}</li>}
                  {result.location?.longitude && <li>Longitude: {result.location.longitude}</li>}
                  {result.location?.google_map_url && (
                    <li>
                      <a href={result.location.google_map_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        View on Map
                      </a>
                    </li>
                  )}
                  {result.timestamp && !isNaN(Number(result.timestamp)) && (
                    <>
                      <li>Date: {new Date(Number(result.timestamp)).toLocaleDateString()}</li>
                      <li>Time: {new Date(Number(result.timestamp)).toLocaleTimeString()}</li>
                    </>
                  )}
                  {Object.entries({ ...result.summary.animal_counts, ...result.summary.behaviors }).map(([key, value], i) => (
                    <li key={i}>{key}: {value}</li>
                  ))}
                </ul>
                <div id={`chart-${index}`}>
                  <Bar
                    data={{
                      labels: Object.keys({ ...result.summary.animal_counts, ...result.summary.behaviors }),
                      datasets: [
                        {
                          label: "Activity",
                          data: Object.values({ ...result.summary.animal_counts, ...result.summary.behaviors }),
                          backgroundColor: "rgba(75, 192, 192, 0.6)",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: true, text: `Animal Summary (Image ${index + 1})` },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="text-center mt-6">
            <button onClick={downloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">Download Summary PDF</button>
          </div>
        </div>
      )}

      {skipped.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mt-10 max-w-3xl mx-auto">
          <h4 className="font-semibold text-yellow-800">Skipped Files (No animals detected):</h4>
          <ul className="text-sm mt-2 text-yellow-700 list-disc list-inside">
            {skipped.map((filename, idx) => (
              <li key={idx}>{filename}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

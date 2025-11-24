import { useEffect, useState, useRef } from "react";
import { axiosInstance } from "../../axiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const Dashboard = () => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("access_token"));
  const [ticker, setTicker] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [plots, setPlots] = useState({});

  const controllerRef = useRef(null);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "access_token") setAccessToken(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isTickerValid = (s) => /^[A-Z0-9.\-]{1,10}$/.test(s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setData(null);
    setPlots({});
    const cleanedTicker = ticker.trim().toUpperCase();

    if (!cleanedTicker) return setError("Please enter a ticker.");
    if (!isTickerValid(cleanedTicker)) return setError("Invalid ticker format.");

    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/predict/",
        { ticker: cleanedTicker },
        {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
          signal: controller.signal,
        }
      );

      if (response.data?.error) {
        setError(response.data.error);
      } else {
        setData(response.data);
        const backEndRoot = import.meta.env.VITE_BACKEND_ROOT ?? "";

        const plotKeys = ["plot_img", "plot_moving_avg", "plot_prediction"];
        const newPlots = {};
        plotKeys.forEach((key) => {
          const plotImg = response.data[key];
          if (plotImg) {
            const isAbsolute = /^https?:\/\//i.test(plotImg);
            newPlots[key] = isAbsolute ? plotImg : `${backEndRoot}${plotImg}`;
          }
        });
        setPlots(newPlots);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch prediction. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderNext5DaysChart = (next5Days) => {
    if (!next5Days || !next5Days.length) return null;
    const labels = next5Days.map((_, i) => `Day ${i + 1}`);
    const chartData = {
      labels,
      datasets: [
        {
          label: "Next 5 Days Forecast",
          data: next5Days,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.3,
        },
      ],
    };
    const options = {
      responsive: true,
      plugins: { legend: { position: "top" }, title: { display: true, text: "Next 5 Days Forecast" } },
    };
    return <Line data={chartData} options={options} />;
  };

  return (
    <div className="container my-5">
      <div className="row">
        {/* Left column: form, metrics, current price, forecast */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">Stock Prediction Dashboard</h4>
              <form onSubmit={handleSubmit} className="mb-4">
                <input
                  type="text"
                  placeholder="Enter Stock Ticker (e.g. AAPL)"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  className="form-control mb-2"
                  disabled={loading}
                />
                {error && <div className="text-danger mb-2">{error}</div>}
                <button className="btn btn-info w-100" disabled={loading}>
                  {loading ? <><FontAwesomeIcon icon={faSpinner} spin /> Please wait...</> : "Get Prediction"}
                </button>
              </form>

              {data && (
                <>
                  <div className="mb-3">
                    <h5>Current Price: <span className="text-success">${data.current_price.toFixed(2)}</span></h5>
                  </div>

                  <div className="mb-3">
                    <h5>Model Metrics</h5>
                    <ul className="list-group list-group-flush">
                      <li className="list-group-item">MSE: {data.mse.toFixed(4)}</li>
                      <li className="list-group-item">RMSE: {data.rmse.toFixed(4)}</li>
                      <li className="list-group-item">R² Score: {data.r2.toFixed(4)}</li>
                    </ul>
                  </div>

                  <div className="mb-3">
                    {renderNext5DaysChart(data.next_5_days_prediction)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right column: plots */}
        <div className="col-lg-6">
          {Object.keys(plots).map((key) => (
            <div key={key} className="card shadow-sm mb-4">
              <div className="card-body">
                <h6 className="card-title">{key.replace("plot_", "").replace(/_/g, " ").toUpperCase()}</h6>
                <img src={plots[key]} alt={key} className="img-fluid rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const WorkerList = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/service-agent/workers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkers(res.data.data || []);
      } catch (err) {
        console.error("Error fetching workers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-indigo-700">Your Workers</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map((worker) => (
          <div key={worker._id} className="border rounded-lg p-4 shadow-sm bg-indigo-50 hover:shadow-md transition">
            <p className="font-semibold text-indigo-800">{worker.name}</p>
            <p className="text-sm text-gray-600">{worker.phone}</p>
            <p className="text-xs text-gray-500">{worker.address?.area}, {worker.address?.city}</p>
            <p className="mt-2 text-sm">
              Status:{" "}
              <span className="font-semibold text-green-600">
                {worker.workerProfile?.availabilityStatus || "available"}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerList;

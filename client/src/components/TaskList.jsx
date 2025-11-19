import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";


const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/api/service-agent/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data.data || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    const token = localStorage.getItem("token");
    await axiosInstance.put(`/api/service-agent/task/${id}/update`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(tasks.map(t => t._id === id ? { ...t, status } : t));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-indigo-700">Work Requests</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task._id} className="border p-4 rounded-lg shadow-sm bg-white">
            <p className="font-semibold text-indigo-800">{task.workerName}</p>
            <p className="text-sm text-gray-600">Customer: {task.customerName}</p>
            <p className="text-xs text-gray-500">Work: {task.jobType}</p>
            <p className="mt-2">Status: <span className="font-bold">{task.status}</span></p>

            <div className="flex gap-2 mt-3">
              <button onClick={() => handleStatusUpdate(task._id, "IN_PROGRESS")}>In Progress</button>
              <button onClick={() => handleStatusUpdate(task._id, "COMPLETED")} variant="secondary">Complete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;

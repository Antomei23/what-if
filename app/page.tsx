"use client";

import { useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setFeedback(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload-xes/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setData(response.data);
      setFeedback("Analysis completed successfully!");
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred while analyzing the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">What-if Analysis</h1>
        <p className="text-lg text-gray-600 mb-8">
          Upload an XES file and view simulation analysis results.
        </p>

        <div className="flex flex-col items-center gap-4 mb-6">
          <Button
            component="label"
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
          >
            Upload file
            <VisuallyHiddenInput
              type="file"
              accept=".xes"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  setData(null);
                  setFeedback(null);
                  setError(null);
                }
              }}
            />
          </Button>

          {selectedFile && (
            <div className="text-sm text-gray-700">
              File selected: <strong>{selectedFile.name}</strong>
            </div>
          )}

          <Button
            variant="contained"
            color="success"
            onClick={handleAnalyze}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <CircularProgress size={20} color="inherit" />
                Analyzing...
              </div>
            ) : (
              "Analyze"
            )}
          </Button>

          {feedback && (
            <Alert icon={<CheckCircleIcon fontSize="inherit" />} severity="success">
              {feedback}
            </Alert>
          )}
          {error && (
            <Alert icon={<ErrorIcon fontSize="inherit" />} severity="error">
              {error}
            </Alert>
          )}
        </div>

        {data && (
          <div className="mt-8 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Event Count Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.eventsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Event Types (Node Type)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.nodeTypeCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nodeType" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Case Durations</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.caseDurations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="traceId" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="duration" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Total Cost per Activity</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.costsByActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="activity" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_cost" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

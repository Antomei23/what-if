"use client";

import { useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from "recharts";
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

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

  const [showCycle, setShowCycle] = useState(true);
  const [showWaiting, setShowWaiting] = useState(true);
  const [showProcessing, setShowProcessing] = useState(true);

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setFeedback(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8000/all-graphs/", formData, {
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
          Upload an XES file and view activity analysis results.
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
          <div className="mt-8 w-full space-y-12">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Activity Duration Metrics (in Hours)
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.durations} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="activity"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={80}
                    label={{ value: "Activity", position: "insideBottom", offset: -60 }}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    label={{ value: "Duration (hours)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    formatter={(value: any, name: string) => [`${value.toFixed(2)} h`, name.replace("_", " ")]}
                    labelFormatter={(label) => `Activity: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="avg_duration" fill="#3b82f6" name="Avg Duration" />
                  <Bar dataKey="min_duration" fill="#10b981" name="Min Duration" />
                  <Bar dataKey="max_duration" fill="#ef4444" name="Max Duration" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-600 mt-4">
                Chart showing min, avg, and max durations per activity for each trace.
              </p>
            </div>

            {data.breakdown && (
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Time Breakdown per Activity (Avg in Hours)
                </h2>

                <FormGroup row className="mb-4 justify-center">
                  <FormControlLabel control={<Checkbox checked={showCycle} onChange={() => setShowCycle(!showCycle)} />} label="Cycle Time" />
                  <FormControlLabel control={<Checkbox checked={showWaiting} onChange={() => setShowWaiting(!showWaiting)} />} label="Waiting Time" />
                  <FormControlLabel control={<Checkbox checked={showProcessing} onChange={() => setShowProcessing(!showProcessing)} />} label="Processing Time" />
                </FormGroup>

                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.breakdown} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="activity"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={80}
                      label={{ value: "Activity", position: "insideBottom", offset: -60 }}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      label={{ value: "Duration (hours)", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => [`${value.toFixed(2)} h`, name.replace("_", " ")]}
                      labelFormatter={(label) => `Activity: ${label}`}
                    />
                    <Legend />
                    {showCycle && <Bar dataKey="avg_cycle_time" fill="#3b82f6" name="Cycle Time" />}
                    {showWaiting && <Bar dataKey="avg_waiting_time" fill="#f59e0b" name="Waiting Time" />}
                    {showProcessing && <Bar dataKey="avg_processing_time" fill="#10b981" name="Processing Time" />}
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 mt-4">
                  Chart showing average cycle, waiting, and processing times per activity for each trace.
                </p>
              </div>
            )}
              {data.bottleneck && (
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Bottleneck Analysis (Heatmap of Waiting Times Between Activities in Minutes)
                  </h2>
                  <div className="overflow-auto max-w-full">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-100 sticky top-0 z-10">
                          <th className="border px-2 py-1 text-left">Trace ID</th>
                          {Array.from(new Set(data.bottleneck.map((r: any) => r.activity))).map((act) => (
                            <th key={String(act)} className="border px-2 py-1 text-center">{String(act)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(new Set(data.bottleneck.map((r: any) => r.traceId))).map((traceId) => {
                          const row = data.bottleneck.filter((r: any) => r.traceId === traceId);
                          const rowData: Record<string, number> = {};
                          row.forEach((r: any) => {
                            rowData[r.activity] = r.wait_time;
                          });
                          const max = Math.max(...data.bottleneck.map((r: any) => r.wait_time)) || 1;

                          return (
                            <tr key={String(traceId)}>
                              <td className="border px-2 py-1 font-medium text-left">{String(traceId)}</td>
                              {Array.from(new Set(data.bottleneck.map((r: any) => r.activity))).map((act) => {
                                const value = rowData[String(act)];
                                const ratio = value !== undefined ? value / max : 0;
                                const background = value === undefined
                                  ? "#f3f4f6"
                                  : `hsl(${(1 - ratio) * 120}, 80%, 50%)`; // verde → rosso
                                const textColor = value === undefined ? "#000" : "#fff";
                                return (
                                  <td
                                    key={String(act)}
                                    className="border px-2 py-1 text-center"
                                    style={{ backgroundColor: background, color: textColor }}
                                  >
                                    {value !== undefined ? value.toFixed(1) : ""}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Heatmap with activities (on X-axis) and trace IDs (on Y-axis). <br></br> Colors range from green (short wait) to red (long wait), normalized to the maximum value.
                  </p>
                </div>

            )}
          </div>
        )}
      </div>
    </div>
  );
}

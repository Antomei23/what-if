"use client";

import { useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis,ZAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, PieChart, Pie, Cell, ScatterChart, Scatter} from "recharts";
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


const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a0522d", "#8a2be2", "#ff1493", "#00ced1", "#ffa500", "#228b22"];
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
  const [warnings, setWarnings] = useState<string[]>([]);
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
      setWarnings(response.data.warnings || []);
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
          {warnings.length > 0 && warnings.map((w, i) => (
            <Alert key={i} severity="warning" icon={<ErrorIcon fontSize="inherit" />}>
              {w}
            </Alert>
        ))}
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
                  <br></br>Note that will be shown only those activities for which are present both ASSIGN and COMPLETE information.
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
                  <br></br>Note that will be shown only those activities for which are present both ASSIGN and COMPLETE information.
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
                    <br></br>Note that will be shown only those activities for which are present both ASSIGN and COMPLETE information.
                  </p>
                </div>
              
            )}
            {data.costs && (
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Cost Analysis per Activity (Fixed vs Variable)
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={data.costs}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    stackOffset="sign"
                  >
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
                      label={{ value: "Average Cost (€) ", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => [`€${value.toFixed(2)}`, name.replace("_", " ")]}
                    />
                    <Legend 
                    layout="vertical"
                    verticalAlign="top"
                    align="right"
                    iconType="square"
                    />
                    <Bar dataKey="avg_fixed_cost" stackId="a" fill="#60a5fa" name="Fixed Cost" />
                    <Bar dataKey="avg_variable_cost" stackId="a" fill="#facc15" name="Variable Cost" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 mt-4">
                  Each bar represents the average fixed and variable costs of an activity for each trace the activity is present.
                </p>
              </div>
            )}
            
            {data.itemCosts && data.itemCosts.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Average Cost per Item Type
                </h2>
                <div className="flex justify-center">
                <div style={{ width: "100%", maxWidth: 600, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.itemCosts}
                          dataKey="avg_item_cost"
                          nameKey="instanceType"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}        
                          label={({ percent, payload }) =>
                            `${payload.instanceType}: ${(percent * 100).toFixed(1)}% (€${payload.avg_item_cost.toFixed(0)})`
                          }                          
                        >
                        {data.itemCosts.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any, name: string) => [`€${value.toFixed(2)}`, "Avg Cost"]}
                          labelFormatter={(label) => `Item: ${label}`}
                        />
                        <Legend
                          layout="vertical"
                          verticalAlign="top"
                          align="right"
                          iconType="square"
                          formatter={(value, entry, index) => (
                            <span style={{ color: COLORS[index % COLORS.length] }}>{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Distribution of average total production costs per item type.
                </p>
              </div>
            )}

            {data.resource_bubble && data.resource_bubble.length > 0 && (() => {
              const usageCounts = data.resource_bubble.map((d: any) => d.usage_count);
              const minUsage = Math.min(...usageCounts);
              const maxUsage = Math.max(...usageCounts);

              const getBubbleColor = (usage: number) => {
                const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));
                if (maxUsage === minUsage) return "#0000ff"; // fallback blu
              
                const ratio = clamp((usage - minUsage) / (maxUsage - minUsage), 0, 1);
              
                // Interpolazione RGB: blu (#0000ff) → rosso (#ff0000)
                const r = Math.round(255 * ratio);
                const g = 0;
                const b = Math.round(255 * (1 - ratio));
              
                return `rgb(${r},${g},${b})`;
              };

              return (
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Resource Usage and Average Cost
                  </h2>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid />
                      <XAxis
                        type="category"
                        dataKey="resource"
                        name="Resource"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        label={{ value: "Resource", position: "insideBottom", offset: -50 }}
                      />
                      <YAxis
                        type="number"
                        dataKey="avg_cost"
                        name="Average Cost (€)"
                        label={{ value: "Avg Cost (€)", angle: -90, position: "insideLeft" }}
                      />
                      <ZAxis type="number" dataKey="usage_count" range={[60, 400]} name="Usage Count" />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value: any, name: string) => {
                          if (name === "avg_cost") {
                            return [`€${Number(value).toFixed(2)}`, "Avg Cost"];
                          } else if (name === "usage_count") {
                            return [`${value}`, "Usage Count"];
                          } else {
                            return [String(value), name];
                          }
                        }}
                        labelFormatter={(label) => `Resource: ${label}`}
                      />
                      <Scatter name="Resources" data={data.resource_bubble}>
                        {data.resource_bubble.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getBubbleColor(entry.usage_count)}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>

                  {/* Scala colore sotto il grafico */}
                  <div className="flex justify-center mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Low usage</span>
                      <div style={{
                        background: 'linear-gradient(to right, hsl(240, 70%, 50%), hsl(0, 70%, 50%))',
                        width: 200,
                        height: 15,
                        borderRadius: 4
                      }} />
                      <span className="text-sm text-gray-700">High usage</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-4 text-center">
                    Bubble size reflects usage count; bubble color ranges from blue (low usage) to red (high usage).<br></br>
                    Cost and usage of resources are referred to the average cost and usage for each traceId.
                  </p>
                </div>
              );
            })()}
            


            

          </div>
          
        )}
      </div>
    </div>
  );
}

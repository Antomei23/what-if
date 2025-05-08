"use client";

import { useState } from "react";
import axios from "axios";
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// import dei components (i vari grafici)
import DurationChart from "@/components/durationChart";
import BreakdownChart from "@/components/timeBreakdownChart";
import BottleneckHeatmap from "@/components/bottleneckChart";
import CostChart from "@/components/activityCost";
import ItemCostPieChart from "@/components/itemCost";
import ResourceUsageBubble from "@/components/resourceCostAndUsage";
import SummaryTable from "@/components/simSummary";
import ItemDurationPieChart from "@/components/ItemDurationPieChart"; 



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
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };  
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
        

        {data?.simulation_summary && <SummaryTable data={data.simulation_summary} />}
        {data?.durations && data.durations.length > 0 && <DurationChart data={data.durations} />}
        {data?.durations && data.durations.length > 0 && <DurationChart data={data.durations} />}
        {data?.bottleneck && data.bottleneck.length > 0 && <BottleneckHeatmap data={data.bottleneck} />}
        {data?.costs && data.costs.length > 0 && <CostChart data={data.costs} />}
        {data?.itemCosts && data.itemCosts.length > 0 && <ItemCostPieChart data={data.itemCosts} />}
        {data?.itemDurations && data.itemDurations.length > 0 && <ItemDurationPieChart data={data.itemDurations} />}
        {data?.resource_bubble && data.resource_bubble.length > 0 && <ResourceUsageBubble data={data.resource_bubble} />}

        
        <div style={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          zIndex: 1000
        }}>
          <Fab color="primary" size="large" onClick={handleScrollTop} aria-label="scroll to top">
            <KeyboardArrowUpIcon />
          </Fab>
        </div>

      </div>
      </div>
  
);
}

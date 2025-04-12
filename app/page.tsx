"use client";

import { useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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

  //const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //  setSelectedFile(event.target.files?.[0] || null);
  //};

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload-xes/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">What-if Analysis</h1>

      <div className="flex flex-col items-center gap-4 mb-8">
        <p className="text-lg">Upload your XES file to analyze the simulations</p>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Upload files
          <VisuallyHiddenInput
            type="file"
            accept=".xes"
            onChange={(event) => console.log(event.target.files)}
            multiple
          />
        </Button>
      </div>

      {data && (
        <div className="w-full max-w-4xl bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Activities Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.events}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="activity" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

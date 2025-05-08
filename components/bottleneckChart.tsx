
export default function BottleneckHeatmap({ data }: { data: any }) {
  return (
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    Bottleneck Analysis (Heatmap of Waiting Times Between Activities in Minutes)
                  </h2>
                  <div className="overflow-auto max-w-full">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-100 sticky top-0 z-10">
                          <th className="border px-2 py-1 text-left">Trace ID</th>
                          {Array.from(new Set(data.map((r: any) => r.activity))).map((act) => (
                            <th key={String(act)} className="border px-2 py-1 text-center">{String(act)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(new Set(data.map((r: any) => r.traceId))).map((traceId) => {
                          const row = data.filter((r: any) => r.traceId === traceId);
                          const rowData: Record<string, number> = {};
                          row.forEach((r: any) => {
                            rowData[r.activity] = r.wait_time;
                          });
                          const max = Math.max(...data.map((r: any) => r.wait_time)) || 1;

                          return (
                            <tr key={String(traceId)}>
                              <td className="border px-2 py-1 font-medium text-left">{String(traceId)}</td>
                              {Array.from(new Set(data.map((r: any) => r.activity))).map((act) => {
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
              
            );
        }